/**
 * Training and achievements.
 * Add `certificateUrl` / `link` to any item when you have something to verify it with —
 * a "View certificate" button appears automatically.
 */

export const training = [
  {
    provider: 'Ostad',
    program: 'Backend Web Development with Java & Spring Boot',
    type: 'Professional training',
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
    // certificateUrl: '',  // TODO
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
