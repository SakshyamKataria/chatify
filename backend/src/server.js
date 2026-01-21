import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import path from 'path';
import cookieParser from 'cookie-parser';
import {connectDB} from './lib/db.js';

const app = express();

const __dirname = path.resolve();

dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(express.json()); //to get user's input ie res.body
app.use(cookieParser()); //to parse cookies
app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

//make ready for deployment
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));

    app.get('*', (req,res) => {
        res.sendFile(path.resolve(__dirname, '../frontend','dist','index.html'));
    })
}

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    connectDB();
})