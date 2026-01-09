import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Users, FileText, Clock, CheckCircle, AlertTriangle, ArrowLeft, MoreVertical, Edit, UserPlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import SLATimer from "@/components/SLATimer";

// Mock data for charts
const monthlyComplaints = [
  { month: "Jan", total: 45, resolved: 38, pending: 7 },
  { month: "Feb", total: 52, resolved: 44, pending: 8 },
  { month: "Mar", total: 61, resolved: 53, pending: 8 },
  { month: "Apr", total: 48, resolved: 42, pending: 6 },
  { month: "May", total: 73, resolved: 65, pending: 8 },
  { month: "Jun", total: 89, resolved: 78, pending: 11 },
];

const categoryData = [
  { name: "Infrastructure", value: 35, fill: "hsl(175 70% 35%)" },
  { name: "Sanitation", value: 25, fill: "hsl(220 60% 35%)" },
  { name: "Water Supply", value: 20, fill: "hsl(158 64% 40%)" },
  { name: "Electricity", value: 12, fill: "hsl(38 92% 50%)" },
  { name: "Other", value: 8, fill: "hsl(220 14% 50%)" },
];

const resolutionTimeData = [
  { day: "Mon", avgHours: 24 },
  { day: "Tue", avgHours: 18 },
  { day: "Wed", avgHours: 32 },
  { day: "Thu", avgHours: 22 },
  { day: "Fri", avgHours: 28 },
  { day: "Sat", avgHours: 36 },
  { day: "Sun", avgHours: 42 },
];

const officerData = [
  { name: "John Smith", assigned: 28, resolved: 24, pending: 4 },
  { name: "Sarah Johnson", assigned: 32, resolved: 30, pending: 2 },
  { name: "Mike Chen", assigned: 25, resolved: 20, pending: 5 },
  { name: "Emily Davis", assigned: 30, resolved: 28, pending: 2 },
  { name: "Alex Wilson", assigned: 22, resolved: 18, pending: 4 },
];

const chartConfig = {
  total: { label: "Total", color: "hsl(220 60% 35%)" },
  resolved: { label: "Resolved", color: "hsl(158 64% 40%)" },
  pending: { label: "Pending", color: "hsl(38 92% 50%)" },
  assigned: { label: "Assigned", color: "hsl(220 60% 35%)" },
  avgHours: { label: "Avg Hours", color: "hsl(175 70% 35%)" },
};

