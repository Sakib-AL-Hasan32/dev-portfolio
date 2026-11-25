/**
 * Training and achievements.
 * Add `certificateUrl` / `link` to any item when you have something to verify it with —
 * a "View certificate" button appears automatically.
 */

/**
 * Courses shown in "Experience & learning".
 * `certificateUrl`: paste your Ostad certificate link — until then the
 * "View credential" button is shown as "coming soon" (disabled).
 */
export const training = [
  {
    program: 'Backend Web Development with Java & Spring Boot',
    provider: 'Ostad',
    type: 'Professional training',
    icon: 'server',
    points: [
      'Completed an 8-month backend development program.',
      'Worked on 28 backend projects, assignments and quizzes.',
      'Took part in live classes, problem-solving sessions, discussions and code reviews.',
    ],
    stats: [
      { value: 97.3, decimals: 1, suffix: '%', label: 'Final score' },
      { value: 5, prefix: '#', label: 'Rank among 53 students' },
      { value: 28, label: 'Projects, assignments & quizzes' },
      { value: 8, label: 'Month program' },
    ],
    certificateUrl: '', // TODO: paste the Ostad certificate link
  },
  {
    program: 'AI Automation & AI Agents',
    provider: 'Ostad',
    type: 'Professional training',
    icon: 'bot',
    // TODO: the numbers below are PLACEHOLDERS — replace them with your real results.
    points: [
      'Completed a 4-month AI automation program.',
      'Built 18 automation workflows, assignments and quizzes.',
      'Took part in live classes, hands-on sessions and project reviews.',
    ],
    stats: [
      { value: 95.6, decimals: 1, suffix: '%', label: 'Final score' },
      { value: 4, prefix: '#', label: 'Rank among 60 students' },
      { value: 18, label: 'Projects, assignments & quizzes' },
      { value: 4, label: 'Month program' },
    ],
    certificateUrl: '', // TODO: paste the Ostad certificate link
  },
  {
    program: 'AI Native DevOps',
    provider: 'Ostad',
    type: 'Professional training',
    icon: 'repeat',
    // TODO: the numbers below are PLACEHOLDERS — replace them with your real results.
    points: [
      'Completed a 4-month DevOps program.',
      'Worked on 16 DevOps projects, assignments and quizzes.',
      'Took part in live classes, lab sessions and code reviews.',
    ],
    stats: [
      { value: 94.2, decimals: 1, suffix: '%', label: 'Final score' },
      { value: 7, prefix: '#', label: 'Rank among 48 students' },
      { value: 16, label: 'Projects, assignments & quizzes' },
      { value: 4, label: 'Month program' },
    ],
    certificateUrl: '', // TODO: paste the Ostad certificate link
  },
];

export const achievements = [
  {
    badge: 'Hackathon',
    icon: 'cpu',
    title: 'AI Dev Fest 2026',
    summary: 'Participated in the AI Hackathon with team NeuroVerse.',
    items: ['AI Hackathon — Team NeuroVerse', 'Vibe Coding', 'Datathon', 'Prompt Battle'],
    // certificateUrl: '',
  },
  {
    badge: 'Finalist',
    icon: 'award',
    title: 'AI Builders Congress 2026',
    summary: 'Selected for the Final Round.',
    items: ['Team: JoinByError', 'Domain: InfraSphere AI'],
    // certificateUrl: '',
  },
  {
    badge: 'Contests',
    icon: 'code',
    title: 'Programming Competitions',
    summary: 'Competitive programming contest results.',
    items: [
      'Unlock the Algorithm — 17th Place',
      'CodeTrap Programming Contest — 62nd Place',
      'Take-Off Programming Contest Spring 2024 — 15th Place',
    ],
    // certificateUrl: '',
  },
  {
    badge: 'Champion',
    icon: 'trophy',
    title: 'Academic Project Achievement',
    summary: 'Champion — Data Structure & Algorithm Project Competition.',
    items: ['Role: Project Lead Developer'],
    highlight: true,
    // certificateUrl: '',
  },
];
