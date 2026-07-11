import jwt from 'jsonwebtoken';
import { Parent } from '../models/Parent.js';
import { Child } from '../models/Child.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export const authParent = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token required' });
    }
    const token = auth.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'parent' || !decoded.parentId) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const parent = await Parent.findById(decoded.parentId).select('-password');
    if (!parent) return res.status(401).json({ error: 'Parent not found' });
    req.parent = parent;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authChild = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token required' });
    }
    const token = auth.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'child' || !decoded.childId) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const child = await Child.findById(decoded.childId).populate('parentId', 'name email');
    if (!child) return res.status(401).json({ error: 'Child not found' });
    req.child = child;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const signParentToken = (parentId) =>
  jwt.sign({ parentId, type: 'parent' }, JWT_SECRET, { expiresIn: '7d' });

export const signChildToken = (childId) =>
  jwt.sign({ childId, type: 'child' }, JWT_SECRET, { expiresIn: '7d' });

export const signAdminToken = (adminId = 'admin') =>
  jwt.sign({ adminId, type: 'admin' }, JWT_SECRET, { expiresIn: '1d' });

export const authAdmin = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token required' });
    }
    const token = auth.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'admin' || !decoded.adminId) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.admin = { id: decoded.adminId };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
