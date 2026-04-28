const { v4: uuid } = require("uuid");

function createSeedData(passwordHashAdmin, passwordHashUser) {
  const mod1 = uuid();
  const mod2 = uuid();
  const mod3 = uuid();
  const mod4 = uuid();

  const quiz1 = uuid();
  const quiz2 = uuid();
  const quiz3 = uuid();

  const adminId = uuid();
  const userId = uuid();

  const now = new Date().toISOString();

  return {
    company: {
      name: "NovaTech Solutions",
      tagline: "Building tomorrow's digital infrastructure",
      logo: "https://ui-avatars.com/api/?name=NT&background=6366f1&color=fff&size=128&bold=true&font-size=0.4",
    },
    users: [
      {
        id: adminId,
        name: "Ana Ferreira",
        email: "admin@local.test",
        passwordHash: passwordHashAdmin,
        role: "admin",
        createdAt: now,
        active: true,
      },
      {
        id: userId,
        name: "Diogo Castelo",
        email: "user@local.test",
        passwordHash: passwordHashUser,
        role: "user",
        createdAt: now,
        active: true,
      },
    ],

    modules: [
      {
        id: mod1,
        title: "Welcome to NovaTech",
        description: "Get to know our company, culture, values, and what makes NovaTech a great place to work.",
        order: 1,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: mod2,
        title: "Workplace & Policies",
        description: "Office guidelines, remote work policy, dress code, and important HR procedures you need to know.",
        order: 2,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: mod3,
        title: "Tools & Systems Setup",
        description: "Set up your development environment, access internal systems, and learn our core toolchain.",
        order: 3,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: mod4,
        title: "Your First Sprint",
        description: "Understand our agile workflow, meet your team, and deliver your first contribution.",
        order: 4,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
    ],

    contents: [
      // --- Module 1: Welcome to NovaTech ---
      {
        id: uuid(),
        moduleId: mod1,
        title: "About NovaTech Solutions",
        type: "text",
        contentOrUrl:
          "NovaTech Solutions was founded in 2018 with a mission to build reliable, scalable digital infrastructure for businesses across Europe. We believe in transparency, continuous learning, and delivering real value to our clients.\n\nOur team of 120+ professionals works across Lisbon, Porto, and remotely. We specialize in cloud architecture, enterprise applications, and data engineering.\n\nAs a new team member, you are now part of a culture that values collaboration, ownership, and growth.",
        order: 1,
        required: true,
      },
      {
        id: uuid(),
        moduleId: mod1,
        title: "Our Core Values",
        type: "text",
        contentOrUrl:
          "At NovaTech, everything we do is guided by five core values:\n\n1. Ownership — Take responsibility for your work and its impact.\n2. Transparency — Share openly, ask questions, give honest feedback.\n3. Continuous Learning — Grow every day; we invest in your development.\n4. Client Focus — Understand the problem before jumping to solutions.\n5. Team First — Great products are built by great teams, not individuals.\n\nThese values shape how we hire, how we work, and how we grow together.",
        order: 2,
        required: true,
      },
      {
        id: uuid(),
        moduleId: mod1,
        title: "Company Organization Chart",
        type: "document",
        contentOrUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
        order: 3,
        required: true,
      },
      {
        id: uuid(),
        moduleId: mod1,
        title: "Welcome Message from the CEO",
        type: "video",
        contentOrUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        order: 4,
        required: false,
      },

      // --- Module 2: Workplace & Policies ---
      {
        id: uuid(),
        moduleId: mod2,
        title: "Office Locations & Access",
        type: "text",
        contentOrUrl:
          "NovaTech has two main offices:\n\n• Lisbon HQ — Parque das Nações, Torre Oriente, 8th floor. Access via employee badge. Reception is staffed 8am–7pm.\n• Porto Lab — Rua de Cedofeita 312, 3rd floor. Co-working space with dedicated NovaTech area.\n\nBoth offices have meeting rooms (bookable via Outlook), a kitchen with free coffee and snacks, and quiet focus zones. Please keep shared spaces clean and respect noise levels in focus areas.",
        order: 1,
        required: true,
      },
      {
        id: uuid(),
        moduleId: mod2,
        title: "Remote Work Policy",
        type: "text",
        contentOrUrl:
          "We operate a hybrid-first model. You can work remotely up to 3 days per week. On-site presence is expected on Tuesdays and Thursdays for team syncs and collaboration.\n\nWhen working remotely:\n• Be available on Slack during core hours (10am–4pm).\n• Use your camera during meetings when possible.\n• Update your Slack status to reflect your availability.\n• Ensure you have a stable internet connection.\n\nFull remote arrangements can be discussed with your manager after the first 3 months.",
        order: 2,
        required: true,
      },
      {
        id: uuid(),
        moduleId: mod2,
        title: "Time Off & Leave Procedures",
        type: "text",
        contentOrUrl:
          "NovaTech offers 25 days of annual leave plus public holidays. To request time off:\n\n1. Submit your request in the HR portal at least 2 weeks in advance.\n2. Your manager will approve or discuss alternatives within 48 hours.\n3. For sick leave, notify your manager and HR by 9am on the first day.\n\nWe also offer 3 personal days per year for family matters, moving, or other needs — no questions asked.",
        order: 3,
        required: true,
      },
      {
        id: uuid(),
        moduleId: mod2,
        title: "NovaTech Employee Handbook",
        type: "document",
        contentOrUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
        order: 4,
        required: true,
      },

      // --- Module 3: Tools & Systems Setup ---
      {
        id: uuid(),
        moduleId: mod3,
        title: "Getting Your Accounts Ready",
        type: "text",
        contentOrUrl:
          "Before your first day of coding, you need access to:\n\n• Email — Google Workspace (your.name@novatech.pt)\n• Chat — Slack (channels: #general, #engineering, #your-team)\n• Code — GitHub Enterprise (github.novatech.pt)\n• Project Management — Jira (jira.novatech.pt)\n• Documentation — Confluence wiki\n• CI/CD — Jenkins pipelines\n\nIT will send you credentials via your personal email. If anything is missing after day 1, contact help@novatech.pt or #it-support on Slack.",
        order: 1,
        required: true,
      },
      {
        id: uuid(),
        moduleId: mod3,
        title: "Development Environment Setup",
        type: "text",
        contentOrUrl:
          "We use a standardized dev stack:\n\n• IDE: VS Code with our shared settings profile (search 'NovaTech Profile' in extensions)\n• Runtime: Node.js 22 LTS + pnpm\n• Database: MongoDB 7 (local via Docker) or Atlas for staging\n• Version Control: Git with conventional commits\n• Containers: Docker Desktop + docker-compose for local services\n\nClone the onboarding-starter repo from GitHub to verify your setup:\n\ngit clone github.novatech.pt/onboarding-starter\npnpm install\npnpm dev\n\nIf the local server starts at localhost:3000, you're ready!",
        order: 2,
        required: true,
      },
      {
        id: uuid(),
        moduleId: mod3,
        title: "Security & VPN Setup Guide",
        type: "document",
        contentOrUrl: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80",
        order: 3,
        required: true,
      },

      // --- Module 4: Your First Sprint ---
      {
        id: uuid(),
        moduleId: mod4,
        title: "How We Work — Agile at NovaTech",
        type: "text",
        contentOrUrl:
          "We follow a Scrum-based agile process with 2-week sprints:\n\n• Sprint Planning (Monday, week 1) — The team picks stories from the backlog.\n• Daily Standups (every day, 9:30am, 15 min) — Share what you did, what you'll do, and blockers.\n• Sprint Review (Friday, week 2) — Demo what was built to stakeholders.\n• Retrospective (Friday, week 2, after review) — Reflect and improve.\n\nStories are estimated in story points (Fibonacci: 1, 2, 3, 5, 8, 13). As a new joiner, you'll start with small stories (1–3 points) to build confidence.",
        order: 1,
        required: true,
      },
      {
        id: uuid(),
        moduleId: mod4,
        title: "Meet Your Buddy & Team",
        type: "text",
        contentOrUrl:
          "Every new team member is assigned an onboarding buddy — a colleague who will:\n\n• Answer your day-to-day questions\n• Pair program with you on your first tasks\n• Introduce you to the codebase and team rituals\n• Check in weekly for your first month\n\nYour buddy is NOT your manager. They're a peer who recently joined or volunteered to help. Don't hesitate to reach out — that's exactly what they're here for.\n\nYou'll also meet your team during the first standup. Be ready to share a fun fact about yourself!",
        order: 2,
        required: true,
      },
      {
        id: uuid(),
        moduleId: mod4,
        title: "Your First Pull Request",
        type: "text",
        contentOrUrl:
          "Your first real task will be a small, well-scoped pull request. Here's the workflow:\n\n1. Pick a Jira ticket tagged 'good-first-issue' from your sprint board.\n2. Create a branch: git checkout -b feat/JIRA-123-short-description\n3. Write your code following our style guide (ESLint + Prettier auto-format).\n4. Write or update tests — we aim for 80%+ coverage.\n5. Open a PR with a clear description of what and why.\n6. Request review from your buddy + one senior engineer.\n7. Address feedback, get approval, and merge via squash.\n\nCongratulations — you've shipped your first contribution to NovaTech! 🚀",
        order: 3,
        required: true,
      },
    ],

    quizzes: [
      {
        id: quiz1,
        moduleId: mod1,
        title: "Company Culture Check",
        active: true,
        required: true,
      },
      {
        id: quiz2,
        moduleId: mod2,
        title: "Policies & Workplace Quiz",
        active: true,
        required: true,
      },
      {
        id: quiz3,
        moduleId: mod3,
        title: "Tools & Setup Verification",
        active: true,
        required: true,
      },
    ],

    questions: [
      // Quiz 1
      {
        id: uuid(),
        quizId: quiz1,
        text: "When was NovaTech Solutions founded?",
        options: ["2015", "2018", "2020", "2012"],
        correctAnswer: 1,
        explanation: "NovaTech was founded in 2018.",
      },
      {
        id: uuid(),
        quizId: quiz1,
        text: "Which of the following is NOT one of NovaTech's core values?",
        options: ["Ownership", "Transparency", "Speed at all costs", "Team First"],
        correctAnswer: 2,
        explanation: "Speed at all costs is not a NovaTech value. We prioritize quality and collaboration.",
      },
      {
        id: uuid(),
        quizId: quiz1,
        text: "How many professionals work at NovaTech?",
        options: ["About 50", "About 120", "About 500", "About 1000"],
        correctAnswer: 1,
        explanation: "NovaTech has a team of 120+ professionals.",
      },

      // Quiz 2
      {
        id: uuid(),
        quizId: quiz2,
        text: "How many days per week can you work remotely?",
        options: ["1 day", "2 days", "3 days", "5 days"],
        correctAnswer: 2,
        explanation: "NovaTech's hybrid policy allows up to 3 remote days per week.",
      },
      {
        id: uuid(),
        quizId: quiz2,
        text: "What are the mandatory on-site days?",
        options: ["Monday and Friday", "Tuesday and Thursday", "Wednesday only", "No mandatory days"],
        correctAnswer: 1,
        explanation: "Tuesdays and Thursdays are on-site days for team syncs.",
      },
      {
        id: uuid(),
        quizId: quiz2,
        text: "How many annual leave days does NovaTech offer?",
        options: ["20 days", "22 days", "25 days", "30 days"],
        correctAnswer: 2,
        explanation: "NovaTech offers 25 days of annual leave plus public holidays.",
      },

      // Quiz 3
      {
        id: uuid(),
        quizId: quiz3,
        text: "Which chat platform does NovaTech use?",
        options: ["Microsoft Teams", "Slack", "Discord", "Telegram"],
        correctAnswer: 1,
        explanation: "NovaTech uses Slack for internal communication.",
      },
      {
        id: uuid(),
        quizId: quiz3,
        text: "What Node.js version does NovaTech use?",
        options: ["Node.js 16", "Node.js 18", "Node.js 20", "Node.js 22"],
        correctAnswer: 3,
        explanation: "We use Node.js 22 LTS as our standard runtime.",
      },
      {
        id: uuid(),
        quizId: quiz3,
        text: "What is the correct first step to verify your dev setup?",
        options: [
          "Open Jira and create a ticket",
          "Clone onboarding-starter and run pnpm dev",
          "Deploy to production",
          "Install Windows Server",
        ],
        correctAnswer: 1,
        explanation: "Clone the onboarding-starter repo and run it locally to verify your environment.",
      },
    ],

    progress: [],
    attempts: [],
    contentCompletions: [],

    meta: {
      sampleAdmin: { email: "admin@local.test", password: "admin123" },
      sampleUser: { email: "user@local.test", password: "user123" },
      sampleUserId: userId,
    },
  };
}

module.exports = { createSeedData };
