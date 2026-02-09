import React, { useEffect } from 'react'
import { useChatStore } from '../store/useChatStore.js';
import UserLoadingSkeleton from './UserLoadingSkeleton.jsx';
import NoChatsFound from './NoChatsFound.jsx';


const ChatsList = () => {
  const {getMyChatPartners,chats,isUserLoading,setSelectedUser} = useChatStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if(isUserLoading) return <UserLoadingSkeleton />
  if(chats.length === 0) return <NoChatsFound />

  return (
    <div>
      {chats.map((chat) => (
        <div key={chat._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(chat)}
        >

          <div className="flex items-center gap-3">
            {/*TODO: Fix this hard coded 'online' with dynamic status using Socket.io */}
            <div className={`avatar online`}>
              <div className="size-12 rounded-full">
                <img src={chat.profilePic || "/avatar.png"} alt={chat.username} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">{chat.username}</h4>
          </div>
          
        </div>
      ))}
    </div>
  )
}

export default ChatsList
