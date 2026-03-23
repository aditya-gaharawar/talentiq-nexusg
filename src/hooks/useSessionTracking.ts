import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useSessionTracking = () => {
  const { user } = useAuth();
  const sessionIdRef = useRef<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;

    const startSession = async () => {
      const role = user.user_metadata?.role || "student";
      const { data } = await supabase
        .from("user_sessions")
        .insert({
          user_id: user.id,
          role,
          status: "online",
          device_info: navigator.userAgent,
        } as any)
        .select("id")
        .single();
      if (data) sessionIdRef.current = data.id;
    };

    const updateActivity = async () => {
      if (!sessionIdRef.current) return;
      await supabase
        .from("user_sessions")
        .update({ last_active_time: new Date().toISOString(), status: "online" } as any)
        .eq("id", sessionIdRef.current);
    };

    const endSession = async () => {
      if (!sessionIdRef.current) return;
      await supabase
        .from("user_sessions")
        .update({ logout_time: new Date().toISOString(), status: "offline" } as any)
        .eq("id", sessionIdRef.current);
      sessionIdRef.current = null;
    };

    startSession();
    intervalRef.current = window.setInterval(updateActivity, 60000); // Every minute

    const handleBeforeUnload = () => { endSession(); };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      endSession();
    };
  }, [user]);
};
