import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import { useMyJobs } from "@/hooks/useJobs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const PostJobDialog = () => {
  const { user } = useAuth();
  const { createJob } = useMyJobs();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    job_role: "",
    required_skills: "",
    salary_offered: "",
    job_description: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.job_role) { toast.error("Job role is required"); return; }
    setLoading(true);
    const error = await createJob({
      company_name: user?.user_metadata?.organization || "Company",
      job_role: form.job_role,
      required_skills: form.required_skills.split(",").map(s => s.trim()).filter(Boolean),
      salary_offered: Number(form.salary_offered) || 0,
      job_description: form.job_description,
      location: form.location,
      status: "active",
    });
    setLoading(false);
    if (!error) {
      toast.success("Job posted successfully!");
      setOpen(false);
      setForm({ job_role: "", required_skills: "", salary_offered: "", job_description: "", location: "" });
    } else {
      toast.error("Failed to post job");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" size="sm">
          <Plus size={16} /> Post New Job
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border">
        <DialogHeader>
          <DialogTitle className="font-heading">Post a New Job</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input placeholder="Job Role *" value={form.job_role} onChange={e => setForm(f => ({ ...f, job_role: e.target.value }))} className="bg-muted border-border" />
          <Input placeholder="Required Skills (comma separated)" value={form.required_skills} onChange={e => setForm(f => ({ ...f, required_skills: e.target.value }))} className="bg-muted border-border" />
          <Input placeholder="Salary Offered (₹)" type="number" value={form.salary_offered} onChange={e => setForm(f => ({ ...f, salary_offered: e.target.value }))} className="bg-muted border-border" />
          <Input placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="bg-muted border-border" />
          <Textarea placeholder="Job Description" value={form.job_description} onChange={e => setForm(f => ({ ...f, job_description: e.target.value }))} className="bg-muted border-border" />
          <Button variant="hero" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Post Job"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PostJobDialog;
