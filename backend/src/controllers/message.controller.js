import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

export const getAllContacts = async (req, res) => {
    // Implementation for fetching all contacts
    try{
        //we are filtering out the logged in user from the contacts list coz we don't want to see ourselves in the contacts
        const loggedInUserId = req.user._id; 
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}).select('-password'); //excluding password field
        res.status(200).json(filteredUsers);
    }catch(error){
        res.status(500).json({message: 'Server error while fetching contacts'});
    }

}

export const getMessagesByUserId = async (req, res) => {
    try{
        // Implementation for fetching messages by user ID
        const {id:userToChatId} = req.params; //id of the user we are chatting with
        const myId = req.user._id; //id of the logged in user
        const messages = await Message.find({ //either sent by me or received by me
            $or: [
                {senderId: myId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: myId}
            ]
        }).sort({createdAt: 1});
        res.status(200).json(messages);
    }catch(error){
        console.error(error);
        res.status(500).json({message: 'Server error while fetching messages'});
    }
    
}

export const sendMessage = async (req, res) => {
    try{
        // Implementation for sending a message
        const {id:receiverId} = req.params; //id of the user to whom we are sending the message
        const senderId = req.user._id; //id of the logged in user
        const {text, image} = req.body;

        let imageUrl;
        if(image){
            //upload base64 to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl
        });
        await newMessage.save();

        // todo: send message in real-time if user is online using socket.io
        const recieverSocketId = getReceiverSocketId(receiverId);
        if(recieverSocketId){
            io.to(recieverSocketId).emit('newMessage', newMessage);
        }

        res.status(201).json(newMessage);
    }catch(error){
        console.error(error);
        res.status(500).json({message: 'Server error while sending message'});
    }
}

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // find all the messages where the logged-in user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};