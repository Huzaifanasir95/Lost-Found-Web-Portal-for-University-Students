
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');

// Get all posts with filtering
exports.getPosts = async (req, res) => {
  try {
    const { search, resolved } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (resolved) {
      query.resolved = resolved === 'true';
    }
    
    const posts = await Post.find(query)
      .populate('user', 'name')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 });
      
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name')
      .populate('comments.user', 'name')
      .populate('likes', 'name');
      
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, content } = req.body;
    
    const newPost = new Post({
      title,
      content,
      user: req.user.id
    });
    
    const post = await newPost.save();
    
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, content } = req.body;
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is authorized
    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (title) post.title = title;
    if (content) post.content = content;
    
    await post.save();
    
    res.json(post);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is authorized
    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await post.remove();
    
    res.json({ message: 'Post removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if post has already been liked by user
    if (post.likes.some(like => like.toString() === req.user.id)) {
      return res.status(400).json({ message: 'Post already liked' });
    }
    
    post.likes.unshift(req.user.id);
    
    await post.save();
    
    // Create notification if not the post owner
    if (post.user.toString() !== req.user.id) {
      const notification = new Notification({
        user: post.user,
        message: 'Someone liked your post',
        relatedPost: post._id
      });
      
      await notification.save();
    }
    
    res.json(post.likes);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Unlike a post
exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if post has been liked by user
    if (!post.likes.some(like => like.toString() === req.user.id)) {
      return res.status(400).json({ message: 'Post has not yet been liked' });
    }
    
    // Remove user from likes
    post.likes = post.likes.filter(like => like.toString() !== req.user.id);
    
    await post.save();
    
    res.json(post.likes);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Add comment to a post
exports.addComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const newComment = {
      text: req.body.text,
      user: req.user.id
    };
    
    post.comments.unshift(newComment);
    
    await post.save();
    
    // Create notification if not the post owner
    if (post.user.toString() !== req.user.id) {
      const notification = new Notification({
        user: post.user,
        message: 'Someone commented on your post',
        relatedPost: post._id
      });
      
      await notification.save();
    }
    
    res.json(post.comments);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete comment from a post
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Find comment
    const comment = post.comments.find(
      comment => comment.id === req.params.commentId
    );
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is authorized
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Remove comment
    post.comments = post.comments.filter(
      comment => comment.id !== req.params.commentId
    );
    
    await post.save();
    
    res.json(post.comments);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark post as resolved
exports.markResolved = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is authorized
    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    post.resolved = true;
    
    await post.save();
    
    res.json(post);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
