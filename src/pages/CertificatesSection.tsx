import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Calendar, CheckCircle, MapPin } from "lucide-react";
import type { Certificate } from "@shared/schemas";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useApi } from "@/lib/api";
import { prettyTag, uniqueSorted } from "@/lib/content";
import PageHeader, { FilterPills, PageShell } from "@/component/PageHeader";
import { useStaticSeo } from "@/lib/seo";

const ANY = "All";

const formatDate = (d: string) => {
  if (!d) return "";
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
};

function CertificateCard({ certificate, onClick }: { certificate: Certificate; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-500/30"
    >
      {/* Certificates are documents: show the whole page on a light mat instead of cropping it. */}
      <div className="aspect-[4/3] w-full bg-white p-3 border-b border-border">
        {certificate.image ? (
          <img src={certificate.image} alt="" loading="lazy" className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full items-center justify-center text-blue-500">
            <Award className="h-12 w-12" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {certificate.tags.map((t) => (
            <span key={t} className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
              {prettyTag(t)}
            </span>
          ))}
        </div>
        <h2 className="text-base font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {certificate.title}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {certificate.instituteName}
          {certificate.date && ` · ${formatDate(certificate.date)}`}
        </p>
      </div>
    </button>
  );
}

export default function CertificatesSection() {
  useStaticSeo("/certificates");
  const { data: certificates, loading, error } = useApi<Certificate[]>("/certificates", []);
  const [activeTag, setActiveTag] = useState(ANY);
  const [selected, setSelected] = useState<Certificate | null>(null);
  const allTags = [ANY, ...uniqueSorted(certificates.flatMap((c) => c.tags))];
  const filtered = activeTag === ANY ? certificates : certificates.filter((c) => c.tags.includes(activeTag));

  return (
    <PageShell>
      <PageHeader eyebrow="Credentials" title="Certificates" subtitle="Courses and certifications I've completed, each with a link to verify it." />

      <div className="mb-10">
        <FilterPills options={allTags} active={activeTag} onChange={setActiveTag} format={prettyTag} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <div key={`shimmer-${i}`} className="h-80 rounded-2xl bg-muted animate-pulse" />)
            : filtered.map((certificate) => (
                <motion.div
                  key={certificate.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                >
                  <CertificateCard certificate={certificate} onClick={() => setSelected(certificate)} />
                </motion.div>
              ))}
        </AnimatePresence>
      </div>
      {!loading && filtered.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">
          {error ? "Could not load certificates right now. Please try again later." : "No certificates in this category yet."}
        </p>
      )}

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-4xl w-[calc(100%-2rem)] max-h-[92vh] overflow-y-auto p-4 sm:p-6">
          {selected && (
            <>
              <DialogTitle className="pr-8 text-lg sm:text-xl leading-snug">{selected.title}</DialogTitle>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{selected.instituteName}</span>
                {selected.date && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {formatDate(selected.date)}
                  </span>
                )}
                {selected.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {selected.location}
                  </span>
                )}
              </div>
              {selected.image && (
                <a href={selected.image} target="_blank" rel="noopener noreferrer" className="block rounded-lg bg-white p-2 border border-border" title="Open full size">
                  <img src={selected.image} alt={selected.title} className="w-full max-h-[60vh] object-contain" />
                </a>
              )}
              {selected.description && <p className="text-sm leading-relaxed text-muted-foreground">{selected.description}</p>}
              {selected.credentialUrl && (
                <a
                  href={selected.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-1.5 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  <CheckCircle className="h-4 w-4" /> Verify credential
                </a>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
