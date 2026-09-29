import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, formatNaira } from "@/components/app-shell";
import { completeTask, getMyProfile } from "@/lib/redpay.functions";
import { useState } from "react";
import { toast } from "sonner";
import { Check, ExternalLink, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({ meta: [{ title: "Tasks — RedPay" }] }),
  component: Tasks,
});

function Tasks() {
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getMyProfile);
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => (await supabase.from("tasks").select("*").order("created_at")).data ?? [],
  });
  const { data: done = [] } = useQuery({
    queryKey: ["task-completions"],
    queryFn: async () => (await supabase.from("task_completions").select("task_id")).data ?? [],
  });
  const doneSet = new Set(done.map((d: any) => d.task_id));
  const doComplete = useServerFn(completeTask);
  const [busyId, setBusyId] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: (taskId: string) => doComplete({ data: { taskId } }),
    onSuccess: (res, taskId) => {
      if (res.ok) { toast.success(`+${formatNaira(res.amount)}`); }
      else toast.info("Already completed");
      qc.invalidateQueries({ queryKey: ["task-completions"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      setBusyId(null);
    },
    onError: () => { toast.error("Failed"); setBusyId(null); },
  });

  return (
    <AppShell>
      <header className="p-4">
        <h1 className="text-xl font-bold">Paid tasks</h1>
        <p className="text-xs text-muted-foreground mt-1">Earn ₦950 per completed task. New tasks added daily.</p>
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-card border border-border p-3">
          <div>
            <p className="text-[11px] text-muted-foreground">Balance</p>
            <p className="font-bold">{formatNaira(profile?.balance)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-muted-foreground">Completed</p>
            <p className="font-bold">{done.length}/{tasks.length}</p>
          </div>
        </div>
      </header>

      <ul className="px-4 space-y-2 pb-4">
        {tasks.map((t: any) => {
          const isDone = doneSet.has(t.id);
          return (
            <li key={t.id} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
              <div className={`size-10 rounded-xl grid place-items-center ${isDone ? "bg-success/20 text-success" : "bg-primary/15 text-primary"}`}>
                {isDone ? <Check className="size-5" /> : <ExternalLink className="size-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{t.title}</p>
                <p className="text-[11px] text-muted-foreground">{t.platform} • +{formatNaira(t.reward)}</p>
              </div>
              {isDone ? (
                <span className="text-[11px] font-semibold text-success">DONE</span>
              ) : (
                <button
                  onClick={() => {
                    window.open(t.url, "_blank", "noopener");
                    setBusyId(t.id);
                    setTimeout(() => mut.mutate(t.id), 1500);
                  }}
                  disabled={busyId === t.id}
                  className="rounded-full gradient-red text-white text-xs font-semibold px-3 py-1.5 inline-flex items-center gap-1"
                >
                  {busyId === t.id ? <Loader2 className="size-3 animate-spin" /> : null}
                  {busyId === t.id ? "Verifying" : "Go"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
