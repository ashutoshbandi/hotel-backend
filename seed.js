const mongoose = require('mongoose');
const Room = require('./models/Room');
require('dotenv').config();

const sampleRooms = [
    {
        roomNumber: '101',
        name: 'Standard Room',
        type: 'standard',
        description: 'Comfortable room with all basic amenities for a pleasant stay.',
        pricePerNight: 89,
        capacity: 2,
        size: 250,
        amenities: ['Free WiFi', 'TV', 'AC', 'Mini Fridge', 'Coffee Maker'],
        images: ['standard-room.jpg'],
        status: 'available'
    },
    {
        roomNumber: '201',
        name: 'Deluxe Room',
        type: 'deluxe',
        description: 'Spacious room with beautiful city view and premium amenities.',
        pricePerNight: 129,
        capacity: 3,
        size: 350,
        amenities: ['Free WiFi', 'Smart TV', 'AC', 'Mini Bar', 'Coffee Maker', 'City View', 'Room Service'],
        images: ['deluxe-room.jpg'],
        status: 'available'
    },
    {
        roomNumber: '301',
        name: 'Executive Suite',
        type: 'suite',
        description: 'Luxury suite with separate living area and premium services.',
        pricePerNight: 199,
        capacity: 4,
        size: 550,
        amenities: ['Free WiFi', 'Smart TV', 'AC', 'Mini Bar', 'Kitchenette', 'City View', 'Room Service', 'Jacuzzi'],
        images: ['executive-suite.jpg'],
        status: 'available'
    },
    {
        roomNumber: '102',
        name: 'Standard Room',
        type: 'standard',
        description: 'Comfortable room with all basic amenities for a pleasant stay.',
        pricePerNight: 89,
        capacity: 2,
        size: 250,
        amenities: ['Free WiFi', 'TV', 'AC', 'Mini Fridge', 'Coffee Maker'],
        images: ['standard-room.jpg'],
        status: 'available'
    },
    {
        roomNumber: '202',
        name: 'Deluxe Room',
        type: 'deluxe',
        description: 'Spacious room with beautiful city view and premium amenities.',
        pricePerNight: 129,
        capacity: 3,
        size: 350,
        amenities: ['Free WiFi', 'Smart TV', 'AC', 'Mini Bar', 'Coffee Maker', 'City View', 'Room Service'],
        images: ['deluxe-room.jpg'],
        status: 'available'
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Clear existing rooms
        await Room.deleteMany({});
        console.log('Cleared existing rooms');
        
        // Insert sample rooms
        await Room.insertMany(sampleRooms);
        console.log(`Inserted ${sampleRooms.length} rooms`);
        
        console.log('✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();