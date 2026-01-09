export function requireRole(allowed = []) {
  // allowed: array of roles e.g. ['OFFICER','ADMIN']
  return (req, res, next) => {
    // prefer JWT-attached user
    const user = req.user;
    if (user && user.role) {
      if (user.role === 'ADMIN') return next();
      if (allowed.length === 0) return next();
      if (allowed.includes(user.role)) return next();
      return res.status(403).json({ success: false, message: 'Insufficient role' });
    }

    // fallback to dev header
    const role = (req.headers['x-user-role'] || '').toString();
    if (!role) return res.status(401).json({ success: false, message: 'Missing role header (x-user-role) in dev mode' });
    if (role === 'ADMIN') return next();
    if (allowed.length === 0) return next();
    if (allowed.includes(role)) return next();
    return res.status(403).json({ success: false, message: 'Insufficient role' });
  };
}
