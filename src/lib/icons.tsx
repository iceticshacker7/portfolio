import type { IconType } from "react-icons";
import { FaEnvelope, FaGithub, FaGlobe, FaInstagram, FaKaggle, FaLinkedin, FaMedium, FaXTwitter, FaYoutube } from "react-icons/fa6";
import {
  Book,
  BookPlus,
  Bot,
  Brain,
  Cloud,
  Code,
  Database,
  Globe,
  Library,
  School,
  Server,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { SkillIcon, SocialPlatform } from "@shared/schemas";

export const skillIconMap: Record<SkillIcon, LucideIcon> = {
  code: Code,
  globe: Globe,
  database: Database,
  library: Library,
  book: Book,
  bookplus: BookPlus,
  school: School,
  server: Server,
  bot: Bot,
  brain: Brain,
  cloud: Cloud,
  wrench: Wrench,
};

export const socialIconMap: Record<SocialPlatform, { Icon: IconType; label: string }> = {
  github: { Icon: FaGithub, label: "GitHub" },
  linkedin: { Icon: FaLinkedin, label: "LinkedIn" },
  kaggle: { Icon: FaKaggle, label: "Kaggle" },
  twitter: { Icon: FaXTwitter, label: "X / Twitter" },
  youtube: { Icon: FaYoutube, label: "YouTube" },
  instagram: { Icon: FaInstagram, label: "Instagram" },
  medium: { Icon: FaMedium, label: "Medium" },
  website: { Icon: FaGlobe, label: "Website" },
  email: { Icon: FaEnvelope, label: "Email" },
};

export function SkillIconView({ icon, className }: { icon: SkillIcon; className?: string }) {
  const Icon = skillIconMap[icon] ?? Code;
  return <Icon className={className} />;
}
