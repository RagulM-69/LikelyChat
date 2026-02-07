const router = require('express').Router();
const User = require('../models/User');

// GET USER
router.get('/', async (req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;
    try {
        const user = userId
            ? await User.findById(userId)
            : await User.findOne({ username: username });
        const { password, updatedAt, ...other } = user._doc;
        res.status(200).json(other);
    } catch (err) {
        res.status(500).json(err);
    }
});

// UPDATE USER
router.put('/:id', async (req, res) => {
    if (req.body.userId === req.params.id) {
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            }, { new: true });
            res.status(200).json(user);
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can only update your account!");
    }
});

// SEARCH USERS
router.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json("Query is required");
    try {
        const users = await User.find({
            username: { $regex: query, $options: "i" }
        }).select("username _id avatar");
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

// SEND FRIEND REQUEST
router.put('/:id/friend-request', async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (!user.friendRequests.includes(req.body.userId) && !user.friends.includes(req.body.userId)) {
                await user.updateOne({ $push: { friendRequests: req.body.userId } });
                res.status(200).json("Friend request sent");
            } else {
                res.status(403).json("You already sent a request or are friends");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You cannot request yourself");
    }
});

// ACCEPT FRIEND REQUEST
router.put('/:id/accept-friend', async (req, res) => {
    try {
        const user = await User.findById(req.params.id); // The one who sent the request
        const currentUser = await User.findById(req.body.userId); // The one accepting

        if (currentUser.friendRequests.includes(req.params.id)) {
            await user.updateOne({ $push: { friends: req.body.userId } });
            await currentUser.updateOne({ $push: { friends: req.params.id } });
            await currentUser.updateOne({ $pull: { friendRequests: req.params.id } });
            res.status(200).json("Friend request accepted");
        } else {
            res.status(403).json("No request from this user");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET FRIENDS
router.get('/friends/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const friends = await Promise.all(
            user.friends.map((friendId) => {
                return User.findById(friendId);
            })
        );
        let friendList = [];
        friends.map((friend) => {
            if (friend) {
                const { _id, username, avatar } = friend;
                friendList.push({ _id, username, avatar });
            }
        });
        res.status(200).json(friendList);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET FRIEND REQUESTS
router.get('/friend-requests/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const requests = await Promise.all(
            user.friendRequests.map((requestId) => {
                return User.findById(requestId);
            })
        );
        let requestList = [];
        requests.map((request) => {
            if (request) {
                const { _id, username, avatar } = request;
                requestList.push({ _id, username, avatar });
            }
        });
        res.status(200).json(requestList);
    } catch (err) {
        res.status(500).json(err);
    }
});

// UNFRIEND
router.put('/:id/unfriend', async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            if (user.friends.includes(req.body.userId)) {
                await user.updateOne({ $pull: { friends: req.body.userId } });
                await currentUser.updateOne({ $pull: { friends: req.params.id } });
                res.status(200).json("User has been unfriended");
            } else {
                res.status(403).json("You are not friends with this user");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You cannot unfriend yourself");
    }
});

module.exports = router;
