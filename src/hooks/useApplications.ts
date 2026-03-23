import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Application {
  id: string;
  student_id: string;
  job_id: string;
  status: string;
  applied_date: string;
  interview_result: string | null;
  updated_at: string;
}

export interface ApplicationWithJob extends Application {
  job?: {
    id: string;
    company_name: string;
    job_role: string;
    salary_offered: number;
    required_skills: string[];
  };
}

export const useStudentApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("applications")
      .select("*, job:jobs(id, company_name, job_role, salary_offered, required_skills)")
      .eq("student_id", user.id)
      .order("applied_date", { ascending: false });
    if (data) setApplications(data as unknown as ApplicationWithJob[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
    const channel = supabase
      .channel("student_apps_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, () => fetchApplications())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const applyToJob = async (jobId: string) => {
    if (!user) return;
    const { error } = await supabase.from("applications").insert({
      student_id: user.id,
      job_id: jobId,
    } as any);
    if (!error) await fetchApplications();
    return error;
  };

  return { applications, loading, applyToJob, refetch: fetchApplications };
};

export const useRecruiterApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    if (!user) return;
    // Get recruiter's jobs first
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id")
      .eq("recruiter_id", user.id);
    if (!jobs || jobs.length === 0) { setLoading(false); return; }

    const jobIds = jobs.map(j => j.id);
    const { data } = await supabase
      .from("applications")
      .select("*")
      .in("job_id", jobIds)
      .order("applied_date", { ascending: false });
    
    // Get student profiles for these applications
    if (data && data.length > 0) {
      const studentIds = [...new Set(data.map(a => a.student_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, skills, cgpa, department, resume_url")
        .in("user_id", studentIds);
      
      const enriched = data.map(app => ({
        ...app,
        student: profiles?.find(p => p.user_id === app.student_id),
      }));
      setApplications(enriched);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
    const channel = supabase
      .channel("recruiter_apps_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, () => fetchApplications())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const updateStatus = async (appId: string, status: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ status } as any)
      .eq("id", appId);
    if (!error) await fetchApplications();
    return error;
  };

  return { applications, loading, updateStatus, refetch: fetchApplications };
};
