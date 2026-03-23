import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Job {
  id: string;
  recruiter_id: string;
  company_name: string;
  job_role: string;
  required_skills: string[];
  salary_offered: number;
  job_description: string;
  location: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    if (data) setJobs(data as unknown as Job[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
    const channel = supabase
      .channel("jobs_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "jobs" }, () => fetchJobs())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return { jobs, loading, refetch: fetchJobs };
};

export const useMyJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("recruiter_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setJobs(data as unknown as Job[]);
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, [user]);

  const createJob = async (job: Omit<Job, "id" | "recruiter_id" | "created_at" | "updated_at">) => {
    if (!user) return;
    const { error } = await supabase.from("jobs").insert({
      ...job,
      recruiter_id: user.id,
    } as any);
    if (!error) await fetchJobs();
    return error;
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    const { error } = await supabase.from("jobs").update(updates as any).eq("id", id);
    if (!error) await fetchJobs();
    return error;
  };

  return { jobs, loading, createJob, updateJob, refetch: fetchJobs };
};
