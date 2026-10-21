import { z } from "zod";

// Every URL stored in the database is rendered into href/src attributes, so only
// http(s) and same-site paths are accepted. This blocks javascript:/data: URLs.
const url = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => v === "" || /^https?:\/\//i.test(v) || /^\/(?!\/)/.test(v), "Must be an http(s) URL or a /path");

const text = (max = 500) => z.string().trim().max(max);
const list = (max = 50, itemMax = 200) => z.array(text(itemMax)).max(max).default([]);
const order = z.number().int().min(-100000).max(100000).default(0);

export const contentTypes = ["text", "image", "gif", "notebook", "code", "html"] as const;

// "content" holds markdown for text, source for code, inline HTML or a URL for
// html, and a URL for image/gif/notebook.
export const contentBlock = z.object({
  type: z.enum(contentTypes),
  content: z.string().max(200_000).default(""),
  language: text(40).optional(),
  category: z.boolean().optional(),
  fileType: z.enum(["link", "upload"]).optional(),
});

export const projectSchema = z.object({
  title: text(200).min(1),
  description: text(5000).default(""),
  tags: list(),
  subtags: list(),
  keyPoints: list(10),
  image: url.default(""),
  youtube: text(300).default(""),
  notebookUrl: url.default(""),
  githubUrl: url.default(""),
  liveUrl: url.default(""),
  blogUrl: url.default(""),
  featured: z.boolean().default(false),
  order,
  sections: z
    .array(z.object({ title: text(200).default(""), content: z.array(contentBlock).max(100) }))
    .max(50)
    .default([]),
});

export const certificateSchema = z.object({
  title: text(200).min(1),
  description: text(5000).default(""),
  tags: list(),
  image: url.default(""),
  credentialUrl: url.default(""),
  date: text(40).default(""),
  instituteName: text(200).default(""),
  location: text(200).default(""),
  featured: z.boolean().default(false),
  order,
});

export const directorySchema = z.object({
  name: text(200).min(1),
  type: z.enum(["folder", "file"]),
  parentId: z.string().max(64).nullable().default(null),
  featured: z.boolean().default(false),
  order,
  learningItem: z
    .object({
      title: text(200).default(""),
      keywords: list(),
      content: z.array(contentBlock).max(100).default([]),
    })
    .optional(),
});

export const skillIcons = ["code", "globe", "database", "library", "book", "bookplus", "school", "server", "bot", "brain", "cloud", "wrench"] as const;

export const skillCategorySchema = z.object({
  name: text(100).min(1),
  icon: z.enum(skillIcons).default("code"),
  skills: list(60, 100),
  featured: z.boolean().default(false),
  order,
});

export const experienceSections = ["Academic", "Professional", "Offers", "Participations"] as const;

export const experienceSchema = z.object({
  section: z.enum(experienceSections),
  title: text(200).min(1),
  description: text(1000).default(""),
  institution: text(200).default(""),
  dateRange: text(100).default(""),
  order,
});

export const achievementSchema = z.object({
  text: text(200).min(1),
  icon: text(16).default("🏆"),
  link: url.default(""),
  order,
});

export const contributionSchema = z.object({
  title: text(200).min(1),
  keyPoints: list(10),
  link: url.default(""),
  order,
});

export const socialPlatforms = ["github", "linkedin", "kaggle", "twitter", "youtube", "instagram", "medium", "website", "email"] as const;

export const profileSchema = z.object({
  name: text(100).min(1),
  initials: text(4).default(""),
  avatar: url.default(""),
  headline: text(200).default(""),
  focusAreas: list(10),
  keySkills: text(500).default(""),
  footerTagline: text(200).default(""),
  resumeUrl: url.default(""),
  socials: z.array(z.object({ platform: z.enum(socialPlatforms), url: url })).max(15).default([]),
  about: z
    .object({
      title: text(100).default("Why Choose Me?"),
      paragraphs: list(10, 3000),
      expertise: list(10, 100),
      ctaTitle: text(100).default(""),
      ctaText: text(1000).default(""),
    })
    .default({}),
});

export const contactSchema = z.object({
  name: text(100).min(1),
  email: z.string().trim().email().max(200),
  message: text(5000).min(1),
  // Honeypot field: real users never fill it in.
  website: z.string().max(0).optional(),
});

export const collections = {
  projects: projectSchema,
  certificates: certificateSchema,
  directories: directorySchema,
  skills: skillCategorySchema,
  experience: experienceSchema,
  achievements: achievementSchema,
  contributions: contributionSchema,
} as const;

export type CollectionName = keyof typeof collections;
type WithId<T> = T & { id: string };

export type ContentBlock = z.infer<typeof contentBlock>;
export type Project = WithId<z.infer<typeof projectSchema>>;
export type Certificate = WithId<z.infer<typeof certificateSchema>>;
export type DirectoryItem = WithId<z.infer<typeof directorySchema>> & { children?: DirectoryItem[] };
export type LearningItem = NonNullable<z.infer<typeof directorySchema>["learningItem"]>;
export type SkillCategory = WithId<z.infer<typeof skillCategorySchema>>;
export type SkillIcon = (typeof skillIcons)[number];
export type Experience = WithId<z.infer<typeof experienceSchema>>;
export type ExperienceSection = (typeof experienceSections)[number];
export type Achievement = WithId<z.infer<typeof achievementSchema>>;
export type Contribution = WithId<z.infer<typeof contributionSchema>>;
export type Profile = z.infer<typeof profileSchema>;
export type SocialPlatform = (typeof socialPlatforms)[number];
export type ContactMessage = WithId<Omit<z.infer<typeof contactSchema>, "website">> & { createdAt: string; read?: boolean };
