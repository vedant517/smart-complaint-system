import express from "express";
import Complaint from "../models/Complaint.js";
import notifications from "../utils/notifications.js";

const router = express.Router();

// Simple priority detection heuristic
function detectPriority(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const critical = ["fire", "collapse", "accident", "life", "injury", "fatal", "critical"];
  const high = ["leak", "flood", "overflow", "electrical", "gas", "crime"];
  const medium = ["not working", "slow", "delay", "broken", "issue", "problem"];

  if (critical.some((k) => text.includes(k))) return "CRITICAL";
  if (high.some((k) => text.includes(k))) return "HIGH";
  if (medium.some((k) => text.includes(k))) return "MEDIUM";
  return "LOW";
}

// New: scoring engine for Module 2
async function computePriorityScore({ title, description, impactLevel, location, isRepeating, evidence }) {
  const text = `${title} ${description}`.toLowerCase();

  // keywords severity score (0-100)
  let keywordScore = 25; // default low
  if (["fire", "collapse", "accident", "life", "injury", "fatal", "critical"].some(s => text.includes(s))) keywordScore = 100;
  else if (["leak", "flood", "overflow", "electrical", "gas", "crime"].some(s => text.includes(s))) keywordScore = 75;
  else if (["not working", "slow", "delay", "broken", "issue", "problem"].some(s => text.includes(s))) keywordScore = 50;

  // impact level mapping
  const impactMap = { 'life-threatening': 100, 'life': 100, 'high': 75, 'medium': 50, 'low': 25 };
  const impactScore = impactMap[String(impactLevel || '').toLowerCase()] ?? 25;

  // location sensitivity (school/hospital near -> 100 else 0)
  const locText = String(location || '').toLowerCase();
  const locationSensitive = /school|hospital|clinic|college|university|schooling|playground/.test(locText) ? 100 : 0;

  // repeated complaints: check similar complaints in same location/title (normalized to 0-100)
  let repeatScore = 0;
  try {
    if (isRepeating) {
      // small boost if user marks repeating
      repeatScore = 70;
    } else if (location) {
      const count = await Complaint.countDocuments({ location: { $regex: new RegExp(location, 'i') } });
      repeatScore = Math.min(100, count * 10);
    }
  } catch (e) {
    repeatScore = 0;
  }

  // evidence: presence boosts score
  const evidenceScore = (evidence && evidence.length > 0) ? 100 : 0;

  // weights: keywords 30%, impact 25%, location 20%, repeated 15%, evidence 10%
  const score = Math.round((keywordScore * 0.3) + (impactScore * 0.25) + (locationSensitive * 0.2) + (repeatScore * 0.15) + (evidenceScore * 0.1));

  // map numeric score to category
  let priority = 'LOW';
  if (score >= 85) priority = 'CRITICAL';
  else if (score >= 70) priority = 'HIGH';
  else if (score >= 40) priority = 'MEDIUM';

  return { score, priority };
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * SEED DATA (SAFE VERSION)
 * ❌ No deleteMany()
 * ✅ Only insert
 */
router.get("/seed", async (req, res) => {
  try {
    const data = await Complaint.insertMany([
      {
        title: "Water Leakage",
        description: "Pipeline leaking near road",
        priority: "HIGH"
      },
      {
        title: "Street Light Issue",
        description: "Lights not working",
        priority: "MEDIUM"
      },
      {
        title: "Garbage Overflow",
        description: "Garbage not collected",
        priority: "CRITICAL"
      }
    ]);

    res.json({
      success: true,
      message: "Seed data inserted successfully",
      data
    });
  } catch (err) {
    console.error("Seed error:", err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * GET ALL COMPLAINTS
 */
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * CREATE COMPLAINT (auto-priority detection)
 */
router.post("/", async (req, res) => {
  try {
    console.log("Received POST /api/complaints, body size approx:", JSON.stringify(req.body).length);
    const { title, description, department, reporter, expectedResolutionDays, category, location, impactLevel, evidence, isRepeating, preferredResolutionTime, anonymous } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "title and description are required" });
    }

    // compute AI-based score and priority
    const { score, priority } = await computePriorityScore({ title, description, impactLevel, location, isRepeating, evidence });

    // map priority to deadline in days
    const deadlineMap = { 'CRITICAL': 1, 'HIGH': 3, 'MEDIUM': 7, 'LOW': 14 };
    const days = deadlineMap[priority] || 7;

    const complaint = new Complaint({
      title,
      description,
      department,
      reporter,
      category,
      location,
      impactLevel,
      evidence: evidence || [],
      isRepeating: !!isRepeating,
      preferredResolutionTime: preferredResolutionTime || null,
      anonymous: !!anonymous,
      priority,
      expectedResolutionDays: days,
      dueDate: new Date(Date.now() + (days * 24 * 60 * 60 * 1000))
    });

    // attach initial score to transparencyScore as placeholder (transparencyScore is computed when resolved)
    complaint.transparencyScore = 0;
    complaint.history = complaint.history || [];
    complaint.history.push({ status: 'OPEN' });

    await complaint.save();

    res.status(201).json({ success: true, data: { complaint, score, priority } });
  } catch (err) {
    console.error("Create error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * ANALYTICS SUMMARY
 */
router.get("/analytics", async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const byStatus = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const byPriority = await Complaint.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    const avgTransparency = await Complaint.aggregate([
      { $group: { _id: null, avg: { $avg: "$transparencyScore" } } }
    ]);

    res.json({ success: true, data: { total, byStatus, byPriority, avgTransparency: avgTransparency[0]?.avg || 0 } });
  } catch (err) {
    console.error("Analytics error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUBLIC SUMMARY
 */
router.get('/public/summary', async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const byStatus = await Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const byPriority = await Complaint.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]);
    const recent = await Complaint.find().sort({ createdAt: -1 }).limit(10).select('title priority status createdAt location');
    res.json({ success: true, data: { total, byStatus, byPriority, recent } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET SINGLE COMPLAINT
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: complaint });
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET timeline/history for a complaint
 */
router.get("/:id/history", async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id).select('history createdAt dueDate status escalated');
    if (!complaint) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: complaint });
  } catch (err) {
    console.error('History error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * UPDATE STATUS
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, proof, remarks } = req.body;

    if (!status) return res.status(400).json({ success: false, message: "status required" });

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    complaint.status = status;
    complaint.history.push({ status, remark: remarks });

    if (proof) complaint.resolutionEvidence = proof;
    if (remarks) complaint.resolutionRemarks = remarks;

    // if resolved, compute transparencyScore
    if (String(status).toUpperCase() === "RESOLVED") {
      const created = complaint.createdAt || complaint._id.getTimestamp();
      const resolvedAt = new Date();
      const actualDays = Math.max(1, Math.ceil((resolvedAt - new Date(created)) / (1000 * 60 * 60 * 24)));
      const expected = complaint.expectedResolutionDays || 7;
      let score = Math.round(100 - (actualDays / expected) * 100);
      score = clamp(score, 0, 100);
      complaint.transparencyScore = score;
      complaint.resolvedAt = resolvedAt;
    }

    await complaint.save();

    res.json({ success: true, data: complaint });
  } catch (err) {
    console.error("Status update error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Escalation logic (Level 1: Dept, Level 2: Admin, Level 3: Head)
 */
export async function runEscalationCheck() {
  try {
    const now = new Date();
    // Find all non-resolved complaints
    const all = await Complaint.find({ status: { $ne: "RESOLVED" } });
    const toUpdate = [];

    for (const c of all) {
      if (!c.dueDate) continue;

      const isBreached = now > new Date(c.dueDate);
      if (!isBreached) continue;

      let changed = false;
      const currentLevel = c.escalationLevel || 0;

      if (currentLevel === 0) {
        c.escalationLevel = 1;
        c.escalated = true;
        c.status = "ESCALATED_DEPT";
        c.history.push({ status: "ESCALATED_DEPT", remark: "Automatic escalation: SLA breached. Higher department notified." });
        changed = true;
      } else if (currentLevel === 1) {
        c.escalationLevel = 2;
        c.status = "ESCALATED_CITY_ADMIN";
        c.history.push({ status: "ESCALATED_CITY_ADMIN", remark: "Critical Delay: Escalated to City Administrator." });
        changed = true;
      } else if (currentLevel === 2) {
        c.escalationLevel = 3;
        c.status = "ESCALATED_AUTHORITY_HEAD";
        c.history.push({ status: "ESCALATED_AUTHORITY_HEAD", remark: "Final Warning: Escalated to Authority Head." });
        changed = true;
      }

      if (changed) {
        // bump priority if not already CRITICAL
        if (c.priority !== "CRITICAL") {
          if (c.priority === "LOW") c.priority = "MEDIUM";
          else if (c.priority === "MEDIUM") c.priority = "HIGH";
          else if (c.priority === "HIGH") c.priority = "CRITICAL";
        }
        toUpdate.push(c.save());
      }
    }

    const results = await Promise.all(toUpdate);
    if (results.length) {
      console.log(`runEscalationCheck Simulator: ${results.length} complaints moved up tiers`);
      try {
        notifications.broadcastEvent('escalation', {
          count: results.length,
          message: `${results.length} complaints escalated to higher authorities`,
          at: new Date().toISOString()
        });
      } catch (e) { }
    }
    return results.length;
  } catch (err) {
    console.error("Escalation Simulator error:", err.message);
    throw err;
  }
}

// route that triggers escalation on demand
router.post("/escalate", async (req, res) => {
  try {
    const count = await runEscalationCheck();
    res.json({ success: true, message: `${count} complaints escalated` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// SSE endpoint for notifications
router.get('/events', (req, res) => {
  try {
    notifications.addSseClient(req, res);
  } catch (err) {
    console.error('SSE error', err.message);
    res.status(500).end();
  }
});


// RTI draft generator (simple text)
router.get('/:id/rti', async (req, res) => {
  try {
    const c = await Complaint.findById(req.params.id).lean();
    if (!c) return res.status(404).json({ success: false, message: 'Not found' });
    const draft = `RTI Draft:\n\nTo: Public Information Officer\nSubject: Request for information regarding complaint ${c._id}\n\nComplaint Title: ${c.title}\nDescription: ${c.description}\nFiled on: ${new Date(c.createdAt).toLocaleString()}\nDepartment: ${c.department || 'N/A'}\nPriority: ${c.priority}\n\nPlease provide the status, actions taken, assigned officer and any supporting documents regarding this complaint.\n\nSincerely,\n[Requestor Name]\n`;
    res.json({ success: true, data: { draft } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CSV export of complaints (basic)
router.get('/export/csv', async (req, res) => {
  try {
    const docs = await Complaint.find().lean();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="complaints_export.csv"');
    const header = ['_id', 'title', 'description', 'priority', 'status', 'department', 'location', 'createdAt', 'dueDate', 'escalated'];
    res.write(header.join(',') + '\n');
    for (const d of docs) {
      const row = header.map(k => {
        const v = d[k] ?? '';
        return '"' + String(v).replace(/"/g, '""') + '"';
      }).join(',');
      res.write(row + '\n');
    }
    res.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// department performance
router.get('/analytics/departments', async (req, res) => {
  try {
    const byDept = await Complaint.aggregate([
      { $group: { _id: "$department", total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ["$status", "RESOLVED"] }, 1, 0] } }, avgTransparency: { $avg: "$transparencyScore" } } },
      { $sort: { total: -1 } }
    ]);
    res.json({ success: true, data: byDept });
  } catch (err) {
    console.error('Dept analytics error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// root cause grouping (simple keyword-based)
router.get('/analytics/rootcause', async (req, res) => {
  try {
    const docs = await Complaint.find().select('title description');
    const buckets = {};
    const keywords = {
      'water': ['water', 'leak', 'flood'],
      'electric': ['electric', 'power', 'sparking', 'electrical', 'pole', 'wire'],
      'road': ['pothole', 'road', 'street', 'drive'],
      'sanitation': ['garbage', 'sewer', 'drain']
    };
    for (const d of docs) {
      const text = (d.title + ' ' + d.description).toLowerCase();
      let matched = false;
      for (const k of Object.keys(keywords)) {
        if (keywords[k].some(word => text.includes(word))) {
          buckets[k] = (buckets[k] || 0) + 1; matched = true; break;
        }
      }
      if (!matched) buckets['other'] = (buckets['other'] || 0) + 1;
    }
    const result = Object.keys(buckets).map(k => ({ key: k, count: buckets[k] }));
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Rootcause error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
