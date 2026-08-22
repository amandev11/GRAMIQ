import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/context/BusinessProvider";
import { ArrowLeft, Compass } from "lucide-react";
import { useNavigate } from "react-router";

export default function NotFound() {
  const navigate = useNavigate();
  const { hasBusiness } = useBusiness();

  return (
    <AppShell title="Not found">
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-indigo-500/12 text-indigo-300 ring-1 ring-indigo-500/20">
          <Compass className="size-6" />
        </span>
        <p className="mt-6 font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase">404</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">This page doesn't exist</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          The link may be old, or the address was mistyped. Your business data is safe — nothing was lost.
        </p>
        <div className="mt-7 flex items-center gap-3">
          <Button variant="outline" className="glass gap-2 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" /> Go back
          </Button>
          <Button className="gap-2 rounded-full" onClick={() => navigate(hasBusiness ? "/dashboard" : "/")}>
            {hasBusiness ? "Back to Dashboard" : "Back to Home"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
