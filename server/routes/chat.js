const router = require('express').Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// UPLOAD IMAGE/FILE
router.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json("No file uploaded");
        }
        // Return the URL to access the file
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.status(200).json(fileUrl);
    } catch (err) {
        res.status(500).json(err);
    }
});

// NEW CONV (1:1)
router.post('/', async (req, res) => {
    // Check if conversation already exists
    try {
        const existingConversation = await Conversation.findOne({
            members: { $all: [req.body.senderId, req.body.receiverId] },
            isGroup: false
        });

        if (existingConversation) {
            return res.status(200).json(existingConversation);
        }

        const newConversation = new Conversation({
            members: [req.body.senderId, req.body.receiverId],
        });

        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation);
    } catch (err) {
        res.status(500).json(err);
    }
});

// NEW GROUP
router.post('/group', async (req, res) => {
    const newGroup = new Conversation({
        members: req.body.members,
        isGroup: true,
        name: req.body.name,
        groupAdmin: req.body.adminId
    });

    try {
        const savedGroup = await newGroup.save();
        res.status(200).json(savedGroup);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET CONV OF A USER
router.get('/:userId', async (req, res) => {
    try {
        const conversation = await Conversation.find({
            members: { $in: [req.params.userId] },
        }).populate('members', 'username avatar nickname isOnline'); // Populate members
        res.status(200).json(conversation);
    } catch (err) {
        res.status(500).json(err);
    }
});

// ADD MESSAGE
router.post('/message', async (req, res) => {
    const newMessage = new Message(req.body);
    try {
        const savedMessage = await newMessage.save();
        const populatedMessage = await Message.findById(savedMessage._id).populate('sender', 'username avatar nickname');
        res.status(200).json(populatedMessage);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET MESSAGES
router.get('/message/:conversationId', async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId,
        }).populate('sender', 'username avatar nickname');
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
