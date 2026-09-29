import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, X, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

export function BroadcastBanner() {
  const qc = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ["auth-user-id"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });
  const uid = user?.id;
  const { data: banner } = useQuery({
    queryKey: ["active-broadcast", uid],
    enabled: !!uid,
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("broadcasts")
        .select("id, title, body, link, target_user_id, created_at, updated_at")
        .eq("active", true)
        .or(`target_user_id.is.null,target_user_id.eq.${uid}`)
        .order("target_user_id", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (!uid) return;
    const ch = supabase.channel(`broadcasts-${uid}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "broadcasts" },
        () => qc.invalidateQueries({ queryKey: ["active-broadcast", uid] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [uid, qc]);

  const [dismissed, setDismissed] = useState<string | null>(null);
  useEffect(() => {
    setDismissed(typeof window !== "undefined" ? sessionStorage.getItem("rp_bd") : null);
  }, []);
  if (!banner) return null;
  const key = `${banner.id}:${banner.updated_at}`;
  if (dismissed === key) return null;
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
          {banner.link && (
            <a href={banner.link} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-bold underline">
              Open link <ExternalLink className="size-3" />
            </a>
          )}
        </div>
        <button
          onClick={() => { sessionStorage.setItem("rp_bd", key); setDismissed(key); }}
          className="size-7 rounded-full bg-white/15 grid place-items-center shrink-0">
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
