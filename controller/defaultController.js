import express from "express";
import mongoose from "mongoose";
import { seats, seatprice, Seatbooking } from "../model/defaultModel.js";



const getSeats =(req, res)=>{
    seats.find().sort("seat_class")
    .then(response=>{
        res.status(200).json(response);
    })
    .catch(err => console.log(err))
}



const getDynamicSeatPrice = async (id)=>{
  let minimum_price ="", maximum_price="",normalPrice="";
  let bookedPercentage=0;

    try{
        const seat = await seats.find({"id": id})
        const seatclass = seat[0].seat_class;

        const allSeatsofClass = await seats.find({"seat_class": seatclass})
        
        let count =0, bookedCount=0;

        allSeatsofClass.forEach(element => {
          count++;
          if(element.is_booked){
            bookedCount++;
          }
        });

        bookedPercentage = (bookedCount/count)*100;
        const SeatPricingForClass = await seatprice.find({"seat_class": seatclass})

        minimum_price = SeatPricingForClass[0].min_price;
        maximum_price = SeatPricingForClass[0].max_price;
        normalPrice = SeatPricingForClass[0].normal_price;

    }
    catch(ex){
      console.log(ex);
    }

    console.log("bookedPercentage: "+bookedPercentage);
    if(bookedPercentage < 40){
      // use the min_price, if min_price is not available, use normal_price

      if(minimum_price){
        return minimum_price;
      }
      else if(normalPrice){
        return normalPrice;
      }
    }
    else if(bookedPercentage >= 40  && bookedPercentage <= 60){
      // use the normal_price, if normal_price not
      // available, use max_price

      if(normalPrice){
        return normalPrice;
      }
      else if(maximum_price){
        return maximum_price;
      }

    }
    else if(bookedPercentage > 60){
      // use the max_price, if max_price is not
      // available, use normal_price
      if(maximum_price){
        return maximum_price;
      }
      else if(normalPrice){
        return normalPrice;
      }

    }
}

const getSeatPricing = async (req, res)=>{
    const id = req.params.id;

    try{
        const seat = await seats.find({"id": id});

        getDynamicSeatPrice(id)
        .then(price => {
          const seatdetails ={
            id: id,
            seat_class: seat[0].seat_class,
            seat_identifier: seat[0].seat_identifier,
            seat_price: price,
          }
          res.status(200).json(seatdetails);
        })
        .catch(err=>console.log(err))
    }
    catch(ex){
      console.log(ex);
    }
}





function generateBookingId() {

  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000); // Adjust the range as per your requirements

  return `${timestamp}${random}`;
}


const makeBooking = async (req, res)=>{

  const booking_data = {
      name: req.body.name,
      phone_number: req.body.phone_number,
      seats: req.body.seats
    };
  
    try {
          const seatarr = booking_data.seats;
          const alreadybookedSeats = [];
          for(let i=0; i<seatarr.length; i++) {
              const seatElem = await seats.find({"id": seatarr[i]})
              const resultSeat = seatElem[0];

              if(resultSeat.is_booked){
                alreadybookedSeats.push({
                  seat_id: resultSeat.id,
                  seat_class: resultSeat.seat_class,
                  seat_identifier: resultSeat.seat_identifier,
                })
              }
          }

          if(alreadybookedSeats.length > 0){
              res.status(200).json( {Error: "Following seats Already Booked", seats: alreadybookedSeats});
          }
          else{
            let totalSeatPrice =0;
            const promises = [];
            const bookingid =generateBookingId();

            for(let i=0; i<seatarr.length; i++) {
                  await seats.updateOne({id:seatarr[i]}, {is_booked : true});
                  // const seat= await seatprice.find({"id": seatarr[i]})
                  // totalSeatPrice+=seat;
                  // console.log(seatarr[i]);
                  const promise = getDynamicSeatPrice(seatarr[i])
                  .then(priceString => {
                    const price = priceString.substring(1, priceString.length);
                    totalSeatPrice= totalSeatPrice+parseFloat(price);
                  })
                  .catch(err=>console.log(err))
                  promises.push(promise);
              }
            
            Promise.all(promises)
            .then(() => {
              const booking = new Seatbooking({
                  seat_ids: seatarr,
                  booking_id: bookingid,
                  name: booking_data.name,
                  phone: booking_data.phone_number,
                  total_price: totalSeatPrice
              })
              
              
              booking.save()
              

              res.status(200).json({"booking_id": bookingid, total_price: totalSeatPrice});
            })
            .catch(err => console.log(err));
              

          }

    } catch (err) {
      console.log(err);
    }
  
}


const getBookingDetails = async (req, res) => {
  const userIdentifier = req.query.userIdentifier;
  const searchQuery = {
    $or: [
      { name: { $regex: userIdentifier } },
      { phone: { $regex: userIdentifier } }
    ]
  };
  const results = await Seatbooking.find(searchQuery)
  if(results.length > 0){
    res.status(200).json(results);
  }
  else{
    res.status(200).json({response: "No user bookings found"})
  }


};

export {getSeats,getSeatPricing ,makeBooking, getBookingDetails};