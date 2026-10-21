import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Award, BookOpen, Calendar, CheckCircle, Code, ExternalLink, FileText, Github, Mail, Users, Sparkles } from "lucide-react";
import type { Achievement, Certificate, Contribution, DirectoryItem, Project, SkillCategory as Skill } from "@shared/schemas";
import { seedAchievements } from "@shared/seed-data";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useApi } from "@/lib/api";
import { learningPath, prettyTag, projectPath } from "@/lib/content";
import { useProfile } from "@/lib/profile";
import { useSkills } from "@/lib/useSkills";
import { SkillIconView, socialIconMap } from "@/lib/icons";
import AboutSection from "./AboutSection";
import ContactMeModal from "./ContactMeModal";
import { useStaticSeo } from "@/lib/seo";

/** Featured items first; if nothing is marked featured yet, show the first few so the section isn't empty. */
function useFeatured<T extends { featured?: boolean }>(path: string, limit: number) {
  const { data, loading } = useApi<T[]>(path, []);
  const featured = data.filter((d) => d.featured);
  return { items: (featured.length ? featured : data).slice(0, limit), loading };
}

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.45 },
};

const card =
  "group h-full rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-500/30";

/** One heading pattern for every home section: title + subtitle on the left, "view all" on the right. */
function Section({
  id,
  title,
  subtitle,
  icon,
  action,
  tinted = false,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action?: { to: string; label: string };
  tinted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`w-full py-16 sm:py-20 ${tinted ? "bg-muted/40 border-y border-border/60" : ""}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...reveal} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-10">
          <div>
            <h2 className="flex items-center gap-2.5 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {icon}
              </span>
              {title}
            </h2>
            {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
          </div>
          {action && (
            <Link
              to={action.to}
              className="group/link inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
            >
              {action.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5" />
            </Link>
          )}
        </motion.div>
        {children}
      </div>
    </section>
  );
}

const Grid = ({ children, cols = 3 }: { children: React.ReactNode; cols?: 3 | 4 }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 ${cols === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-6`}>{children}</div>
);

