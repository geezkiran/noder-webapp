export type FeedPost = {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  image?: string;
  timestamp: string;
  timeAgo: string;
  stats: {
    replies: number;
    reposts: number;
    likes: number;
    views: number;
  };
  tags?: string[];
  replies?: FeedReply[];
};

export type FeedReply = {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  content: string;
  timeAgo: string;
  stats: {
    replies: number;
    likes: number;
  };
};

const AVATAR_AKHILA =
  "https://www.untitledui.com/images/avatars/transparent/sienna-hewitt?bg=%23E0E0E0";
const AVATAR_SURAJ =
  "https://img.magnific.com/free-photo/latin-man-smiling-mockup-psd-cheerful-expression-closeup-portrai_53876-145665.jpg?semt=ais_hybrid&w=740&q=80";
const AVATAR_BALU =
  "https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cG9ydHJhaXR8ZW58MHx8MHx8fDA%3D";
const AVATAR_ANAMIKA =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd9UYSaiGLoXUMfRtdtvtnDsOCev-LJmdzYAwHvdquAA&s=10";
const AVATAR_AKV =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBvyOzGORjorTUek4kH99GaR3tWtcLdQlnIYcbfFft6yv77W2QunKg7GLY&s=10";
export const AVATAR_CAITLYN =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd9UYSaiGLoXUMfRtdtvtnDsOCev-LJmdzYAwHvdquAA&s=10";
const AVATAR_NODER_TEAM = AVATAR_BALU;
const AVATAR_ALPHA_TEAM = AVATAR_SURAJ;

