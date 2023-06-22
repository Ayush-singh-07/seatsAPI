import express from 'express';
import connectDB from './DB/connectDB.js';
import router from './routes/api.js'
import dotenv from 'dotenv';
import bodyParser from 'body-parser';


dotenv.config();
const app = express();
// app.use(express.json());
app.use(bodyParser.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use("/api", router);


try{
    await connectDB(process.env.DB_URL);
    console.log("Connected to DB");
}
catch(ex){
    console.log("exception: "+ex);
}






const PORT = process.env.PORT || 9000;
app.listen(PORT, ()=>{
    console.log("server is running on port: "+PORT);
})

