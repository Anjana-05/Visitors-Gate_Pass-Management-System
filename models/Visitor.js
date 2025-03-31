const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        required: true,
        enum: ['Meeting', 'Delivery', 'Interview', 'Maintenance', 'Other']
    },
    host: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    vehicleNumber: String,
    checkIn: {
        type: Date,
        default: Date.now
    },
    checkOut: Date,
    status: {
        type: String,
        enum: ['checked-in', 'checked-out'],
        default: 'checked-in'
    }
});

// Add a text index for search functionality
visitorSchema.index({
    name: 'text',
    contact: 'text',
    purpose: 'text',
    host: 'text',
    department: 'text',
    vehicleNumber: 'text'
});

const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;