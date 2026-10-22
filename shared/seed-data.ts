// Content that used to be hardcoded in the React components. `npm run seed`
// loads it into MongoDB, and the site falls back to it if the API is unreachable.
import type { Achievement, Experience, Profile, SkillCategory } from "./schemas.js";

type Seed<T> = Omit<T, "id">;

export const seedProfile: Profile = {
  name: "Divyansh Rai",
  initials: "DR",
  avatar: "",
  headline: "AI Engineer @TCS | AI/ML Research & Development",
  focusAreas: [
    "Machine Learning & Deep Learning",
    "Computer Vision",
    "NLP & LLM Applications",
    "Data Analysis & Visualization",
    "Full-stack Development",
  ],
  keySkills: "Python, TensorFlow, PyTorch, Scikit-learn, LangChain, OpenCV, Pandas, SQL, React, Node.js",
  footerTagline: "AI Engineer, AI/ML Research & Development @ TCS",
  resumeUrl: "",
  socials: [
    { platform: "github", url: "https://github.com/iceticshacker7" },
    { platform: "linkedin", url: "https://www.linkedin.com/in/divyanshrai7" },
    { platform: "kaggle", url: "https://kaggle.com/divyanshrai7" },
  ],
  about: {
    title: "Building practical machine learning products",
    paragraphs: [
      "I'm an AI Engineer at Tata Consultancy Services, working in AI/ML research and development, and a B.Tech graduate in Artificial Intelligence & Machine Learning from Gyan Ganga Institute of Technology & Sciences (2020–2024, CGPA 8.7).",
      "I build machine learning and data products end to end: a real-time driver drowsiness detector using OpenCV and a CNN, Code Learner (an LLM assistant that answers questions about code repositories), and interactive analytics dashboards in Streamlit, Plotly and Tableau.",
      "In college I led the team that built our coding club's platform, solved 830+ problems on LeetCode and was a finalist at Microsoft Engage 2022. I'm looking for roles in machine learning engineering and applied AI.",
    ],
    expertise: [
      "Machine learning & deep learning (TensorFlow, PyTorch, Scikit-learn)",
      "Computer vision (OpenCV, CNNs)",
      "LLM applications (LangChain, OpenAI APIs)",
      "Data analysis & dashboards (Pandas, Plotly, Tableau)",
      "Full-stack web (React, Node.js, MongoDB)",
    ],
    ctaTitle: "Let's work together",
    ctaText: "Hiring for an ML or applied AI role, or have a project in mind? I'd be glad to hear from you.",
  },
};

export const seedSkills: Seed<SkillCategory>[] = [
  { name: "Machine Learning & Deep Learning", icon: "brain", skills: ["Machine Learning", "Deep Learning", "TensorFlow", "Keras", "PyTorch", "Scikit-learn", "Feature Engineering", "Statistics & Probability", "Mathematics"], featured: true, order: 1 },
  { name: "Generative AI & NLP", icon: "bot", skills: ["Natural Language Processing (NLP)", "LangChain", "OpenAI API (GPT)", "Hugging Face", "Claude", "Gemini", "GitHub Copilot", "v0.dev"], featured: true, order: 2 },
  { name: "Computer Vision", icon: "eye", skills: ["Computer Vision", "OpenCV", "CNNs", "Image Processing"], featured: true, order: 3 },
  { name: "Data Analysis & Visualization", icon: "chart", skills: ["Pandas", "NumPy", "SciPy", "Matplotlib", "Seaborn", "Plotly", "Streamlit", "Tableau"], featured: false, order: 4 },
  { name: "Programming Languages", icon: "code", skills: ["Python", "C++", "C", "JavaScript", "SQL"], featured: false, order: 5 },
  { name: "Web Development", icon: "globe", skills: ["React.js", "Node.js", "Express.js", "Tailwind CSS", "HTML5", "CSS"], featured: false, order: 6 },
  { name: "Cloud & Databases", icon: "cloud", skills: ["AWS (EC2, RDS)", "Google Cloud", "Oracle Cloud", "MongoDB Atlas", "MongoDB", "MySQL", "Vercel"], featured: false, order: 7 },
  { name: "CS Fundamentals", icon: "school", skills: ["Data Structures & Algorithms", "Object-Oriented Programming", "Database Management Systems", "Test-Driven Development"], featured: false, order: 8 },
  { name: "Developer Tools", icon: "wrench", skills: ["Git & GitHub", "Linux", "Docker", "Jupyter", "Visual Studio", "VirtualBox", "PuTTY"], featured: false, order: 9 },
];

export const seedExperience: Seed<Experience>[] = [
  { section: "Academic", title: "B.Tech - Artificial Intelligence & Machine Learning", description: "Grade : 8.7", institution: "Gyan Ganga Institute of Technology & Sciences, India", dateRange: "2020 - 2024", order: 1 },
  { section: "Academic", title: "Class XII", description: "Grade : 8.3", institution: "Maths, Physics, Chemistry | CBSE", dateRange: "2020", order: 2 },
  { section: "Academic", title: "Class X", description: "Percentage : 84.4%", institution: "Central Board of Secondary Education, India", dateRange: "2018", order: 3 },
  { section: "Professional", title: "Artificial Intelligence Engineer", description: "AI/ML research and development", institution: "Tata Consultancy Services, India", dateRange: "Jan 2025 - Present", order: 1 },
  { section: "Professional", title: "Systems Engineer (Trainee)", description: "Trainings: Java, SQL, UNIX, UI design", institution: "Tata Consultancy Services, India", dateRange: "August 2024 - December 2024", order: 2 },
  { section: "Offers", title: "Systems Engineer", description: "Full-time offer · joined August 2024", institution: "Tata Consultancy Services, India", dateRange: "18 July 2024", order: 1 },
  { section: "Offers", title: "Frontend Developer", description: "Full-time offer", institution: "Prodesk IT, India", dateRange: "20th July 2024", order: 2 },
  { section: "Offers", title: "NLP Research Internship", description: "Selected for a research internship in natural language processing", institution: "IIT Bombay, India", dateRange: "20th July 2024", order: 3 },
  { section: "Participations", title: "Finalist", description: "Developed a Data Analysis Dashboard using Tableau", institution: "Microsoft Engage 2022", dateRange: "2022", order: 1 },
  { section: "Participations", title: "Pre-Finalist", description: "Cleared the first round of the Hackathon", institution: "Flipkart Grid '22", dateRange: "2022", order: 2 },
];

export const seedAchievements: Seed<Achievement>[] = [
  { text: "830+ LeetCode problems · top 10% contest rating", icon: "🏆", link: "https://leetcode.com/divyanshrai7", order: 1 },
  { text: "Codeforces Pupil (max rating 1298)", icon: "📈", link: "https://codeforces.com/profile/dedicatedaf", order: 2 },
  { text: "9 certifications: AWS, Google Cloud, IBM, Cisco", icon: "🎓", link: "/certificates", order: 3 },
  { text: "Led the team behind our college coding club's platform", icon: "👥", link: "/projects/ggits-students-coding-club-website", order: 4 },
];
