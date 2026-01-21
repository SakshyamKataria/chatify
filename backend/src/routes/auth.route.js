import express from 'express';
import { signup,login,logout, updateProfile } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);

router.post('/login', login);
//it's best practice to use post method for logout too
router.post('/logout', logout);
//protectRoute middleware to ensure only authenticated users can access this route
router.put('/update-profile', protectRoute , updateProfile);
//auth get request to check if user is authenticated or not maybe after random refreshes of the page on frontend
router.get('/check', protectRoute, (req,res) => {
    return res.status(200).json({message: 'User is authenticated', user: req.user});
})

export default router;