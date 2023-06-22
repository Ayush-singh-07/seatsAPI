import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
    seat_ids: {
        required: true,
        type: [Number],
    },
    booking_id: {
        required: true,
        type: String,
    },
    name:{
        required: true,
        type: String,
    },
    phone:{
        required: true,
        type: String,
    },
    total_price:{
        required: true,
        type: Number,
    }
})


const seatClassSchema = new mongoose.Schema({
    id: Number,
    seat_identifier: String,
    seat_class: String,
    is_booked: Boolean
  });

  const seatPriceSchema = new mongoose.Schema({
    id: Number,
    seat_class: String,
    min_price: String,
    normal_price: String,
    max_price: String
  });

const seats =  new mongoose.model('seats', seatClassSchema);
const seatprice = new  mongoose.model("seatprice", seatPriceSchema);
const Seatbooking = new mongoose.model("Seatbooking",seatSchema );


export {seats, seatprice, Seatbooking};

