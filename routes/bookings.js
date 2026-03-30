const express = require('express');
const jwt = require('jsonwebtoken');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const router = express.Router();

// Middleware to authenticate user
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// @route   POST /api/bookings
// @desc    Create a new booking
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { roomId, checkIn, checkOut, guests, specialRequests } = req.body;
        
        // Validate input
        if (!roomId || !checkIn || !checkOut || !guests) {
            return res.status(400).json({ 
                success: false, 
                message: 'Room, dates, and guests are required' 
            });
        }
        
        // Check room availability
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ 
                success: false, 
                message: 'Room not found' 
            });
        }
        
        // Check if room is available for dates
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        
        const isBooked = room.bookings.some(booking => {
            const bookingCheckIn = new Date(booking.checkIn);
            const bookingCheckOut = new Date(booking.checkOut);
            return (
                (checkInDate < bookingCheckOut && checkOutDate > bookingCheckIn)
            );
        });
        
        if (isBooked) {
            return res.status(400).json({ 
                success: false, 
                message: 'Room is not available for selected dates' 
            });
        }
        
        // Calculate total amount
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const totalAmount = room.pricePerNight * nights;
        
        // Create booking
        const booking = new Booking({
            user: req.userId,
            room: roomId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests: parseInt(guests),
            totalAmount,
            specialRequests,
            status: 'confirmed'
        });
        
        await booking.save();
        
        // Update room bookings
        room.bookings.push({
            checkIn: checkInDate,
            checkOut: checkOutDate,
            bookingId: booking._id
        });
        
        await room.save();
        
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: {
                id: booking._id,
                bookingId: booking.bookingId,
                room: room.name,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                guests: booking.guests,
                totalAmount: booking.totalAmount,
                status: booking.status
            }
        });
        
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating booking' 
        });
    }
});

// @route   GET /api/bookings/my-bookings
// @desc    Get user's bookings
router.get('/my-bookings', authenticateUser, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.userId })
            .populate('room', 'name type pricePerNight images')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
        
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching bookings' 
        });
    }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
router.put('/:id/cancel', authenticateUser, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            user: req.userId
        });
        
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found' 
            });
        }
        
        // Check if booking can be cancelled
        const checkInDate = new Date(booking.checkIn);
        const today = new Date();
        const hoursBeforeCheckIn = (checkInDate - today) / (1000 * 60 * 60);
        
        if (hoursBeforeCheckIn < 24) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot cancel booking within 24 hours of check-in' 
            });
        }
        
        // Update booking status
        booking.status = 'cancelled';
        await booking.save();
        
        // Remove booking from room's bookings array
        await Room.updateOne(
            { _id: booking.room },
            { $pull: { bookings: { bookingId: booking._id } } }
        );
        
        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });
        
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error cancelling booking' 
        });
    }
});

module.exports = router;