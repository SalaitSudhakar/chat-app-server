import express from 'express';
import { signup, login, logout, checkAuth } from '../Controllers/authController.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';

const route = express.Router();

route.post('/signup', signup)
route.post('/login', login)
route.post('/logout', logout)

route.get('/check-authenticated', authMiddleware, checkAuth)

export default route;