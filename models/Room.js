const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: [true, 'Room number is required'],
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Room name is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['standard', 'deluxe', 'suite', 'executive'],
        required: true,
        default: 'standard'
    },
    description: {
        type: String,
        required: true
    },
    pricePerNight: {
        type: Number,
        required: [true, 'Price per night is required'],
        min: [0, 'Price cannot be negative']
    },
    capacity: {
        type: Number,
        required: true,
        min: [1, 'Capacity must be at least 1'],
        max: [10, 'Capacity cannot exceed 10']
    },
    size: {
        type: Number,
        required: true
    },
    amenities: [{
        type: String
    }],
    images: [{
        type: String,
        default: ['default-room.jpg']
    }],
    status: {
        type: String,
        enum: ['available', 'booked', 'maintenance'],
        default: 'available'
    },
    bookings: [{
        checkIn: Date,
        checkOut: Date,
        bookingId: mongoose.Schema.Types.ObjectId
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);