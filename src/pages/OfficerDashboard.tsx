import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, ClipboardList, Clock, AlertCircle, CheckCircle } from "lucide-react";

const OfficerDashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-background">
            <nav className="border-b bg-card">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                            <ClipboardList size={18} />
                        </div>
                        <span className="font-bold text-lg">Officer Portal</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden sm:inline">Officer: {user?.name}</span>
                        <Button variant="outline" size="sm" gap-2 onClick={logout}>
                            <LogOut size={16} />
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">My Assignments</h1>
                    <p className="text-muted-foreground">Manage and resolve assigned complaints within SLA.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                        { title: "Due Today", value: "2", icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
                        { title: "Overdue", value: "1", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
                        { title: "Completed", value: "12", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
                    ].map((stat, i) => (
                        <Card key={i} className="hover-lift border-border">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                        <p className="text-3xl font-bold mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                                        <stat.icon size={24} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
                    <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No Active Tasks</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        You don't have any complaints assigned to you for today. Check back later for new assignments.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default OfficerDashboard;
