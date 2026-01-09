import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    remark: { type: String },
    at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, required: true },
    status: { type: String, default: "OPEN" },
    department: { type: String },
    category: { type: String },
    location: { type: String },
    impactLevel: { type: String },
    evidence: { type: [String], default: [] },
    isRepeating: { type: Boolean, default: false },
    preferredResolutionTime: { type: String },
    anonymous: { type: Boolean, default: false },
    reporter: {
      name: { type: String },
      email: { type: String }
    },
    expectedResolutionDays: { type: Number, default: 7 },
    escalated: { type: Boolean, default: false },
    escalationLevel: { type: Number, default: 0 }, // 0: None, 1: Dept, 2: City Admin, 3: Authority Head
    dueDate: { type: Date },
    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer', default: null },
    resolvedAt: { type: Date },
    resolutionEvidence: { type: String },
    resolutionRemarks: { type: String },
    history: { type: [historySchema], default: [] },
    transparencyScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

complaintSchema.pre("save", function (next) {
  if (this.isNew) {
    this.history = this.history || [];
    this.history.push({ status: this.status || "OPEN" });
    // set dueDate based on expectedResolutionDays
    if (!this.dueDate) {
      const days = Number(this.expectedResolutionDays || 7);
      // For testing CRITICAL escalation simulator: 1 min SLA
      if (this.priority === 'CRITICAL') {
        this.dueDate = new Date(Date.now() + 60 * 1000);
      } else {
        this.dueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      }
    }
  }
  next();
});

export default mongoose.model("Complaint", complaintSchema);
