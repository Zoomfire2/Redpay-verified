import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, X } from "lucide-react";
import { useState, useEffect } from "react";

export function BroadcastBanner() {
  const { data: user } = useQuery({
    queryKey: ["auth-user-id"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });
  const uid = user?.id;
  const { data: banner } = useQuery({
    queryKey: ["active-broadcast", uid],
    enabled: !!uid,
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("broadcasts")
        .select("id, title, body, target_user_id, created_at")
        .eq("active", true)
        .or(`target_user_id.is.null,target_user_id.eq.${uid}`)
        .order("target_user_id", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const [dismissed, setDismissed] = useState<string | null>(null);
  useEffect(() => {
    setDismissed(typeof window !== "undefined" ? sessionStorage.getItem("rp_bd") : null);
  }, []);
  if (!banner || dismissed === banner.id) return null;
  const isPersonal = !!banner.target_user_id;

  return (
    <div className={`${isPersonal ? "bg-gradient-to-r from-primary/25 to-primary/10" : "gradient-red"} text-white`}>
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="size-8 shrink-0 rounded-full bg-white/20 grid place-items-center">
          <Megaphone className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-black text-sm truncate">{banner.title}</p>
            {isPersonal && <span className="text-[9px] uppercase bg-white/25 rounded-full px-2 py-0.5 font-bold">For you</span>}
          </div>
          <p className="text-xs whitespace-pre-wrap leading-relaxed mt-0.5 opacity-95">{banner.body}</p>
        </div>
        <button
          onClick={() => { sessionStorage.setItem("rp_bd", banner.id); setDismissed(banner.id); }}
          className="size-7 rounded-full bg-white/15 grid place-items-center shrink-0">
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
