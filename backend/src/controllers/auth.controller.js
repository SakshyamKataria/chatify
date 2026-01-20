import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import {generateToken} from '../lib/utils.js';

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
            const savedUser = await newUser.save();
            generateToken(savedUser._id,res);
            return res.status(201).json({message: 'User created successfully'});
        }else{
            return res.status(400).json({message: 'Invalid user data'});
        }

    }catch(err){
        console.log(`signup error: ${err.message}`);
        return res.status(500).json({message: 'Server error during signup'});
    }
}