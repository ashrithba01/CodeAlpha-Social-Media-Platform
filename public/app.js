document.addEventListener('DOMContentLoaded', () => {
    loadFeed();
    loadProfile(2, 'bob');
    loadProfile(3, 'charlie');
});

// Fetch and render the post feed
async function loadFeed() {
    const res = await fetch('/api/posts');
    const posts = await res.json();
    const container = document.getElementById('posts-container');
    container.innerHTML = '';

    posts.forEach(post => {
        const postEl = document.createElement('div');
        postEl.className = 'post-card';
        postEl.innerHTML = `
            <div class="post-header">@${post.username}</div>
            <div class="post-content">${post.content}</div>
            <div class="post-actions">
                <button class="like-btn ${post.isLikedByMe ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                    ❤️ ${post.likesCount}
                </button>
            </div>
            <div class="comment-section">
                <div class="comments-list">
                    ${post.comments.map(c => `<div class="comment"><strong>@${c.username}:</strong> ${c.content}</div>`).join('')}
                </div>
                <div class="comment-input-container">
                    <input type="text" id="comment-in-${post.id}" placeholder="Write a comment...">
                    <button onclick="addComment(${post.id})">Reply</button>
                </div>
            </div>
        `;
        container.appendChild(postEl);
    });
}

// Create a new post
async function createPost() {
    const input = document.getElementById('post-input');
    if (!input.value.trim()) return;

    await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.value })
    });
    input.value = '';
    loadFeed();
}

// Like/Unlike mechanism
async function toggleLike(postId) {
    await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    loadFeed();
}

// Comment mechanism
async function addComment(postId) {
    const input = document.getElementById(`comment-in-${postId}`);
    if (!input.value.trim()) return;

    await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.value })
    });
    input.value = '';
    loadFeed();
}

// Fetch and render sidebar profiles
async function loadProfile(userId, elementIdPrefix) {
    const res = await fetch(`/api/users/${userId}`);
    const user = await res.json();

    document.getElementById(`${elementIdPrefix}-followers`).innerText = user.followersCount;
    const btn = document.querySelector(`#profile-${elementIdPrefix} button`);
    if (user.isFollowing) {
        btn.innerText = 'Following';
        btn.classList.add('following');
    } else {
        btn.innerText = 'Follow';
        btn.classList.remove('following');
    }
}

// Follow/Unfollow mechanism
async function toggleFollow(userId) {
    await fetch(`/api/users/${userId}/follow`, { method: 'POST' });
    loadProfile(2, 'bob');
    loadProfile(3, 'charlie');
}