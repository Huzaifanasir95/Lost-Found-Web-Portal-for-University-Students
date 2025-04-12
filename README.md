
# FAST-NUCES Lost & Found Portal

A web application for managing lost and found items at FAST-NUCES.

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=fastcampuslostandfoundjwtsecretkey
   MONGODB_URI=mongodb+srv://nasirhuzaifa95:1234@cluster0.uir19.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```

4. Start the backend server:
   ```
   npm run dev
   ```
   The server will run on http://localhost:5000

### Frontend Setup

1. In a new terminal window, navigate to the project root directory.

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm run dev
   ```
   The frontend will be available at http://localhost:5173 (or similar port)

## Implemented Features

- **User Authentication**: Register and login functionality
- **Report Lost/Found Items**: Users can submit reports with images and details
- **Browse Items**: View lost and found items with filtering options
- **Item Details**: View complete information about reported items
- **Claims**: Submit claims for found items or report finding a lost item
- **Comments**: Users can comment on item listings
- **User Profile**: View and manage your reported items

## Important Notes

- Both frontend and backend servers need to be running simultaneously.
- Ensure the MongoDB connection is working properly.
- Uploads directory is automatically created for storing item images.

## Test Accounts

You can register a new account or use these test accounts:

- **Student Account**:
  - Email: student@nu.edu.pk
  - Password: password123

- **Admin Account**:
  - Email: admin@nu.edu.pk
  - Password: admin123

## Troubleshooting

If you encounter any issues:

1. Make sure both frontend and backend servers are running
2. Check the MongoDB connection string in the backend/.env file
3. Verify that the backend server is accessible at http://localhost:5000/api/test
4. Clear browser cache and refresh the page