export const feedPosts: FeedPost[] = [
  {
    id: "1",
    author: {
      name: "Akhila",
      handle: "akhila",
      avatar: AVATAR_AKHILA,
      verified: true,
    },
    content:
      "Just shipped the new API routing fix 🚀 turns out the issue was in the middleware chain — a missing `await` was causing race conditions under load. Classic async bug. Always profile before assuming it's infra.",
    timestamp: "2026-07-05T12:54:00Z",
    timeAgo: "2h",
    stats: { replies: 14, reposts: 31, likes: 187, views: 4200 },
    tags: ["engineering", "nodejs", "debugging"],
    replies: [
      {
        id: "r1",
        author: { name: "Suraj B M", handle: "surajbm", avatar: AVATAR_SURAJ },
        content: "noice! Was this on staging or hit prod?",
        timeAgo: "1h",
        stats: { replies: 1, likes: 8 },
      },
      {
        id: "r2",
        author: { name: "Balu", handle: "balu", avatar: AVATAR_BALU },
        content: "async/await bugs are the worst to track down without proper tooling. What did you use to profile?",
        timeAgo: "45m",
        stats: { replies: 1, likes: 5 },
      },
      {
        id: "r3",
        author: { name: "Akhila Reddy", handle: "akhila_dev", avatar: AVATAR_AKHILA },
        content: "Clinic.js + custom tracing. Caught it within 20 mins once we had the right instrumentation in place.",
        timeAgo: "30m",
        stats: { replies: 0, likes: 12 },
      },
    ],
  },
  {
    id: "2",
    author: {
      name: "AKV",
      handle: "akv_labs",
      avatar: AVATAR_AKV,
    },
    content:
      "done. shipped the dashboard redesign. 3 weeks of iteration, a lot of component refactoring, and finally something that feels right. the hardest part wasn't code — it was aligning on what 'done' means.",
    timestamp: "2026-07-05T18:18:00Z",
    timeAgo: "18m",
    stats: { replies: 6, reposts: 18, likes: 94, views: 1800 },
    tags: ["design", "product"],
    replies: [
      {
        id: "r4",
        author: { name: "Caitlyn King", handle: "caitlyn_k", avatar: AVATAR_CAITLYN },
        content: "The new layout looks 🔥 — especially the 3-column split. Very clean.",
        timeAgo: "15m",
        stats: { replies: 1, likes: 7 },
      },
    ],
  },
  {
    id: "3",
    author: {
      name: "Noder Team",
      handle: "noder_hq",
      avatar: AVATAR_NODER_TEAM,
      verified: true,
    },
    content:
      "📣 Noder Enterprise v2.1 is out. Major improvements to the canvas workspace, a revamped feed UI, and significant performance gains in the project graph renderer. Full changelog in the link below.",
    timestamp: "2026-07-05T08:00:00Z",
    timeAgo: "11h",
    stats: { replies: 42, reposts: 156, likes: 891, views: 23400 },
    tags: ["release", "noder", "enterprise"],
    replies: [
      {
        id: "r5",
        author: { name: "Alpha Team", handle: "alpha_team", avatar: AVATAR_ALPHA_TEAM },
        content: "The graph renderer speed-up is insane. What we were doing in 800ms now runs in under 100ms.",
        timeAgo: "9h",
        stats: { replies: 2, likes: 34 },
      },
      {
        id: "r6",
        author: { name: "Anamika", handle: "anamika_pm", avatar: AVATAR_ANAMIKA },
        content: "The canvas workspace changes are a game changer for async collaboration. Looking forward to the walkthrough session.",
        timeAgo: "8h",
        stats: { replies: 1, likes: 21 },
      },
    ],
  },
  {
    id: "4",
    author: {
      name: "Anamika",
      handle: "anamika_pm",
      avatar: AVATAR_ANAMIKA,
    },
    content:
      "You might have received an email about the new onboarding flow — this was intentional. We're A/B testing a shorter path for enterprise users. If you have feedback, drop it here or DM me. Every data point helps.",
    timestamp: "2026-07-05T19:08:00Z",
    timeAgo: "6m",
    stats: { replies: 9, reposts: 4, likes: 37, views: 620 },
    tags: ["product", "onboarding"],
    replies: [
      {
        id: "r7",
        author: { name: "Balu", handle: "balu_k", avatar: AVATAR_BALU },
        content: "Got it. The new flow is definitely cleaner — cut the setup time roughly in half for our team.",
        timeAgo: "4m",
        stats: { replies: 0, likes: 3 },
      },
    ],
  },
  {
    id: "5",
    author: {
      name: "Suraj B M",
      handle: "surajbm",
      avatar: AVATAR_SURAJ,
    },
    content:
      "hot take: the best engineering teams I've worked on had almost no process. just high trust, good taste, and a shared sense of what matters. process is a substitute for those things — not a complement.",
    timestamp: "2026-07-05T07:46:00Z",
    timeAgo: "12h",
    stats: { replies: 88, reposts: 210, likes: 1340, views: 41200 },
    tags: ["engineering", "culture"],
    replies: [
      {
        id: "r8",
        author: { name: "AKV", handle: "akv_labs", avatar: AVATAR_AKV },
        content: "Agree up to a point — but 'good taste' doesn't scale past ~15 engineers without at least some lightweight structure.",
        timeAgo: "11h",
        stats: { replies: 3, likes: 67 },
      },
      {
        id: "r9",
        author: { name: "Akhila Reddy", handle: "akhila_dev", avatar: AVATAR_AKHILA },
        content: "The problem is every company thinks they have 'high trust' but few actually measure whether decisions are really delegated.",
        timeAgo: "10h",
        stats: { replies: 2, likes: 44 },
      },
    ],
  },
  {
    id: "6",
    author: {
      name: "Balu",
      handle: "balu_k",
      avatar: AVATAR_BALU,
    },
    content:
      "Ok. Finally got the MongoDB aggregation pipeline working with the new schema. Took longer than expected but the query is now 4x faster. Sometimes the boring fix is the right one.",
    timestamp: "2026-07-04T22:00:00Z",
    timeAgo: "Yesterday",
    stats: { replies: 3, reposts: 7, likes: 52, views: 940 },
    tags: ["mongodb", "engineering"],
    replies: [],
  },
];
