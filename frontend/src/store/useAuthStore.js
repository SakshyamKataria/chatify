import {create} from 'zustand';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const baseURL = "http://localhost:3000"; // Replace with your backend URL

export const useAuthStore = create((set, get) => ({  //setter and getter arguments, mostly we use setter
    authUser: null,
    isCheckingAuth: true,
    isSigningUp : false,
    isLoggingIn : false,
    isUpdatingProfile : false,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try{
            const res = await axiosInstance.get('/auth/check');
            set({authUser: res.data});

            get().connectSocket(); //connect to socket after successful signup

        }catch(error){
            console.error("Error checking auth:", error);
            set({authUser: null});
        }finally{
            set({isCheckingAuth: false});
        }
    },

    signup : async (data) => {
        set({isSigningUp: true});
        try{
            //we will call the signup api 
            const res = await axiosInstance.post("auth/signup",data);
            //set the authUser with returned data
            set({authUser:res.data});

            //toast notification can be added here for success
            toast.success("Sign up successful!");
        }catch(error){
            toast.error(error.response?.data?.message || "Sign up failed!");
        }finally{
            set({isSigningUp: false});
        }
    },

    login : async (data) => {
        set({isLoggingIn: true});
        try{
            //we will call the signup api 
            const res = await axiosInstance.post("auth/login",data);
            //set the authUser with returned data
            set({authUser:res.data});

            get().connectSocket(); //connect to socket after successful login

            //toast notification can be added here for success
            toast.success("Logged in successfully");
        }catch(error){
            toast.error(error.response?.data?.message || "Login failed!");
        }finally{
            set({isLoggingIn: false});
        }
    },

    logout : async () => {
        try{
            await axiosInstance.post("auth/logout");
            set({authUser: null});
            toast.success("Logged out successfully");

            get().disconnectSocket(); //disconnect socket on logout
        }catch(error){
            toast.error("Logout failed!");
        }
    },

    updateProfile : async (data) => {
        //you could also add a loading state here
        set({isUpdatingProfile: true});
        try{
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({authUser:res.data});
            toast.success("Image uploaded successfully");
        }catch(error){
            console.log("Error uploading image");
            toast.error(error.response?.data?.message || "Profile update failed!");
        }finally{
            set({isUpdatingProfile: false});
        }
    },

    //we will use this function to set the socket instance in our store when the user logs in or signs up successfully.
    // This way, we can access the socket instance from any component that uses the auth store.
    connectSocket : () => {
        const {authUser} = get(); //get the current authUser from the store
        if(!authUser || get().socket?.connected) return;

        const socket = io(baseURL, {
            withCredentials: true, //to send cookies with requests
        });
        socket.connect();

        set({socket});

        //listen for online users update from the server and update the onlineUsers state in the store
        socket.on("getOnlineUsers", (userIds) => {
            set({onlineUsers: userIds})
        })
    },

    disconnectSocket : () => {
        const {socket} = get();
        if(socket?.connected){
            socket.disconnect();
        }
    }

}));