import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ComplaintForm from "@/components/ComplaintForm";
import ComplaintTracker from "@/components/ComplaintTracker";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <ComplaintForm />
        <ComplaintTracker />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
