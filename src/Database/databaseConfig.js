import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Database connected Successfully")
    } catch (error) {
        console.log("Error Connecting the Database: ", error)
    }
}

export default connectDb;
