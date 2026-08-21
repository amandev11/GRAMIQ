import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, type ReactNode } from "react";

export function GlassCard({
  className,
  children,
  hover = false,
  ...rest
}: {
  className?: string;
  children: ReactNode;
  hover?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      className={cn("glass rounded-2xl border-0", hover && "glass-hover", className)}
      {...rest}
    >
      {children}
    </Card>
  );
}

/** Animated counting number. */
export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 90, damping: 20 });
  const display = useTransform(spring, (v) =>
    format ? format(v) : Math.round(v).toLocaleString("en-IN"),
  );
  useEffect(() => {
    mv.set(value);
  }, [value, mv]);
  return <motion.span className={cn("tabular", className)}>{display}</motion.span>;
}

/** Provenance badge — VERIFIED SOURCE / AI ESTIMATE / DEMO DATA */
const sourceStyles: Record<string, string> = {
  "VERIFIED SOURCE": "bg-emerald-500/12 text-emerald-700 border-emerald-600/25",
  "AI ESTIMATE": "bg-sky-500/12 text-sky-700 border-sky-600/25",
  "DEMO DATA": "bg-amber-500/14 text-amber-700 border-amber-600/30",
};

export function DataBadge({ source, className }: { source: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
        sourceStyles[source] ?? sourceStyles["AI ESTIMATE"],
        className,
      )}
    >
      {source}
    </span>
  );
}

export function StatTile({
  label,
  value,
  sub,
  icon,
  tone = "default",
  format,
}: {
  label: string;
  value: number | string;
  sub?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "positive" | "negative" | "warning";
  format?: (n: number) => string;
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600"
      : tone === "negative"
        ? "text-rose-600"
        : tone === "warning"
          ? "text-amber-600"
          : "text-foreground";
  return (
    <GlassCard hover className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        {icon && <span className="text-muted-foreground/70">{icon}</span>}
      </div>
      <div className={cn("mt-2 font-display text-2xl font-bold sm:text-[1.7rem]", toneClass)}>
        {typeof value === "number" ? (
          <AnimatedNumber value={value} format={format} />
        ) : (
          value
        )}
      </div>
      {sub && <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{sub}</div>}
    </GlassCard>
  );
}

/** Circular readiness/score gauge. */
export function ScoreRing({
  score,
  size = 132,
  stroke = 11,
  label,
}: {
  score: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = score >= 75 ? "#0d9488" : score >= 55 ? "#d97706" : "#e11d48";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(0.6 0.03 220 / 12%)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * score) / 100 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold tabular">{score}</span>
        {label && <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">{label}</span>}
      </div>
    </div>
  );
}

export function SectionHeading({
  title,
  desc,
  badge,
  action,
}: {
  title: string;
  desc?: string;
  badge?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {badge}
        </div>
        {desc && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function DemoBanner({ isDemo }: { isDemo: boolean }) {
  if (!isDemo) return null;
  return (
    <Badge variant="outline" className="gap-1 border-amber-500/40 bg-amber-400/15 text-[10px] font-bold tracking-widest text-amber-700 uppercase">
      Demo Mode · Sample Entrepreneur
    </Badge>
  );
}
