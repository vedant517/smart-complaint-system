import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, LayoutDashboard, FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const UserDashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-background">
            <nav className="border-b bg-card">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            <LayoutDashboard size={18} />
                        </div>
                        <span className="font-bold text-lg">Citizen Portal</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden sm:inline">Hello, {user?.name}</span>
                        <Button variant="outline" size="sm" gap-2 onClick={logout}>
                            <LogOut size={16} />
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">My Dashboard</h1>
                    <p className="text-muted-foreground">Manage and track your submitted complaints.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { title: "Total Complaints", value: "3", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
                        { title: "In Progress", value: "1", icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
                        { title: "Resolved", value: "2", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
                        { title: "Escalated", value: "0", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
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

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <Link to="/#submit">
                            <Button className="w-full h-16 text-lg font-semibold gap-3" variant="hero">
                                <FileText />
                                File New Complaint
                            </Button>
                        </Link>
                        <Link to="/#track">
                            <Button className="w-full h-16 text-lg font-semibold gap-3" variant="outline">
                                <Clock />
                                Track Status
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default UserDashboard;
