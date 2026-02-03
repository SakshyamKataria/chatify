import express from 'express';
import { getAllContacts, getMessagesByUserId, sendMessage, getChatPartners } from '../controllers/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectRoute); //we would have added arcjetProjection to this but mine is not working for some reason

//the order of the routes matters here as router.get('/:id') can conflict with router.get('/contacts')

//get all contacts
router.get('/contacts', getAllContacts);
//get chat with whom we have chatted before
router.get('/chats', getChatPartners);
// //get chats with specific user
router.get('/:id', getMessagesByUserId);
// //send message to specific user
router.post('/send/:id', sendMessage);


export default router;