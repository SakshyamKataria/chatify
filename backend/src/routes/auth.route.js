import express from 'express';
import { signup,login,logout } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);

router.post('/login', login);
//it's best practice to use post method for logout too
router.post('/logout', logout);

export default router;