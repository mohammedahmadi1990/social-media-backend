const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Post = require('../models/post');
const Comment = require('../models/comment');
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
            user: req.user.id,
            username: req.body.username,
            image: req.body.image
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


// @route POST /:postId
// @desc Comment on a post
// @access Private
router.post('/:postId', isAuthenticated, [
    check('text', 'Text is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const post = await Post.findById(req.params.postId);
        const newComment = new Comment({
            text: req.body.text,
            user: req.user.id,
            post: post.id
        });

        const comment = await newComment.save();
        res.json(comment);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route GET /:postId/comments
// @desc Retrieve all comments for a post
// @access Private
router.get('/:postId/comments', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        const comments = await Comment.find({ post: req.params.postId }).populate('user', 'username');
        res.json(comments);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server error');
    }
});


// @route DELETE /:postId/:commentId
// @desc Delete a comment from a post
// @access Private
router.delete('/:postId/:commentId', isAuthenticated, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        // Check if comment exists
        if (!comment) {
            return res.status(404).json({ msg: 'Comment does not exist' });
        }

        // Check if the user deleting the comment is the user who made the comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await comment.remove();
        res.json({ msg: 'Comment removed' });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Comment not found' });
        }
        res.status(500).send('Server error');
    }
});


// @route PUT /:postId/:commentId
// @desc Update a comment on a post
// @access Private
router.put('/:postId/:commentId', isAuthenticated, [
    check('text', 'Text is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        let comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        // Check if the user updating the comment is the user who made the comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        comment.text = req.body.text;
        await comment.save();

        res.json(comment);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Comment or post not found' });
        }
        res.status(500).send('Server error');
    }
});

module.exports = router;
