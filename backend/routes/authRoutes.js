import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'email and password required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'user exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash, role: role || 'USER' });
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
  } catch (err) { console.error('Register error', err.message); res.status(500).json({ success: false, message: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'email and password required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.password || '');
    if (!ok) return res.status(400).json({ success: false, message: 'invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: '7d' });
    res.json({ success: true, data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
  } catch (err) { console.error('Login error', err.message); res.status(500).json({ success: false, message: err.message }); }
});

router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Missing token' });
    const decoded = jwt.verify(token, SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });
    res.json({ success: true, data: user });
  } catch (err) { console.error('Me error', err.message); res.status(500).json({ success: false, message: err.message }); }
});

export default router;
