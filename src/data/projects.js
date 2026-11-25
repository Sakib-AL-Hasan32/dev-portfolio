/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PROJECTS — the single source of truth.
 *
 *  To add a project, copy one object below, change the values and push.
 *  The build automatically:
 *    • adds a card to /projects/ (count, search, filters update themselves)
 *    • generates its detail page at /projects/<slug>/
 *    • links it into Previous / Next navigation and sitemap.xml
 *    • shows it on the home page when `featured: true`
 *
 *  Required:  id, slug, title, shortDescription, category, technologies
 *  Optional:  everything else — anything left out is simply hidden in the UI.
 *
 *  Field reference
 *    slug              URL part, lowercase-with-dashes, must be unique
 *    category          free text; filter chips are generated from what you use
 *    status            'completed' | 'in-progress' | 'maintained' | 'archived' | 'planned'
 *    featured          true → shown in "Selected work" on the home page
 *    date              'YYYY-MM' or 'YYYY-MM-DD'
 *    thumbnail         path from src/, e.g. 'assets/images/projects/bookcycle/cover.webp'
 *                      (no thumbnail → a generated cover is drawn for you)
 *    gallery / screenshots   arrays of { src, alt, caption? } or plain path strings
 *    fullDescription   string or array of paragraphs
 *    problem / motivation    short paragraphs for the overview
 *    features          string[]  or  { title, description }[]
 *    architecture      string
 *    concepts          string[] — important backend concepts used
 *    challenges / solutions  string[]
 *    githubUrl, liveUrl, demoUrl, docsUrl   only shown when set
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** @type {import('./types.js').Project[]} */
export const projects = [
  {
    id: 1,
    slug: 'bookcycle',
    title: 'BookCycle',
    shortDescription: 'A university-based platform for buying and selling old books.',
    fullDescription: [
      'BookCycle is a university-based marketplace where students can buy and sell old books. It brings book listings, purchasing and administration together in one web application.',
      'It is built as a modular monolith with Spring Boot, server-side rendered with Thymeleaf and styled with Bootstrap, backed by a MySQL database.',
    ],
    problem: 'Students regularly need books that other students no longer use. BookCycle gives them one place inside the university community to list, find and buy those books.',
    category: 'Web Application',
    technologies: ['Spring Boot', 'MySQL', 'Thymeleaf', 'Bootstrap'],
    features: [
      { title: 'User authentication', description: 'Accounts and sign-in for buyers and sellers.' },
      { title: 'Buy & sell books', description: 'List old books for sale and purchase books from other students.' },
      { title: 'Book management', description: 'Create, update and manage book listings.' },
      { title: 'Cart', description: 'Collect books in a cart before checking out.' },
      { title: 'Admin panel', description: 'Administrative tools for managing the platform.' },
    ],
    architecture: 'Modular Monolithic Application',
    role: 'Lead Developer',
    featured: true,
    // status: 'completed',       // TODO: set the real status
    // date: '2025-01',           // TODO: add date
    // githubUrl: '',             // TODO: add repository link
    // liveUrl: '',
  },
  {
    id: 2,
    slug: 'ecommerce-backend',
    title: 'E-commerce Backend',
    shortDescription: 'A backend-focused e-commerce application with authentication, payments, caching and messaging.',
    fullDescription: [
      'A backend-focused e-commerce application built with Java and Spring Boot. It covers the core concerns of an online store’s server side: securing users, taking payments, keeping responses fast and processing work asynchronously.',
      'Authentication is handled with Spring Security and JWT with role-based access control. Payments go through Stripe, Redis provides caching, RabbitMQ handles messaging, Flyway manages database migrations on MySQL, and the API is documented with Swagger / OpenAPI.',
    ],
    category: 'Backend API',
    technologies: ['Java', 'Spring Boot', 'Spring Security', 'JWT', 'MySQL', 'Redis', 'RabbitMQ', 'Flyway', 'Stripe', 'Swagger / OpenAPI'],
    features: [
      { title: 'Authentication', description: 'Stateless authentication with Spring Security and JWT.' },
      { title: 'Role-based access control', description: 'Endpoints protected by user roles.' },
      { title: 'Payment integration', description: 'Payments processed through Stripe.' },
      { title: 'Caching', description: 'Redis caching for frequently accessed data.' },
      { title: 'Messaging', description: 'Asynchronous messaging with RabbitMQ.' },
      { title: 'Email integration', description: 'Transactional emails sent from the backend.' },
      { title: 'API documentation', description: 'Interactive API docs with Swagger / OpenAPI.' },
    ],
    concepts: ['JWT authentication', 'Role-Based Access Control', 'Caching', 'Message queues', 'Database migrations', 'Payment integration', 'API documentation'],
    featured: true,
    // status: '',      // TODO
    // githubUrl: '',   // TODO
  },
  {
    id: 3,
    slug: 'secure-file-sharing-service',
    title: 'Secure File Sharing Service',
    shortDescription: 'A backend service for sharing files securely with OTP-verified, expiring download links.',
    fullDescription:
      'A Spring Boot backend service for sharing files securely. Uploaded files are shared through temporary download links that require OTP verification, links expire automatically, and expired files are removed by a scheduled cleanup job.',
    category: 'Backend API',
    technologies: ['Java', 'Spring Boot', 'MySQL'],
    features: [
      { title: 'File uploads', description: 'Upload files to be shared.' },
      { title: 'OTP-based download verification', description: 'Downloads require a one-time password.' },
      { title: 'Temporary download links', description: 'Shareable links that only work for a limited time.' },
      { title: 'Expiration handling', description: 'Links and files expire automatically.' },
      { title: 'Scheduled file deletion', description: 'A scheduled job deletes expired files.' },
    ],
    concepts: ['OTP verification', 'Expiring links', 'Scheduled jobs', 'File storage'],
    featured: true,
    // status: '',      // TODO
    // githubUrl: '',   // TODO
  },
  {
    id: 4,
    slug: 'github-repository-reader',
    title: 'GitHub Repository Reader',
    shortDescription: 'A backend application that reads and processes GitHub repository content.',
    fullDescription:
      'A Spring Boot backend that reads and processes content from GitHub repositories — contributions, repository indices and blog topics. The data is stored persistently, and periodic updates keep it in sync with changes in the repositories.',
    category: 'Backend API',
    technologies: ['Java', 'Spring Boot', 'REST API', 'Database'],
    features: [
      { title: 'Reads contributions', description: 'Collects contribution data from repositories.' },
      { title: 'Repository indices', description: 'Reads and processes repository index content.' },
      { title: 'Blog topics', description: 'Extracts blog topics from repository content.' },
      { title: 'Persistent storage', description: 'Processed data is stored in a database.' },
      { title: 'Periodic updates', description: 'Repository changes are picked up through scheduled refreshes.' },
    ],
    concepts: ['REST API integration', 'Scheduled synchronisation', 'Data persistence'],
    // status: '',      // TODO
    // githubUrl: '',   // TODO
  },
  {
    id: 5,
    slug: 'inventory-management-api',
    title: 'Inventory Management API',
    shortDescription: 'A backend API for managing products and stock operations.',
    fullDescription:
      'A Spring Boot REST API for managing products and stock. It supports product management, stock-in and stock-out operations, and keeps a history of every stock movement.',
    category: 'Backend API',
    technologies: ['Java', 'Spring Boot', 'Relational Database'],
    features: [
      { title: 'Product management', description: 'Create, update and manage products.' },
      { title: 'Stock-in', description: 'Record incoming stock.' },
      { title: 'Stock-out', description: 'Record outgoing stock.' },
      { title: 'Stock history', description: 'A history of all stock movements.' },
    ],
    // status: '',      // TODO
    // githubUrl: '',   // TODO
  },
  {
    id: 6,
    slug: 'cv-evaluator-api',
    title: 'CV Evaluator API',
    shortDescription: 'An AI-powered application that evaluates CVs and generates scores.',
    fullDescription:
      'An AI-powered CV evaluation application. It accepts CVs as images, uses AI models to analyse their content, and generates a score for each CV.',
    category: 'AI',
    technologies: ['AI Models'], // TODO: add the exact stack (language, framework, model provider)
    features: [
      { title: 'CV image input', description: 'Upload a CV as an image.' },
      { title: 'AI-based evaluation', description: 'AI models analyse the CV content.' },
      { title: 'Scoring', description: 'Each CV receives a generated score.' },
    ],
    // status: '',      // TODO
    // githubUrl: '',   // TODO
  },
  {
    id: 7,
    slug: 'weather-api',
    title: 'Weather API',
    shortDescription: 'A city-based weather application with database-backed caching.',
    fullDescription:
      'A Spring Boot weather application built on WeatherAPI. It returns weather information by city and caches results in a MySQL database.',
    category: 'Backend API',
    technologies: ['Java', 'Spring Boot', 'MySQL', 'WeatherAPI'],
    features: [
      { title: 'City-based weather', description: 'Look up weather information by city.' },
      { title: 'Database-backed caching', description: 'Responses are cached in the database.' },
    ],
    concepts: ['Third-party API integration', 'Caching'],
    // status: '',      // TODO
    // githubUrl: '',   // TODO
  },
  {
    id: 8,
    slug: 'linkedin-job-alert-automation',
    title: 'LinkedIn Job Alert Automation',
    shortDescription: 'An automated workflow that collects LinkedIn jobs and summarises hiring trends with AI.',
    fullDescription:
      'An n8n automation that collects LinkedIn job information. Given a job title and location, it scrapes job listings with Apify, stores them in Google Sheets and uses AI to generate summaries of hiring trends.',
    category: 'Automation',
    technologies: ['n8n', 'Apify', 'Google Sheets', 'AI'],
    features: [
      { title: 'Title & location inputs', description: 'Choose the job title and location to track.' },
      { title: 'Automated job scraping', description: 'Job listings are collected automatically with Apify.' },
      { title: 'Spreadsheet storage', description: 'Results are written to Google Sheets.' },
      { title: 'AI trend summaries', description: 'AI generates summaries of hiring trends.' },
    ],
    concepts: ['Workflow automation', 'Web scraping', 'AI summarisation'],
    featured: true,
    // status: '',      // TODO
  },
];
