import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export async function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Missing token' });
  try {
    const decoded = jwt.verify(token, SECRET);
    // attach minimal user info
    const user = await User.findById(decoded.id).select('-password').lean();
    if (!user) return res.status(401).json({ success: false, message: 'Invalid token user' });
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth verify failed', err.message);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

export default requireAuth;
