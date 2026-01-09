import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, Role } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User, ShieldCheck, Briefcase, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

const LoginPage = () => {
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleRoleSelect = (role: Role) => {
        setSelectedRole(role);
        // Set mock email for easier testing
        if (role === "ADMIN") setEmail("admin@test.com");
        else if (role === "OFFICER") setEmail("officer@test.com");
        else setEmail("user@test.com");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole) {
            toast.error("Please select a role first");
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 800));

            await login(selectedRole, email);
            toast.success(`Welcome back, ${selectedRole}!`);

            // Redirect based on role
            switch (selectedRole) {
                case "ADMIN":
                    navigate("/admin/dashboard");
                    break;
                case "OFFICER":
                    navigate("/officer/dashboard");
                    break;
                default:
                    navigate("/user/dashboard");
            }
        } catch (error) {
            toast.error("Login failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] -z-10 animate-pulse delay-700" />

            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left Side: Role Selection */}
                <div className="space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight">Access Portal</h1>
                        <p className="text-muted-foreground text-lg">Select your role to manage city complaints efficiently.</p>
                    </div>

                    <div className="grid gap-4">
                        {[
                            { id: "USER", title: "Citizen", desc: "Report and track your complaints", icon: User, color: "bg-blue-500" },
                            { id: "ADMIN", title: "Administrator", desc: "Manage system and assign officers", icon: ShieldCheck, color: "bg-purple-500" },
                            { id: "OFFICER", title: "Field Officer", desc: "Update work progress on the go", icon: Briefcase, color: "bg-orange-500" },
                        ].map((role) => (
                            <button
                                key={role.id}
                                onClick={() => handleRoleSelect(role.id as Role)}
                                className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left hover-lift ${selectedRole === role.id
                                        ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                                        : "border-border bg-card hover:border-primary/50"
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl ${role.color} flex items-center justify-center text-white shadow-lg`}>
                                    <role.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">{role.title}</h3>
                                    <p className="text-sm text-muted-foreground">{role.desc}</p>
                                </div>
                                {selectedRole === role.id && <ArrowRight className="w-5 h-5 text-primary" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                    <Card className="border-border shadow-2xl glass-card">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold">Login</CardTitle>
                            <CardDescription>
                                Login as {selectedRole ? selectedRole.toLowerCase() : "a member"} to continue.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-lg font-semibold gap-2"
                                    disabled={isSubmitting || !selectedRole}
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 border-t border-border pt-6">
                            <div className="text-sm text-center text-muted-foreground">
                                Don't have an account?{" "}
                                <button className="text-primary font-semibold hover:underline">Sign up as Citizen</button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* Footer Info */}
            <div className="mt-12 text-muted-foreground text-sm">
                © 2026 Smart Complaint System • Secure Access Monitoring Enabled
            </div>
        </div>
    );
};

export default LoginPage;
