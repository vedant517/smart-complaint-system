import Header from "@/components/Header";
import ComplaintTracker from "@/components/ComplaintTracker";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PublicTracker = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link to="/">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
                <div className="max-w-4xl mx-auto">
                    <ComplaintTracker />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PublicTracker;
