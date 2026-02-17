import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import path from 'path';
import cookieParser from 'cookie-parser';
import {connectDB} from './lib/db.js';
import cors from "cors";
import { app, server } from './lib/socket.js';

// const app = express();

const __dirname = path.resolve();

dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(cors({origin:process.env.CLIENT_URL, credentials:true})); //basically says allow frontend to send cookies to backend
app.use(express.json({limit:"5mb"})); //to get user's input ie res.body
app.use(cookieParser()); //to parse cookies
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

//make ready for deployment
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    app.get('*', (req,res) => {
        res.sendFile(path.resolve(__dirname, '../frontend','dist','index.html'));
    })
}

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
});
