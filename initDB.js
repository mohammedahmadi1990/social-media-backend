const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// Import models
const User = require('./models/user');
const Post = require('./models/post');
const Comment = require('./models/comment');

// Connect to MongoDB
connectDB();

// Sample Data
const users = [
    { username: 'Alice', email: 'alice@example.com', password: 'password123' },
    { username: 'Bob', email: 'bob@example.com', password: 'password123' }
];

const posts = [
    { userIndex: 0, text: "Alice's first post", image: 'https://img.freepik.com/premium-photo/cant-live-without-sport-vertical-photo-strong-disabled-woman-sportswear-is-running-outdoors_386167-12681.jpg?w=2000' },
    { userIndex: 1, text: "Bob's first post", image: 'https://thumbs.dreamstime.com/b/sports-basketball-young-teenager-blue-tracksuit-throws-jump-ball-basket-sky-vertical-163705831.jpg' }
];

const comments = [
    { postIndex: 0, userIndex: 0, text: "Alice's comment on her own post" },
    { postIndex: 0, userIndex: 1, text: "Bob's comment on Alice's post" }
];

async function populateData() {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Post.deleteMany({});
        await Comment.deleteMany({});

        const createdUsers = await User.insertMany(users.map(user => ({
            username: user.username,
            email: user.email,
            password: bcrypt.hashSync(user.password, 10)
        })));

        const createdPosts = await Post.insertMany(posts.map(post => ({
            user: createdUsers[post.userIndex]._id,
            text: post.text,
            image: post.image
        })));

        await Comment.insertMany(comments.map(comment => ({
            post: createdPosts[comment.postIndex]._id,
            user: createdUsers[comment.userIndex]._id,
            text: comment.text
        })));

        console.log('Data populated successfully');
        process.exit();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

populateData();
