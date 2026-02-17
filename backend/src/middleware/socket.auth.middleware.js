import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

export const socketAuthMiddleware = async (socket, next) => {
    try{
        //extract token from http-only cookies
        const token = socket.handshake.headers.cookie?.split('; ')
            .find(row => row.startsWith('jwt='))
            ?.split('=')[1];

        if(!token){
            console.log('Socket authentication failed: Token missing');
            return next(new Error('Not authorized, token missing'));
        }

        //verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            console.log('Socket authentication failed: Token invalid');
            return next(new Error('Not authorized, token invalid'));
        }

        //token is valid, get user from token
        const user = await User.findById(decoded.userId).select('-password');
        if(!user){
            return next(new Error("Not authorized, user not found"));

        }

        //attach user to socket object so that it can be accessed in socket event handlers
        socket.user = user;
        socket.userId = user._id.toString(); // Attach userId as a string for easier use in socket event handlers

        console.log(`Socket authenticated successfully for user: ${user.username} (${user._id})`);

        next(); // Call next() to allow the connection to proceed without authentication

    }catch(error){
        console.log(`Socket authentication error: ${error.message}`);
        return next(new Error('Server error during socket authentication'));
    }
};