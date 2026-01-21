import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import {generateToken} from '../lib/utils.js';
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import cloudinary from '../lib/cloudinary.js';
import dotenv from 'dotenv';

dotenv.config();

export const signup = async (req,res) => {
    const {fullName,email,password} = req.body;
    try{
        if(!fullName || !email || !password){
            return res.status(400).json({message: 'All fields are required'});
        }
        if(password.length < 6){
            return res.status(400).json({message: 'Password must be atleat 6 characters long'});
        }
        //check if email is valid
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({message: 'Please enter a valid email address'});
        }
        //check if user already exists
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({message: 'User already exists'});
        }

        //all test passed, hash password and create user
        const salt =  await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        //make new user
        const newUser = new User({
            username:fullName,
            email,
            password:hashedPassword
        })
        if(newUser){
            //authenticate user
            generateToken(newUser._id,res);
            await newUser.save();
            
            //send welcome email to user
            try{
                await sendWelcomeEmail(email,fullName,process.env.CLIENT_URL);
            }catch(err){
                console.error(`Failed to send welcome email to ${email}: ${err.message}`);
            }
            return res.status(201).json({message: 'User created successfully'});
        }else{
            return res.status(400).json({message: 'Invalid user data'});
        }

    }catch(err){
        console.log(`signup error: ${err.message}`);
        return res.status(500).json({message: 'Server error during signup'});
    }
}

export const login = async (req,res) => {
    const {email,password} = req.body;
    try{
        if(!email || !password){
            return res.status(400).json({message: 'All fields are required'});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: 'Invalid credentials'});
        }
        const isPasswordCorrect = await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message: 'Invalid credentials'});
        }
        //credentials are correct, generate token
        generateToken(user._id,res);
        return res.status(200).json({
            id : user._id,
            username: user.username,
            email: user.email,
            profilePic: user.profilePic
        });
    }catch(err){
        console.log(`login error: ${err.message}`);
        res.status(500).json({message: 'Server error during login'});
    }
}

export const logout = (_,res) => {
    //basically here we just have to get rid of the token cookies
    //we wrote 'jwt' in res.cookie because we wrote 'jwt' in generateToken function in utils.js
    res.cookie('jwt','',{maxAge: 0});
    return res.status(200).json({message: 'Logged out successfully'});
}

export const updateProfile = async (req,res) => {
    try{
        const {profilePic} = req.body;
        if(!profilePic){
            return res.status(400).json({message: 'Profile picture is required'});
        }

        const user = req.user._id; //from protectRoute middleware
        //upload profile picture to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        //update user's profilePic field in database
        await User.findByIdAndUpdate(user, {profilePic: uploadResponse.secure_url}, {new: true});

        return res.status(200).json({message: 'Profile updated successfully', profilePic: uploadResponse.secure_url});

    }catch(err){
        console.log(`updateProfile error: ${err.message}`);
        return res.status(500).json({message: 'Server error during profile update'});
    }
}