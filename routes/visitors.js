const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');

// Get all visitors
router.get('/', async (req, res) => {
    try {
        const visitors = await Visitor.find().sort({ checkIn: -1 });
        res.json(visitors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get recent checked-in visitors
router.get('/recent', async (req, res) => {
    try {
        const visitors = await Visitor.find({ status: 'checked-in' })
            .sort({ checkIn: -1 })
            .limit(10);
        res.json(visitors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = {
            todayVisitors: await Visitor.countDocuments({ checkIn: { $gte: today } }),
            checkedIn: await Visitor.countDocuments({ status: 'checked-in' }),
            checkedOut: await Visitor.countDocuments({ status: 'checked-out' })
        };

        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Check-in a new visitor
router.post('/checkin', async (req, res) => {
    const visitor = new Visitor({
        name: req.body.name,
        contact: req.body.contact,
        purpose: req.body.purpose,
        host: req.body.host,
        department: req.body.department,
        vehicleNumber: req.body.vehicleNumber
    });

    try {
        const newVisitor = await visitor.save();
        res.status(201).json(newVisitor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Check-out a visitor
router.post('/checkout/:id', async (req, res) => {
    try {
        const visitor = await Visitor.findById(req.params.id);
        
        if (!visitor) {
            return res.status(404).json({ message: 'Visitor not found' });
        }

        if (visitor.status === 'checked-out') {
            return res.status(400).json({ message: 'Visitor already checked out' });
        }

        visitor.status = 'checked-out';
        visitor.checkOut = new Date();
        
        const updatedVisitor = await visitor.save();
        res.json(updatedVisitor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search visitors
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        
        if (!query || query.trim() === '') {
            return res.json([]);
        }

        const visitors = await Visitor.find(
            { $text: { $search: query } },
            { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' } });

        res.json(visitors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single visitor by ID
router.get('/:id', async (req, res) => {
    try {
        const visitor = await Visitor.findById(req.params.id);
        
        if (!visitor) {
            return res.status(404).json({ message: 'Visitor not found' });
        }

        res.json(visitor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;