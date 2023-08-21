const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Post = require('../models/post');
const isAuthenticated = require('../middlewares/isAuthenticated');

// @route GET /
// @desc Get all posts
// @access Private
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });  // Fetch all posts and sort by date in descending order
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route GET /:postId
// @desc Get a post by ID
// @access Private
router.get('/:postId', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server error');
    }
});


// @route POST /create
// @desc Create a post
// @access Private
router.post('/create', isAuthenticated, [
    check('text', 'Text is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const newPost = new Post({
            text: req.body.text,
            user: req.user.id
        });

        const post = await newPost.save();
        res.json(post);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route PUT /:postId
// @desc Update a post
// @access Private
router.put('/:postId', isAuthenticated, [
    check('text', 'Text is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Check if the user updating the post is the user who made the post
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        post.text = req.body.text;
        await post.save();

        res.json(post);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route DELETE /:postId
// @desc Delete a post
// @access Private
router.delete('/:postId', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.postId });

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Check if the user deleting the post is the user who made the post
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Post.deleteOne({ _id: req.params.postId });

        res.json({ msg: 'Post deleted' });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server error');
    }
});


module.exports = router;
