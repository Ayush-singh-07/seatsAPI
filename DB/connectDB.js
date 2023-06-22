import mongoose from "mongoose";

async function connectDB (DB_URL){
    mongoose.connect(DB_URL)
};



export default connectDB;