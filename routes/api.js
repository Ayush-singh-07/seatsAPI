import express from 'express';
import * as handlers from "../controller/defaultController.js";
const router = express.Router();

router.get("/seats", handlers.getSeats);
router.post("/booking", handlers.makeBooking);
router.get("/seats/:id", handlers.getSeatPricing);
router.get("/bookings", handlers.getBookingDetails);

export default router;