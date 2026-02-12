import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

const notificationSound = new Audio('/sounds/notification.mp3'); // Assuming the sound file is in the public folder
// store the handler so we can remove the exact same function when unsubscribing
let newMessageHandler = null;

export const useChatStore = create((set,get) => ({
    allContacts : [],
    chats: [],
    messages: [],
    activeTab: 'chats',
    selectedUser : null,
    isUserLoading : false,
    isMessagesLoading : false,
    isSoundEnabled : JSON.parse(localStorage.getItem('isSoundEnabled')) === true,

    toggleSound : () => {
        localStorage.setItem('isSoundEnabled', !(get().isSoundEnabled));
        set({isSoundEnabled : !(get().isSoundEnabled) });
    },

    setActiveTab : (tab) => set({activeTab:tab}),
    setSelectedUser : (selectedUser) => set({selectedUser}),

    getAllContacts : async () => {
        set({isUserLoading:true});
        try{
            const res = await axiosInstance.get('/messages/contacts');
            set({allContacts : res.data});
        }catch(error){
            toast.error(error.response.data.message)
        }finally{
            set({isUserLoading:false});
        }
    },

    getMyChatPartners : async () => {
        set({isUserLoading:true});
        try{
            const res = await axiosInstance.get('/messages/chats');
            set({chats : res.data});
        }catch(error){
            toast.error(error.response.data.message)
        }finally{
            set({isUserLoading:false});
        }
    },

    getMessagesByUserId : async (userId) => {
        set({isMessagesLoading:true});
        try{
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({messages : res.data});
        }catch(error){
            toast.error(error.response?.data?.message || "Failed to fetch messages");
        }finally{
            set({isMessagesLoading:false});
        }
    },

    sendMessage : async (messageData) => {
        const { selectedUser } = get();
        const { authUser } = useAuthStore.getState();

        const tempId = `temp-${Date.now()}`;

        const optimisticMessage = {
            _id: tempId,
            senderId: authUser._id,
            recieverId: selectedUser._id,
            text: messageData.text,
            image: messageData.image,
            createdAt: new Date().toISOString(),
            isOptimistic: true
        };

        // add optimistic message using the latest store state
        set({ messages: get().messages.concat(optimisticMessage) });

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            // replace optimistic message with the server message
            set({ messages: get().messages.map(m => (m._id === tempId ? res.data : m)) });
        } catch (error) {
            // remove optimistic message on error
            set({ messages: get().messages.filter(m => m._id !== tempId) });
            toast.error(error?.response?.data?.message || "Failed to send message");
        }
    },

    subscribeToNewMessages : () => {
        const {selectedUser, isSoundEnabled} = get();

        if(!selectedUser) return; // If no user is selected, we don't want to subscribe to new messages
        const socket = useAuthStore.getState().socket; // use static getter to avoid calling a hook here
        if (!socket) return;

        // create a named handler so we can remove it precisely later
        const handler = (newMessage) => {
            const isMessageSentBySelectedUser = String(newMessage.senderId) === String(selectedUser._id);
            if(!isMessageSentBySelectedUser){
                return;
            }
            if (newMessage.senderId === selectedUser._id) {
                set({ messages: [...get().messages, newMessage] });

                if (isSoundEnabled) {
                    notificationSound.currentTime = 0;
                    notificationSound.play().catch(e => console.log("Failed to play notification sound:", e));
                }
            }
        };

        newMessageHandler = handler;
        socket.on('newMessage', handler);
    },

    unsubscribeFromNewMessages : () => {
        const socket = useAuthStore.getState().socket; // Get the socket instance from the store
        if (!socket || typeof socket.off !== 'function') return;
        if (newMessageHandler) {
            socket.off('newMessage', newMessageHandler);
            newMessageHandler = null;
        } else {
            socket.off('newMessage');
        }
    }

}))