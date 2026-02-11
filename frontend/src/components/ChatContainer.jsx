import React, { useEffect, useRef } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore';
import ChatHeader from './ChatHeader';
import NoChatHistoryPlaceholder from './NoChatHistoryPlaceholder';
import MessageInput from './MessageInput';
import MessagesLoadingSkeleton from './MeassgesLoadingSkeleton';


const ChatContainer = () => {
  const {selectedUser, getMessagesByUserId, messages, isMessagesLoading} = useChatStore();
  const {authUser} = useAuthStore();

  const messageEndRef = useRef(null);

  //this useEffect will scroll to the bottom of the chat container every time messages change,
  // so that the latest message is always visible to the user.
  //Why you need this:

  // scrollIntoView() is a DOM method that needs direct access to the actual element
  // You can't use state because state is async and causes re-renders
  // You need a synchronous, direct reference that persists - that's exactly what useRef provides

  // The key difference from state:
  // State: Updates cause re-renders and are async
  // useRef: Updates don't cause re-renders and give you direct DOM access
  useEffect(()=>{
    if(messageEndRef.current){
      messageEndRef.current.scrollIntoView({behavior: 'smooth'}); //smooth scroll to the bottom of the chat container when messages change
    }
  },[messages]);

  useEffect(()=>{
    if(selectedUser){
      getMessagesByUserId(selectedUser._id);
    }
  },[selectedUser, getMessagesByUserId]);

  return (
    <>
      <ChatHeader />
      <div className='flex-1 overflow-y-auto py-8'>
        {messages.length > 0 && !isMessagesLoading ? (
          <div className='max-w-3xl mx-auto space-y-6'>
            {messages.map((msg) => (
              <div key={msg._id} className={`chat ${String(msg.senderId) === String(authUser?._id) ? 'chat-end' : 'chat-start'}`}>
                
                <div className={`chat-bubble relative 
                  ${String(msg.senderId) === String(authUser?._id) 
                  ? 'bg-cyan-600 text-white' 
                  : 'bg-slate-800 text-slate-200'}`}
                >
                  {/*Show image if image is sent or text if text is sent */}
                  {msg.image && (
                    <img src={msg.image} alt="Shared" className="rounded-lg h-48 object-cover" />
                  )}
                  {msg.text && <p className="mt-2">{msg.text}</p>}
                  {/* Shows time when message was created*/}
                  <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {/* This empty div is used as a reference point to scroll to the bottom of the chat container when new messages arrive. */}
            <div ref={messageEndRef}></div>
          </div>
        ) : isMessagesLoading ? <MessagesLoadingSkeleton /> : (
          <NoChatHistoryPlaceholder name={selectedUser?.username} />
        )}
      </div>

      <MessageInput />

    </>
  )
}

export default ChatContainer
