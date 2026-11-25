/**
 * Type definitions (JSDoc) for the data files. Editors like VS Code use these for
 * autocomplete and type-checking in plain JavaScript — no TypeScript build needed.
 *
 * @typedef {'completed'|'in-progress'|'maintained'|'archived'|'planned'} ProjectStatus
 *
 * @typedef {Object} ProjectImage
 * @property {string} src       Path from src/ (e.g. 'assets/images/projects/x/1.webp') or full URL
 * @property {string} [alt]
 * @property {string} [caption]
 *
 * @typedef {Object} ProjectFeature
 * @property {string} title
 * @property {string} [description]
 *
 * @typedef {Object} Project
 * @property {number|string} id
 * @property {string} slug                     Unique, URL-safe
 * @property {string} title
 * @property {string} shortDescription
 * @property {string} category
 * @property {string[]} technologies
 * @property {string|string[]} [fullDescription]
 * @property {string} [problem]
 * @property {string} [motivation]
 * @property {string} [thumbnail]
 * @property {(ProjectImage|string)[]} [gallery]
 * @property {(ProjectImage|string)[]} [screenshots]
 * @property {(ProjectFeature|string)[]} [features]
 * @property {string} [architecture]
 * @property {string} [role]
 * @property {string[]} [concepts]
 * @property {string[]} [challenges]
 * @property {string[]} [solutions]
 * @property {string} [githubUrl]
 * @property {string} [liveUrl]
 * @property {string} [demoUrl]
 * @property {string} [docsUrl]
 * @property {ProjectStatus} [status]
 * @property {boolean} [featured]
 * @property {string} [date]
 *
 * @typedef {Object} Skill
 * @property {string} name
 * @property {string} [devicon]   Devicon path, e.g. 'java/java-original'
 * @property {string} [simpleicon] Simple Icons slug, e.g. 'springsecurity' (used when no devicon)
 * @property {string} [icon]      Inline icon name from templates/icons.js (fallback)
 * @property {boolean} [mono]     Logo is single-colour black → inverted in dark mode
 *
 * @typedef {Object} SkillGroup
 * @property {string} title
 * @property {string} blurb
 * @property {string} icon
 * @property {Skill[]} items
 */
export {};
