const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- IN-MEMORY DATABASE (Relational Structure) ---
let users = [
    { id: 1, username: 'alice', name: 'Alice Smith' },
    { id: 2, username: 'bob', name: 'Bob Jones' },
    { id: 3, username: 'charlie', name: 'Charlie Brown' }
];

let posts = [
    { id: 1, userId: 2, content: 'Hello World! This is my first post.', createdAt: new Date() }
];

let comments = [
    { id: 1, postId: 1, userId: 3, content: 'Welcome to the platform, Bob!' }
];

let likes = [
    { userId: 1, postId: 1 } // Alice liked Bob's post
];

let follows = [
    { followerId: 1, followingId: 2 } // Alice follows Bob
];

// Mock Current Logged-in User (Alice)
const CURRENT_USER_ID = 1;

// --- API ENDPOINTS ---

// 1. Get Feed (Posts with author details, likes, and comments)
app.get('/api/posts', (req, res) => {
    const feed = posts.map(post => {
        const author = users.find(u => u.id === post.userId);
        const postLikes = likes.filter(l => l.postId === post.id);
        const isLikedByMe = likes.some(l => l.postId === post.id && l.userId === CURRENT_USER_ID);
        
        const postComments = comments
            .filter(c => c.postId === post.id)
            .map(c => {
                const commentAuthor = users.find(u => u.id === c.userId);
                return { ...c, username: commentAuthor ? commentAuthor.username : 'Unknown' };
            });

        return {
            ...post,
            username: author ? author.username : 'Unknown',
            likesCount: postLikes.length,
            isLikedByMe,
            comments: postComments
        };
    }).reverse(); // Newest posts first
    
    res.json(feed);
});

// 2. Create a Post
app.post('/api/posts', (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const newPost = {
        id: posts.length + 1,
        userId: CURRENT_USER_ID,
        content,
        createdAt: new Date()
    };
    posts.push(newPost);
    res.status(201).json(newPost);
});

// 3. Like / Unlike a Post
app.post('/api/posts/:id/like', (req, res) => {
    const postId = parseInt(req.params.id);
    const existingLikeIndex = likes.findIndex(l => l.postId === postId && l.userId === CURRENT_USER_ID);

    if (existingLikeIndex > -1) {
        likes.splice(existingLikeIndex, 1); // Unlike
        res.json({ liked: false });
    } else {
        likes.push({ userId: CURRENT_USER_ID, postId }); // Like
        res.json({ liked: true });
    }
});

// 4. Comment on a Post
app.post('/api/posts/:id/comment', (req, res) => {
    const postId = parseInt(req.params.id);
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Comment cannot be empty' });

    const newComment = {
        id: comments.length + 1,
        postId,
        userId: CURRENT_USER_ID,
        content
    };
    comments.push(newComment);
    res.status(201).json(newComment);
});

// 5. Get User Profile & Follow Status
app.get('/api/users/:id', (req, res) => {
    const targetUserId = parseInt(req.params.id);
    const user = users.find(u => u.id === targetUserId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const followersCount = follows.filter(f => f.followingId === targetUserId).length;
    const followingCount = follows.filter(f => f.followerId === targetUserId).length;
    const isFollowing = follows.some(f => f.followerId === CURRENT_USER_ID && f.followingId === targetUserId);

    res.json({ ...user, followersCount, followingCount, isFollowing });
});

// 6. Follow / Unfollow a User
app.post('/api/users/:id/follow', (req, res) => {
    const targetUserId = parseInt(req.params.id);
    if (targetUserId === CURRENT_USER_ID) return res.status(400).json({ error: "You can't follow yourself" });

    const followIndex = follows.findIndex(f => f.followerId === CURRENT_USER_ID && f.followingId === targetUserId);

    if (followIndex > -1) {
        follows.splice(followIndex, 1); // Unfollow
        res.json({ following: false });
    } else {
        follows.push({ followerId: CURRENT_USER_ID, followingId: targetUserId }); // Follow
        res.json({ following: true });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));