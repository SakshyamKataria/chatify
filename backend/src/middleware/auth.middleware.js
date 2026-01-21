import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

export const protectRoute = async (req, res, next) => {
    try{
        //check for token in cookies first
        //only possible if cookie-parser middleware is used in server.js
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({message: 'Not authorized, token missing'});
        }
        //check token validity
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //if token is invalid, jwt.verify will throw an error
        if(!decoded){
            return res.status(401).json({message: 'Not authorized, token invalid'});
        }
        //token is valid, get user from token
        const user = await User.findById(decoded.userId).select('-password');
        if(!user){
            return res.status(401).json({message: 'Not authorized, user not found'});
        }
        //attach user to request object so that next middleware/controller can use it
        req.user = user;
        next();
    }catch(err){
        console.log(`protectRoute error: ${err.message}`);
        return res.status(500).json({message: 'Server error during authentication'});
    }
}