const StatCard = ({ title, value, change, changeType, icon: Icon, iconBg }: {
  title: string;
  value: string | number;
  change: string;
  changeType: "up" | "down";
  icon: React.ElementType;
  iconBg: string;
}) => (
  <Card className="hover-lift">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${changeType === "up" ? "text-success" : "text-destructive"}`}>
            {changeType === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{change}</span>
          </div>
        </div>
        <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center`}>
          <Icon className="w-7 h-7 text-primary-foreground" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    activeOfficers: 0,
    byStatus: [],
    byPriority: [],
  });
  const [complaints, setComplaints] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [officerPerformance, setOfficerPerformance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateOfficer, setUpdateOfficer] = useState("");
  const [updateRemark, setUpdateRemark] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    console.log("AdminDashboard: Fetching data...");
    try {
      const [analyticsRes, complaintsRes, officersRes, perfRes] = await Promise.all([
        fetch("/api/complaints/analytics"),
        fetch("/api/complaints"),
        fetch("/api/officers"),
        fetch("/api/officers/analytics/performance"),
      ]);

      const analytics = await analyticsRes.json().catch(() => ({ success: false }));
      const allComplaints = await complaintsRes.json().catch(() => []);
      const allOfficers = await officersRes.json().catch(() => ({ success: false, data: [] }));
      const performance = await perfRes.json().catch(() => ({ success: false, data: [] }));

      console.log("AdminDashboard Data:", { analytics, allComplaints, allOfficers, performance });

      if (analytics.success) {
        const data = analytics.data;
        const resolved = data.byStatus?.find((s: any) => s._id === "RESOLVED")?.count || 0;
        setStats({
          total: data.total || 0,
          resolved: resolved,
          pending: (data.total || 0) - resolved,
          activeOfficers: allOfficers.data?.length || 0,
          byStatus: data.byStatus || [],
          byPriority: data.byPriority || [],
        });
      }

      // Handle both raw array and wrapped object
      const complaintsArray = Array.isArray(allComplaints)
        ? allComplaints
        : (allComplaints.success && Array.isArray(allComplaints.data) ? allComplaints.data : []);

      setComplaints(complaintsArray);

      if (allOfficers.success) {
        setOfficers(allOfficers.data);
      }

      if (performance.success) {
        setOfficerPerformance(performance.data);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
      toast.error("Error loading dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenUpdateModal = (complaint: any) => {
    setSelectedComplaint(complaint);
    setUpdateStatus(complaint.status);
    setUpdateOfficer(complaint.assignedOfficer?._id || complaint.assignedOfficer || "unassigned");
    setUpdateRemark("");
    setIsUpdateModalOpen(true);
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;
    setIsSubmitting(true);

    try {
      // Update status and remarks
      const statusRes = await fetch(`/api/complaints/${selectedComplaint._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: updateStatus, remarks: updateRemark }),
      });

      // Update officer assignment if changed
      if (updateOfficer && updateOfficer !== (selectedComplaint.assignedOfficer?._id || selectedComplaint.assignedOfficer)) {
        const offId = updateOfficer === "unassigned" ? null : updateOfficer;
        // The backend expects /api/officers/:id/assign with { complaintId }
        if (offId) {
          await fetch(`/api/officers/${offId}/assign`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ complaintId: selectedComplaint._id }),
          });
        }
      }

      const result = await statusRes.json();
      if (result.success) {
        toast.success("Complaint updated successfully");
        setIsUpdateModalOpen(false);
        fetchData();
      } else {
        toast.error(result.message || "Failed to update complaint");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("An error occurred during update");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="h-8 w-px bg-border" />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground mr-4">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
              <Button size="sm" onClick={fetchData} variant="outline" className="gap-2" disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Complaints"
            value={stats.total}
            change="+12% from last month"
            changeType="up"
            icon={FileText}
            iconBg="bg-primary"
          />
          <StatCard
            title="Resolved"
            value={stats.resolved}
            change="+8% from last month"
            changeType="up"
            icon={CheckCircle}
            iconBg="bg-success"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            change="-5% from last month"
            changeType="down"
            icon={AlertTriangle}
            iconBg="bg-warning"
          />
          <StatCard
            title="Active Officers"
            value={stats.activeOfficers}
            change="+2 new this month"
            changeType="up"
            icon={Users}
            iconBg="bg-accent"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Complaints Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Monthly Complaint Trend
              </CardTitle>
              <CardDescription>Overview of complaints over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={monthlyComplaints}>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="resolved" fill="hsl(158 64% 40%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Category Breakdown
              </CardTitle>
              <CardDescription>Distribution of complaints by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Resolution Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Average Resolution Time
              </CardTitle>
              <CardDescription>Average hours to resolve complaints by day</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <AreaChart data={resolutionTimeData}>
                  <defs>
                    <linearGradient id="colorAvgHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(175 70% 35%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(175 70% 35%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="avgHours"
                    stroke="hsl(175 70% 35%)"
                    strokeWidth={2}
                    fill="url(#colorAvgHours)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Officer Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                Officer Assignments
              </CardTitle>
              <CardDescription>Complaint distribution and resolution by officer</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={officerData} layout="vertical">
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="resolved" fill="hsl(158 64% 40%)" radius={[0, 4, 4, 0]} stackId="a" />
                  <Bar dataKey="pending" fill="hsl(38 92% 50%)" radius={[0, 4, 4, 0]} stackId="a" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Officer Management Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Officer Management</CardTitle>
                <CardDescription>Department-wise performance and resolution metrics</CardDescription>
              </div>
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                {officerPerformance.length} Officers Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground whitespace-nowrap">Officer Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground whitespace-nowrap">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground whitespace-nowrap">Assigned</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground whitespace-nowrap">Solved</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground whitespace-nowrap">Strike Rate</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {officerPerformance.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-muted-foreground">No officer data available.</td>
                    </tr>
                  ) : (
                    officerPerformance.map((off) => (
                      <tr key={off._id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                              {off.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <span className="font-medium">{off.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm">
                          <Badge variant="secondary" className="font-normal capitalize">
                            {off.department.toLowerCase()}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold">{off.totalAssigned}</td>
                        <td className="py-4 px-4 text-sm font-semibold text-success">{off.resolvedCount}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 w-24 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${off.strikeRate > 80 ? 'bg-success' :
                                    off.strikeRate > 50 ? 'bg-warning' :
                                      'bg-destructive'
                                  }`}
                                style={{ width: `${off.strikeRate}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold">{off.strikeRate}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className={off.workload > 5 ? "border-warning text-warning" : "border-success text-success"}>
                            {off.workload > 5 ? "High Workload" : "Optimal"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Table */}
        <Card>
          <CardHeader>
            <CardTitle>Complaint Management</CardTitle>
            <CardDescription>View and manage all citizen complaints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {isLoading && complaints.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">Loading complaints...</div>
              ) : complaints.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">No complaints found.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground whitespace-nowrap">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Title</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground whitespace-nowrap">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground whitespace-nowrap">Priority</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">SLA Countdown</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Assigned To</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((complaint) => (
                      <tr key={complaint._id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs font-medium max-w-[100px] truncate" title={complaint._id}>
                          {complaint._id}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">{complaint.title}</td>
                        <td className="py-3 px-4 text-sm">{complaint.category}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant="outline" className={
                            complaint.priority === 'CRITICAL' ? "border-destructive text-destructive bg-destructive/5" :
                              complaint.priority === 'HIGH' ? "border-warning text-warning bg-warning/5" :
                                "border-pending text-pending bg-pending/5"
                          }>
                            {complaint.priority}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <SLATimer dueDate={complaint.dueDate} status={complaint.status} />
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {complaint.assignedOfficer?.name || <span className="text-muted-foreground italic">Unassigned</span>}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Badge className={
                            complaint.status === "RESOLVED" ? "bg-success hover:bg-success/90" :
                              complaint.status === "IN PROGRESS" ? "bg-accent hover:bg-accent/90" :
                                "bg-warning hover:bg-warning/90"
                          }>
                            {complaint.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenUpdateModal(complaint)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Update
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Update Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Complaint Progress</DialogTitle>
            <DialogDescription>
              Assign an officer, update status, and add progress remarks for the citizen.
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Update Status</Label>
                  <Select value={updateStatus} onValueChange={setUpdateStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="officer">Assign Officer</Label>
                  <Select value={updateOfficer} onValueChange={setUpdateOfficer}>
                    <SelectTrigger id="officer">
                      <SelectValue placeholder="Select officer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {officers.map((off) => (
                        <SelectItem key={off._id} value={off._id}>
                          {off.name} ({off.department || 'General'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="remark">Progress Remarks / Update</Label>
                <Textarea
                  id="remark"
                  placeholder="Explain what is being done or next steps..."
                  value={updateRemark}
                  onChange={(e) => setUpdateRemark(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground italic">
                  * Citizen will see this update in their tracking dashboard.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateComplaint} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
