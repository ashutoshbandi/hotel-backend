const express = require('express');
const Room = require('../models/Room');
const router = express.Router();

// @route   GET /api/rooms
// @desc    Get all available rooms
router.get('/', async (req, res) => {
    try {
        const { checkIn, checkOut, type, minPrice, maxPrice, capacity } = req.query;
        
        // Build query
        let query = { status: 'available' };
        
        if (type && type !== 'all') {
            query.type = type;
        }
        
        if (capacity) {
            query.capacity = { $gte: parseInt(capacity) };
        }
        
        if (minPrice || maxPrice) {
            query.pricePerNight = {};
            if (minPrice) query.pricePerNight.$gte = parseInt(minPrice);
            if (maxPrice) query.pricePerNight.$lte = parseInt(maxPrice);
        }
        
        // Check availability for dates
        if (checkIn && checkOut) {
            query.$or = [
                { bookings: { $size: 0 } },
                {
                    bookings: {
                        $not: {
                            $elemMatch: {
                                $or: [
                                    {
                                        checkIn: { $lte: new Date(checkOut) },
                                        checkOut: { $gte: new Date(checkIn) }
                                    }
                                ]
                            }
                        }
                    }
                }
            ];
        }
        
        const rooms = await Room.find(query);
        
        res.json({
            success: true,
            count: rooms.length,
            rooms
        });
        
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching rooms' 
        });
    }
});

// @route   GET /api/rooms/:id
// @desc    Get single room by ID
router.get('/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        
        if (!room) {
            return res.status(404).json({ 
                success: false, 
                message: 'Room not found' 
            });
        }
        
        res.json({
            success: true,
            room
        });
        
    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching room details' 
        });
    }
});

module.exports = router;