const Shimmer = ({ count, tall = false }: { count: number; tall?: boolean }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`${tall ? "h-80" : "h-56"} rounded-2xl bg-muted animate-pulse`} />
    ))}
  </>
);

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-foreground/80">
    {children}
  </span>
);

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  return (
    <motion.div {...reveal} transition={{ duration: 0.45, delay: index * 0.08 }} className={`${card} p-6`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <SkillIconView icon={skill.icon} className="h-5 w-5" />
        </span>
        <h3 className="text-lg font-semibold text-foreground">{skill.name}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {skill.skills.map((s) => (
          <Chip key={s}>{s}</Chip>
        ))}
      </div>
    </motion.div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className={`${card} flex flex-col overflow-hidden`}>
      <Link to={projectPath(project)} className="block aspect-[16/10] overflow-hidden bg-muted" tabIndex={-1} aria-hidden="true">
        {project.image ? (
          <img src={project.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold text-foreground leading-snug">
          <Link to={projectPath(project)} className="hover:text-blue-600 dark:hover:text-blue-400">
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 3).map((t) => (
            <Chip key={t}>{prettyTag(t)}</Chip>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm font-medium">
          <Link to={projectPath(project)} className="text-blue-600 dark:text-blue-400 hover:underline">
            Read case study
          </Link>
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <ExternalLink className="h-3.5 w-3.5" /> Live
            </a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <Github className="h-3.5 w-3.5" /> Code
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

const formatDate = (d: string) => {
  if (!d) return "";
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
};

function CertificateCard({ certificate, onOpen }: { certificate: Certificate; onOpen: () => void }) {
  return (
    <article className={`${card} flex flex-col overflow-hidden`}>
      {/* Certificates are documents: show the whole page on a light mat instead of cropping it. */}
      <button type="button" onClick={onOpen} className="block aspect-[4/3] bg-white p-3 border-b border-border" aria-label={`View ${certificate.title}`}>
        {certificate.image ? (
          <img src={certificate.image} alt="" loading="lazy" className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full items-center justify-center text-blue-500">
            <Award className="h-12 w-12" />
          </div>
        )}
      </button>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold text-foreground leading-snug line-clamp-2">{certificate.title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {certificate.instituteName}
          {certificate.date && ` · ${formatDate(certificate.date)}`}
        </p>
        <div className="flex-1" />
        {certificate.credentialUrl && (
          <a
            href={certificate.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline"
          >
            <CheckCircle className="h-4 w-4" /> Verify credential
          </a>
        )}
      </div>
    </article>
  );
}

function LearningCard({ item }: { item: DirectoryItem }) {
  return (
    <Link to={learningPath(item)} className={`${card} flex flex-col p-6`}>
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
        <BookOpen className="h-5 w-5" />
      </span>
      <h3 className="text-base font-semibold text-foreground leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400">
        {item.learningItem?.title || item.name}
      </h3>
      <div className="mt-3 flex flex-wrap gap-1.5 flex-1 content-start">
        {(item.learningItem?.keywords || []).slice(0, 4).map((k) => (
          <Chip key={k}>{prettyTag(k)}</Chip>
        ))}
      </div>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
        Read <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function ContributionCard({ contribution }: { contribution: Contribution }) {
  return (
    <article className={`${card} flex flex-col p-6`}>
      <h3 className="text-base font-semibold text-foreground">{contribution.title}</h3>
      <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground flex-1">
        {contribution.keyPoints.map((p) => (
          <li key={p} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
            {p}
          </li>
        ))}
      </ul>
      {contribution.link && (
        <a href={contribution.link} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          View <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </article>
  );
}

export default function EnhancedPortfolio() {
  useStaticSeo("/");
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const { skills: featuredSkills } = useSkills(true);
  const achievementsApi = useApi<Achievement[]>("/achievements", []);
  const achievements = achievementsApi.error ? seedAchievements.map((a, i) => ({ ...a, id: `seed-${i}` })) : achievementsApi.data;
  const projects = useFeatured<Project>("/projects", 3);
  const certificates = useFeatured<Certificate>("/certificates", 3);
  const contributions = useApi<Contribution[]>("/contributions", []);
  const directories = useApi<DirectoryItem[]>("/directories", []);
  const learningFiles = directories.data.filter((d) => d.type === "file" && d.learningItem);
  const learnings = (learningFiles.some((d) => d.featured) ? learningFiles.filter((d) => d.featured) : learningFiles).slice(0, 3);

  const fullText = profile.headline;
  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 60);
    return () => clearInterval(typingInterval);
  }, [fullText]);

  const openAchievement = (link: string) => {
    if (link.startsWith("/")) navigate(link);
    else window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* ---------- Hero ---------- */}
      <section className="relative w-full border-b border-border/60 bg-gradient-to-b from-blue-50/80 to-background dark:from-blue-950/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid gap-12 md:grid-cols-[1.4fr_1fr] items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center md:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" /> Open to AI/ML opportunities
            </p>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              <span className="block text-lg sm:text-xl font-medium text-muted-foreground mb-2">Hi, I'm</span>
              {profile.name}
            </h1>
            <p className="mt-4 text-lg sm:text-xl font-medium text-foreground/80 min-h-[1.75rem]" aria-label={fullText}>
              {typedText}
              <span className="ml-0.5 inline-block w-0.5 h-5 align-middle bg-blue-500 animate-pulse" aria-hidden="true" />
            </p>
            {profile.focusAreas.length > 0 && (
              <ul className="mt-6 flex flex-wrap justify-center md:justify-start gap-2" aria-label="Focus areas">
                {profile.focusAreas.map((area) => (
                  <li key={area}>
                    <Chip>{area}</Chip>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md"
              >
                <Mail className="h-4 w-4" /> Get in touch
              </button>
              <Link to="/projects" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted">
                View projects <ArrowRight className="h-4 w-4" />
              </Link>
              {profile.resumeUrl && (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  <FileText className="h-4 w-4" /> Resume
                </a>
              )}
            </div>
            <div className="mt-8 flex justify-center md:justify-start gap-3">
              {profile.socials.map(({ platform, url }) => {
                const { Icon, label } = socialIconMap[platform];
                return (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative mx-auto w-56 sm:w-72 md:w-80 aspect-square"
          >
            <div className="relative h-full w-full rounded-full p-1 bg-border shadow-xl">
              <img src={profile.avatar} alt={profile.name} className="h-full w-full rounded-full object-cover border-4 border-background" />
            </div>
          </motion.div>
        </div>

        {profile.keySkills && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
            <p className="text-center md:text-left text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Key skills:</span> {profile.keySkills}
            </p>
          </div>
        )}
      </section>

      {/* ---------- Highlights ---------- */}
      {achievements.length > 0 && (
        <section aria-label="Highlights" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((a, i) => {
              const content = (
                <>
                  <span className="text-2xl" aria-hidden="true">
                    {a.icon}
                  </span>
                  <span className="text-sm font-medium text-foreground leading-snug">{a.text}</span>
                </>
              );
              const cls = "flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm text-left";
              return (
                <motion.div key={a.id} {...reveal} transition={{ duration: 0.4, delay: i * 0.06 }}>
                  {a.link ? (
                    <button type="button" onClick={() => openAchievement(a.link)} className={`${cls} w-full h-full hover:border-blue-500/40 hover:shadow-md transition-all`}>
                      {content}
                    </button>
                  ) : (
                    <div className={`${cls} h-full`}>{content}</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {(projects.loading || projects.items.length > 0) && (
        <Section
          id="projects"
          title="Featured Projects"
          subtitle="Selected work across machine learning, data analysis and full-stack development."
          icon={<Code className="h-5 w-5" />}
          action={{ to: "/projects", label: "All projects" }}
        >
          <Grid>
            {projects.loading ? <Shimmer count={3} tall /> : projects.items.map((p) => <ProjectCard key={p.id} project={p} />)}
          </Grid>
        </Section>
      )}

      {featuredSkills.length > 0 && (
        <Section
          id="skills"
          tinted
          title="Core Skills"
          subtitle="The tools and fields I work with most."
          icon={<Sparkles className="h-5 w-5" />}
          action={{ to: "/resume", label: "All skills" }}
        >
          <Grid>
            {featuredSkills.map((skill, index) => (
              <SkillCard key={skill.id} skill={skill} index={index} />
            ))}
          </Grid>
        </Section>
      )}

      {(certificates.loading || certificates.items.length > 0) && (
        <Section
          id="certificates"
          title="Certifications"
          subtitle="Verified credentials from Google Cloud, AWS, IBM, Cisco and more."
          icon={<Award className="h-5 w-5" />}
          action={{ to: "/certificates", label: "All certificates" }}
        >
          <Grid>
            {certificates.loading ? (
              <Shimmer count={3} tall />
            ) : (
              certificates.items.map((c) => <CertificateCard key={c.id} certificate={c} onOpen={() => setSelectedCertificate(c)} />)
            )}
          </Grid>
        </Section>
      )}

      {learnings.length > 0 && (
        <Section
          id="learnings"
          tinted
          title="Learning Notes"
          subtitle="Write-ups from what I've been studying and building."
          icon={<BookOpen className="h-5 w-5" />}
          action={{ to: "/learnings", label: "All learnings" }}
        >
          <Grid>
            {learnings.map((l) => (
              <LearningCard key={l.id} item={l} />
            ))}
          </Grid>
        </Section>
      )}

      {contributions.data.length > 0 && (
        <Section id="contributions" title="Contributions" icon={<Users className="h-5 w-5" />}>
          <Grid>
            {contributions.data.map((c) => (
              <ContributionCard key={c.id} contribution={c} />
            ))}
          </Grid>
        </Section>
      )}

      <AboutSection contact={() => setIsContactModalOpen(true)} />

      <Dialog open={selectedCertificate !== null} onOpenChange={(open) => !open && setSelectedCertificate(null)}>
        <DialogContent className="max-w-4xl w-[calc(100%-2rem)] p-4 sm:p-6">
          {selectedCertificate && (
            <>
              <DialogTitle className="pr-8 text-lg sm:text-xl">{selectedCertificate.title}</DialogTitle>
              <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{selectedCertificate.instituteName}</span>
                {selectedCertificate.date && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {formatDate(selectedCertificate.date)}
                  </span>
                )}
              </p>
              {selectedCertificate.image && (
                <div className="rounded-lg bg-white p-2 border border-border">
                  <img src={selectedCertificate.image} alt={selectedCertificate.title} className="w-full max-h-[65vh] object-contain" />
                </div>
              )}
              {selectedCertificate.credentialUrl && (
                <a
                  href={selectedCertificate.credentialUrl}
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
      <ContactMeModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </div>
  );
}
