import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  role: string;
  organization: string | null;
  phone_number: string | null;
  department: string | null;
  cgpa: number;
  resume_url: string | null;
  skills: string[];
  projects_count: number;
  certifications_count: number;
  mock_interview_score: number;
  placement_score: number;
  career_readiness_score: number;
  placement_status: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) { setProfile(null); setLoading(false); return; }
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (data) setProfile(data as unknown as Profile);
    setLoading(false);
  };

  useEffect(() => { fetchProfile(); }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update(updates as any)
      .eq("user_id", user.id);
    if (!error) await fetchProfile();
    return error;
  };

  return { profile, loading, updateProfile, refetch: fetchProfile };
};
