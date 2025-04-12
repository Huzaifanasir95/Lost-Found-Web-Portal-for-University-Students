
# FAST-NUCES Lost & Found Backend

This is the backend API for the FAST-NUCES Lost & Found portal, built with Node.js, Express, and MongoDB.

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   cd backend
   npm install
   ```
3. Create a `.env` file in the backend directory based on `.env.example` and update with your own values
4. Start the development server:
   ```
   npm run dev
   ```

## Environment Variables

Make sure to set up the following environment variables in your `.env` file:

- `PORT`: Port number for the server (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `JWT_SECRET`: Secret key for JWT authentication
- `MONGODB_URI`: MongoDB connection string

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Items
- `GET /api/items` - Get all items with filtering
- `GET /api/items/:id` - Get a single item by ID
- `POST /api/items` - Create a new item
- `PUT /api/items/:id` - Update an item
- `DELETE /api/items/:id` - Delete an item
- `POST /api/items/:id/claim` - Claim an item
- `POST /api/items/:id/review` - Admin approve/reject item claim
- `POST /api/items/:id/resolve` - Admin mark item as resolved

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/notifications` - Get user notifications
- `PUT /api/users/notifications/:id` - Mark notification as read
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Community
- `GET /api/community` - Get all posts with filtering
- `GET /api/community/:id` - Get a single post by ID
- `POST /api/community` - Create a new post
- `PUT /api/community/:id` - Update a post
- `DELETE /api/community/:id` - Delete a post
- `POST /api/community/:id/like` - Like a post
- `DELETE /api/community/:id/like` - Unlike a post
- `POST /api/community/:id/comments` - Add a comment to a post
- `DELETE /api/community/:id/comments/:commentId` - Delete a comment
- `PUT /api/community/:id/resolve` - Mark post as resolved
