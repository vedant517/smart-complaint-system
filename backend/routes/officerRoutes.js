import express from 'express';
import Officer from '../models/Officer.js';
import Complaint from '../models/Complaint.js';
import notifications from '../utils/notifications.js';

const router = express.Router();

// create officer
router.post('/', async (req, res) => {
  try {
    const { name, email, department, role } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'name required' });
    const officer = new Officer({ name, email, department, role });
    await officer.save();
    res.status(201).json({ success: true, data: officer });
  } catch (err) {
    console.error('Create officer error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// list officers
router.get('/', async (req, res) => {
  try {
    const list = await Officer.find().sort({ name: 1 });
    res.json({ success: true, data: list });
  } catch (err) {
    console.error('List officers error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// assign officer to complaint
router.post('/:id/assign', async (req, res) => {
  try {
    const officerId = req.params.id;
    const { complaintId } = req.body;
    if (!complaintId) return res.status(400).json({ success: false, message: 'complaintId required' });

    const officer = await Officer.findById(officerId);
    if (!officer) return res.status(404).json({ success: false, message: 'Officer not found' });

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.assignedOfficer = officer._id;
    complaint.history.push({ status: `ASSIGNED_TO_${officer.name}` });
    await complaint.save();

    try { notifications.broadcastEvent('assignment', { complaintId: complaint._id, officerId: officer._id, at: new Date().toISOString() }); } catch (e) { }

    res.json({ success: true, data: complaint });
  } catch (err) {
    console.error('Assign error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// all officers performance (bulk)
router.get('/analytics/performance', async (req, res) => {
  try {
    const list = await Officer.find().sort({ department: 1, name: 1 });
    const performanceData = await Promise.all(list.map(async (officer) => {
      const assigned = await Complaint.find({ assignedOfficer: officer._id });
      const totalAssigned = assigned.length;
      const resolved = assigned.filter(c => String(c.status).toUpperCase() === 'RESOLVED');
      const resolvedCount = resolved.length;

      // Strike Rate: (resolved / totalAssigned) * 100
      const strikeRate = totalAssigned > 0 ? Math.round((resolvedCount / totalAssigned) * 100) : 0;

      // workload: non-resolved
      const workload = totalAssigned - resolvedCount;

      return {
        _id: officer._id,
        name: officer.name,
        department: officer.department || 'General',
        totalAssigned,
        resolvedCount,
        strikeRate,
        workload
      };
    }));

    res.json({ success: true, data: performanceData });
  } catch (err) {
    console.error('Bulk performance error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// officer performance
router.get('/:id/performance', async (req, res) => {
  try {
    const officerId = req.params.id;
    const officer = await Officer.findById(officerId);
    if (!officer) return res.status(404).json({ success: false, message: 'Officer not found' });

    const assigned = await Complaint.find({ assignedOfficer: officer._id });
    const totalAssigned = assigned.length;
    const resolved = assigned.filter(c => String(c.status).toUpperCase() === 'RESOLVED');
    const resolvedCount = resolved.length;
    // avg resolution (days)
    const resolutionDays = resolved.map(c => {
      const created = c.createdAt || c._id.getTimestamp();
      const resolvedAt = c.resolvedAt || new Date();
      return Math.max(0, (new Date(resolvedAt) - new Date(created)) / (1000 * 60 * 60 * 24));
    });
    const avgResolutionDays = resolutionDays.length ? (resolutionDays.reduce((a, b) => a + b, 0) / resolutionDays.length) : 0;
    const escalations = assigned.filter(c => c.escalated).length;

    res.json({ success: true, data: { officer, totalAssigned, resolvedCount, avgResolutionDays: Number(avgResolutionDays.toFixed(2)), escalations } });
  } catch (err) {
    console.error('Performance error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
