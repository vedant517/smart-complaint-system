import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Upload, MapPin, FileText, User, Mail, Phone, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const ComplaintForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    email: "",
    phone: "",
    category: "",
    location: "",
    description: "",
    impactLevel: "Low",
    anonymous: false,
  });
  const [files, setFiles] = useState<{ name: string; base64: string }[]>([]);
  const [prediction, setPrediction] = useState<{ priority: string; score: number } | null>(null);

  // Real-time Priority Logic (Mirroring Backend)
  useEffect(() => {
    const text = `${formData.title} ${formData.description}`.toLowerCase();
    if (text.trim().length < 5) {
      setPrediction(null);
      return;
    }

    let keywordScore = 25;
    if (["fire", "collapse", "accident", "life", "injury", "fatal", "critical"].some(s => text.includes(s))) keywordScore = 100;
    else if (["leak", "flood", "overflow", "electrical", "gas", "crime"].some(s => text.includes(s))) keywordScore = 75;
    else if (["not working", "slow", "delay", "broken", "issue", "problem"].some(s => text.includes(s))) keywordScore = 50;

    const impactMap: any = { 'Life-Threatening': 100, 'High': 75, 'Medium': 50, 'Low': 25 };
    const impactScore = impactMap[formData.impactLevel] || 25;

    // Weights mirroring backend logic
    const score = Math.round((keywordScore * 0.4) + (impactScore * 0.4) + (files.length > 0 ? 20 : 0));

    let priority = 'LOW';
    if (score >= 85) priority = 'CRITICAL';
    else if (score >= 70) priority = 'HIGH';
    else if (score >= 40) priority = 'MEDIUM';

    setPrediction({ priority, score });
  }, [formData.title, formData.description, formData.impactLevel, files.length]);

  const categories = [
    { value: "Infrastructure", label: "Infrastructure & Roads" },
    { value: "Utilities", label: "Utilities (Water, Electricity)" },
    { value: "Sanitation", label: "Sanitation & Waste" },
    { value: "Public Safety", label: "Public Safety" },
    { value: "Environment", label: "Environment & Pollution" },
    { value: "Transport", label: "Public Transport" },
    { value: "Other", label: "Other" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      Array.from(selectedFiles).forEach((file) => {
        // 10MB individual file limit
        if (file.size > 10 * 1024 * 1024) {
          toast.error("File too large", {
            description: `${file.name} exceeds the 10MB limit.`,
          });
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setFiles((prev) => [...prev, { name: file.name, base64: reader.result as string }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Submitting complaint with data:", { ...formData, evidenceCount: files.length });

      // Check total size to avoid MongoDB 16MB limit
      const totalSize = files.reduce((acc, f) => acc + f.base64.length, 0);
      if (totalSize > 15 * 1024 * 1024) {
        toast.error("Files too large", {
          description: "Total size of attachments must be under 15MB.",
        });
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          reporter: {
            name: formData.name,
            email: formData.email,
          },
          impactLevel: formData.impactLevel,
          anonymous: formData.anonymous,
          evidence: files.map(f => f.base64),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to submit complaint";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        toast.error("Submission failed", {
          description: errorMessage,
        });
        setIsSubmitting(false);
        return;
      }

      const result = await response.json();

      if (result.success) {
        toast.success("Complaint submitted successfully!", {
          description: `Your tracking ID: ${result.data.complaint._id}`,
        });
        setFormData({
          title: "",
          name: "",
          email: "",
          phone: "",
          category: "",
          location: "",
          description: "",
          impactLevel: "Low",
          anonymous: false,
        });
        setFiles([]);
      } else {
        toast.error("Failed to submit complaint", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="submit" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
              <FileText className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Submit a Complaint</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Report Your Issue
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Fill out the form below with details about your complaint. We'll review it and get back to you promptly.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-3xl p-6 sm:p-10 shadow-card border border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title field */}
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Complaint Title
                </Label>
                <Input
                  id="title"
                  placeholder="Summarize your issue (e.g., Street light broken on Oak Ave)"
                  required
                  className="h-12"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    required
                    className="h-12"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    className="h-12"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="h-12"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Category
                  </Label>
                  <Select onValueChange={handleCategoryChange} value={formData.category} required>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Location / Address
                </Label>
                <Input
                  id="location"
                  placeholder="Enter the address or describe the location"
                  required
                  className="h-12"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              {/* Description and Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="impactLevel" className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    Impact Level
                  </Label>
                  <Select
                    onValueChange={(val) => setFormData(prev => ({ ...prev, impactLevel: val }))}
                    value={formData.impactLevel}
                    required
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="How serious is this?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Life-Threatening">Life-Threatening</SelectItem>
                      <SelectItem value="High">High (Immediate Action)</SelectItem>
                      <SelectItem value="Medium">Medium (Resolved in few days)</SelectItem>
                      <SelectItem value="Low">Low (General Query/Issue)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anonymous" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Submit Anonymously?
                  </Label>
                  <Select
                    onValueChange={(val) => setFormData(prev => ({ ...prev, anonymous: val === "yes" }))}
                    value={formData.anonymous ? "yes" : "no"}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No, share my name</SelectItem>
                      <SelectItem value="yes">Yes, keep me private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Complaint Details</Label>
                <Textarea
                  id="description"
                  placeholder="Please describe your complaint in detail. Include relevant dates, times, and any other information that might help us address your issue..."
                  required
                  className="min-h-[150px] resize-none"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Attachments (PDF/Images)</Label>
                <div
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/50 hover:bg-accent/5 transition-colors cursor-pointer"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Click to upload files
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports: JPG, PNG, PDF (Max 10MB each)
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                  />
                </div>
                {files.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {files.map((file, index) => (
                      <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-muted">
                        {file.base64.startsWith('data:image') ? (
                          <img src={file.base64} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-10 h-10 text-muted-foreground" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Prediction Section */}
              {prediction && (
                <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 flex items-center justify-between animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/20">
                      <ShieldAlert className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">AI Priority Insight</p>
                      <p className="text-sm font-medium">Predicted Priority: <span className={
                        prediction.priority === 'CRITICAL' ? "text-destructive" :
                          prediction.priority === 'HIGH' ? "text-warning" : "text-success"
                      }>{prediction.priority}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Confidence Score</p>
                    <p className="text-lg font-bold text-accent">{prediction.score}%</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  disabled={isSubmitting}
                  className="min-w-[200px]"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Complaint
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComplaintForm;
