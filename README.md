# Chat App Backend

A modern RESTful API for a real-time chat application with authentication, real time messaging, and user profile management.

## Features

- **User Authentication**: Secure signup, login, and logout functionality
- **Real-time Messaging**: Send and receive messages between users
- **Media Support**: Upload and share images in messages
- **User Management**: View all users and update user profiles
- **Profile Pictures**: Upload and update profile pictures

## Tech Stack

- Node.js
- Express.js
- MongoDB
- socket.io for real time communication
- Multer for file uploads
- Cloudinary for file storage

## API Endpoints

### Authentication Routes

```
POST /api/auth/signup         - Create a new user account
POST /api/auth/login          - Login to existing account
POST /api/auth/logout         - Logout from current session
GET  /api/auth/check-authenticated - Verify authentication status
```

### Messaging Routes

```
GET  /api/messages/:id        - Get messages for a specific conversation
POST /api/messages/send/:id   - Send a message to a conversation (supports image attachments)
```

### User Routes

```
GET  /api/users/get-users     - Get all users
PUT  /api/users/update/profile - Update user profile information
PATCH /api/users/update/profile-pic - Update user profile picture
```

## Authentication

The application uses token-based authentication. Most endpoints require the `authMiddleware` to verify the user's authentication status before processing the request.

## File Uploads

The application supports two types of file uploads:

- Profile pictures (stored in the 'profiles' directory)

- Message images (stored in the 'messageImages' directory)

File uploads are handled using Multer and stored in Cloudinary.

## Setup & Installation

1. Clone the repository
   ```
   git clone http://github.com/SalaitSudhakar/chat-app-server
   cd chat-app-server
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=front_end_url
   NODE_ENV=development || production
   CLOUDINARY_CLOUD_NAME=cloudinary_cloud_name
   CLOUDINARY_API_KEY=cloudinary_api_key
   CLOUDINARY_API_SECRET=cloudinary_api_secret
   ```

4. Start the server
   ```
   npm start
   ```

   For development with auto-restart:
   ```
   npm run dev
   ```
