import { Shield, Clock, Bell, BarChart3, MessageSquare, Globe } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and protected. We prioritize your privacy and ensure all complaints are handled confidentially.",
    },
    {
      icon: Clock,
      title: "Quick Response",
      description: "Our team reviews complaints promptly. Most issues receive an initial response within 24 hours.",
    },
    {
      icon: Bell,
      title: "Real-time Updates",
      description: "Get instant notifications on your complaint status via email, SMS, or push notifications.",
    },
    {
      icon: BarChart3,
      title: "Track Progress",
      description: "Monitor your complaint journey with detailed progress tracking and status updates.",
    },
    {
      icon: MessageSquare,
      title: "Direct Communication",
      description: "Communicate directly with assigned officers through our built-in messaging system.",
    },
    {
      icon: Globe,
      title: "24/7 Accessibility",
      description: "Submit and track complaints anytime, anywhere. Our platform is always available.",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Why Choose Smart Complaint?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Experience a modern, efficient, and transparent complaint management system designed for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-7 h-7 text-accent group-hover:text-accent-foreground transition-colors" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
