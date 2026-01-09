import { useState, useEffect } from "react";
import { Search, Clock, CheckCircle2, AlertCircle, ArrowRight, Calendar, MapPin, Tag, FileText, History, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ComplaintTracker = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await fetch("/api/complaints/public/summary");
        const result = await response.json();
        if (result.success) {
          setRecentComplaints(result.data.recent || []);
        }
      } catch (err) {
        console.error("Fetch recent error:", err);
      }
    };
    fetchRecent();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setIsLoading(true);
    setSearchResult(null);

    try {
      const response = await fetch(`/api/complaints/${searchId.replace("#", "")}`);
      const result = await response.json();
      if (result.success && result.data) {
        setSearchResult(result.data);
        toast.success("Complaint found!");
      } else {
        toast.error("Complaint not found. Please check the ID.");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("An error occurred during search.");
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors: any = {
    "OPEN": "bg-warning/10 text-warning border-warning/20",
    "IN PROGRESS": "bg-accent/10 text-accent border-accent/20",
    "RESOLVED": "bg-success/10 text-success border-success/20",
    "CLOSED": "bg-muted text-muted-foreground",
    "ESCALATED": "bg-destructive/10 text-destructive border-destructive/20",
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "RESOLVED": return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "IN PROGRESS": return <Clock className="w-5 h-5 text-accent" />;
      case "ESCALATED": return <AlertCircle className="w-5 h-5 text-destructive" />;
      default: return <Clock className="w-5 h-5 text-warning" />;
    }
  };

  return (
    <div className="space-y-12 py-10">
      {/* Search Section */}
      <section className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Search className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Live Tracking</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Track Status</h2>
          <p className="text-muted-foreground">Enter your tracking ID to see real-time updates and official remarks.</p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="e.g., 65d... (ID from submission)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="flex-1 h-12 bg-card border-border"
          />
          <Button type="submit" size="lg" className="h-12 px-8 gap-2" disabled={isLoading}>
            {isLoading ? <Clock className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Track Status
          </Button>
        </form>
      </section>

      {/* Search Result */}
      {searchResult && (
        <section className="max-w-4xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-accent/20 bg-accent/5 overflow-hidden shadow-xl">
            <div className="bg-accent/10 p-6 border-b border-accent/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-bold">{searchResult.title}</h3>
                  <Badge className={statusColors[searchResult.status]}>
                    {searchResult.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-mono">ID: {searchResult._id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Submitted on</p>
                <p className="font-semibold text-lg">{new Date(searchResult.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-1 space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Details
                    </h4>
                    <div className="space-y-4">
                      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1 uppercase font-bold">Category</p>
                        <p className="font-medium text-accent">{searchResult.category}</p>
                      </div>
                      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1 uppercase font-bold">Priority</p>
                        <Badge variant="outline" className={searchResult.priority === 'CRITICAL' ? 'border-destructive text-destructive' : ''}>
                          {searchResult.priority}
                        </Badge>
                      </div>
                      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1 uppercase font-bold">Assigned Officer</p>
                        <p className="font-medium">{searchResult.assignedOfficer?.name || "Pending Assignment"}</p>
                        {searchResult.assignedOfficer?.department && (
                          <p className="text-xs text-muted-foreground">{searchResult.assignedOfficer.department}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Progress History
                  </h4>
                  <div className="space-y-0">
                    {searchResult.history && searchResult.history.length > 0 ? (
                      [...searchResult.history].reverse().map((item: any, idx: number) => (
                        <div key={idx} className="relative pl-10 pb-10 last:pb-0">
                          {idx !== searchResult.history.length - 1 && (
                            <div className="absolute left-[19px] top-6 bottom-0 w-px bg-border" />
                          )}
                          <div className={`absolute left-0 top-0 w-10 h-10 rounded-full bg-card border-2 flex items-center justify-center z-10 
                            ${idx === 0 ? 'border-accent shadow-glow' : 'border-border'}`}>
                            {getStatusIcon(item.status)}
                          </div>
                          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm hover:border-accent/30 transition-all">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
                              <Badge className={`${statusColors[item.status]} px-3 py-1 font-bold`}>
                                {item.status}
                              </Badge>
                              <p className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                {new Date(item.timestamp).toLocaleString()}
                              </p>
                            </div>
                            {item.remark && (
                              <div className="mt-3 p-4 bg-accent/5 rounded-xl border-l-4 border-accent italic text-sm text-foreground/90">
                                "{item.remark}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 bg-card rounded-2xl border border-dashed border-border">
                        <p className="text-muted-foreground">Initial registration only.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Recent List */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Community Activity</h2>
            <p className="text-muted-foreground">Recent public issues being addressed.</p>
          </div>
          <Button variant="ghost" className="gap-2 group">
            All Issues
            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentComplaints.slice(0, 3).map((complaint) => (
            <Card key={complaint._id} className="hover-lift border-border/50 group overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="secondary" className="bg-accent/5 text-accent border-accent/10">
                      {complaint.category}
                    </Badge>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <h4 className="font-bold text-lg mb-2 group-hover:text-accent transition-colors line-clamp-1">{complaint.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{complaint.location?.address || "Street View"}</span>
                  </div>
                </div>
                <div className="px-6 py-4 bg-muted/30 border-t border-border/50 flex items-center justify-between">
                  <Badge className={statusColors[complaint.status]}>
                    {complaint.status}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-2" onClick={() => {
                    setSearchId(complaint._id);
                    setSearchResult(complaint);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}>
                    Details
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ComplaintTracker;
