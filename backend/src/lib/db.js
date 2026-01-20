import mongoose from 'mongoose';

export const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }catch(err){
        console.error(`mongoose connectionError: ${err.message}`);
        process.exit(1); //1 means failure
    }
}