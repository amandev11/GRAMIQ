import { AppShell } from "@/components/app/AppShell";
import { DataBadge, GlassCard, SectionHeading } from "@/components/glass/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_SCHEMES } from "@/lib/data/demo";
import { AnimatePresence, motion } from "framer-motion";
import {
  Database, FileUp, ShieldCheck, Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Doc {
  id: string;
  name: string;
  chunks: number;
  status: "VERIFIED SOURCE" | "AI ESTIMATE" | "DEMO DATA";
  verified: string;
}

const INITIAL_DOCS: Doc[] = DEMO_SCHEMES.map((s) => ({
  id: s.id,
  name: s.source.title.replace(" (prototype knowledge base)", "") + ` — ${s.name}`,
  chunks: 6 + s.documents.length * 2,
  status: s.source.status,
  verified: s.source.lastVerified,
}));

/** RAG pipeline stages shown for architectural transparency. */
const PIPELINE = ["Document", "Text extraction", "Chunking", "Embedding", "Vector index", "Retrieval", "Rerank", "Cited answer"];

export default function Admin() {
  const [docs, setDocs] = useState<Doc[]>(INITIAL_DOCS);

  function removeDoc(id: string) {
    setDocs((d) => d.filter((x) => x.id !== id));
    toast.success("Document removed from index");
  }
  function verifyDoc(id: string) {
    setDocs((d) =>
      d.map((x) =>
        x.id === id ? { ...x, status: "VERIFIED SOURCE", verified: new Date().toISOString().slice(0, 10) } : x,
      ),
    );
    toast.success("Marked verified with today's date");
  }
  function upload() {
    const id = `doc-${Date.now()}`;
    setDocs((d) => [
      ...d,
      { id, name: `Uploaded document ${d.length + 1}.pdf`, chunks: 12, status: "AI ESTIMATE", verified: new Date().toISOString().slice(0, 10) },
    ]);
    toast.success("Document uploaded, chunked and indexed (prototype pipeline)");
  }

  const totalChunks = docs.reduce((s, d) => s + d.chunks, 0);

  return (
    <AppShell title="Knowledge Admin">
      <div className="space-y-6">
        <SectionHeading
          title="Knowledge Base Admin"
          desc="Manage the documents that ground scheme answers. Every RAG answer cites its source document and verification date."
        />

        {/* Pipeline */}
        <GlassCard className="p-5">
          <h3 className="flex items-center gap-2 font-display text-base font-bold">
            <Database className="size-4 text-primary" /> RAG pipeline
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {PIPELINE.map((p, i) => (
              <motion.span
                key={p}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-full bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary ring-1 ring-primary/15"
              >
                {p}
              </motion.span>
            ))}
          </div>
        </GlassCard>

        {/* Docs */}
        <GlassCard className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-bold">Indexed documents</h3>
              <p className="text-xs text-muted-foreground">{docs.length} documents · {totalChunks} chunks indexed</p>
            </div>
            <Button onClick={upload} className="gap-2 rounded-full">
              <FileUp className="size-4" /> Upload document
            </Button>
          </div>

          <ul className="mt-4 space-y-2">
            <AnimatePresence>
              {docs.map((d) => (
                <motion.li
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-wrap items-center gap-3 rounded-xl bg-foreground/5 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.chunks} chunks · verified {d.verified}
                    </p>
                  </div>
                  <DataBadge source={d.status} />
                  <Button variant="outline" size="sm" className="glass gap-1.5 rounded-full text-xs" onClick={() => verifyDoc(d.id)}>
                    <ShieldCheck className="size-3.5" /> Mark verified
                  </Button>
                  <Button variant="outline" size="sm" className="glass gap-1.5 rounded-full text-xs text-rose-600" onClick={() => removeDoc(d.id)}>
                    <Trash2 className="size-3.5" /> Remove
                  </Button>
                </motion.li>
              ))}
            </AnimatePresence>
            {docs.length === 0 && (
              <li className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
                No documents indexed. Upload a source to ground scheme answers.
              </li>
            )}
          </ul>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="border-emerald-600/25 bg-emerald-500/10 text-emerald-700">Verified — used with citation</Badge>
            <Badge variant="outline" className="border-violet-500/25 bg-violet-500/10 text-violet-300">AI estimate — labeled in answers</Badge>
            <Badge variant="outline" className="border-amber-600/30 bg-amber-500/10 text-amber-700">Demo data — never shown as real</Badge>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
