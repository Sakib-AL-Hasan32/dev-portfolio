/**
 * Technology stack, grouped by category.
 * `devicon` → logo from the Devicon set (https://devicon.dev), `icon` → built-in line icon.
 * If a logo fails to load, the line icon is shown instead.
 * The first group is the tab that is open by default; `short` is the tab label.
 * @type {import('./types.js').SkillGroup[]}
 */
export const skillGroups = [
  {
    title: 'Backend Development',
    short: 'Backend',
    blurb: 'APIs, security and persistence with the Spring ecosystem.',
    icon: 'server',
    items: [
      { name: 'Spring Boot', devicon: 'spring/spring-original' },
      { name: 'Spring Security', icon: 'shield' },
      { name: 'Spring Data JPA', devicon: 'spring/spring-original' },
      { name: 'Hibernate', devicon: 'hibernate/hibernate-original', mono: true },
      { name: 'REST API Development', icon: 'route' },
      { name: 'JWT Authentication', icon: 'key' },
      { name: 'OAuth 2.0', icon: 'lock' },
      { name: 'Role-Based Access Control', icon: 'users' },
      { name: 'Thymeleaf', icon: 'layout' },
    ],
  },
  {
    title: 'Programming Languages',
    short: 'Languages',
    blurb: 'The languages I write every day.',
    icon: 'code',
    items: [
      { name: 'Java', devicon: 'java/java-original' },
      { name: 'JavaScript', devicon: 'javascript/javascript-original' },
      { name: 'SQL', icon: 'database' },
    ],
  },
  {
    title: 'Databases & Caching',
    short: 'Databases',
    blurb: 'Relational storage and fast in-memory caching.',
    icon: 'database',
    items: [
      { name: 'MySQL', devicon: 'mysql/mysql-original' },
      { name: 'PostgreSQL', devicon: 'postgresql/postgresql-original' },
      { name: 'Redis', devicon: 'redis/redis-original' },
    ],
  },
  {
    title: 'Messaging & Integration',
    short: 'Messaging',
    blurb: 'Connecting services, payments and notifications.',
    icon: 'plug',
    items: [
      { name: 'RabbitMQ', devicon: 'rabbitmq/rabbitmq-original' },
      { name: 'Stripe Integration', icon: 'card' },
      { name: 'Email Integration', icon: 'mail' },
    ],
  },
  {
    title: 'DevOps & Development Tools',
    short: 'DevOps & Tools',
    blurb: 'Shipping, versioning and documenting software.',
    icon: 'box',
    items: [
      { name: 'Docker', devicon: 'docker/docker-original' },
      { name: 'Docker Compose', devicon: 'docker/docker-original' },
      { name: 'Git', devicon: 'git/git-original' },
      { name: 'GitHub', devicon: 'github/github-original', mono: true },
      { name: 'GitHub Actions', devicon: 'githubactions/githubactions-original' },
      { name: 'Flyway', icon: 'layers' },
      { name: 'Postman', devicon: 'postman/postman-original' },
      { name: 'Swagger / OpenAPI', devicon: 'swagger/swagger-original' },
      { name: 'IntelliJ IDEA', devicon: 'intellij/intellij-original' },
    ],
  },
  {
    title: 'Testing & Monitoring',
    short: 'Testing',
    blurb: 'Confidence before release, visibility after.',
    icon: 'activity',
    items: [
      { name: 'JUnit 5', devicon: 'junit/junit-original' },
      { name: 'Integration Testing', icon: 'flask' },
      { name: 'Grafana', devicon: 'grafana/grafana-original' },
      { name: 'Loki', icon: 'logs' },
    ],
  },
  {
    title: 'Architecture & Concepts',
    short: 'Architecture',
    blurb: 'How I think about structuring systems.',
    icon: 'network',
    items: [
      { name: 'Monolithic Architecture', icon: 'square' },
      { name: 'Microservices Architecture', icon: 'grid' },
      { name: 'Event-Driven Architecture', icon: 'zap' },
      { name: 'API Gateway', icon: 'gateway' },
      { name: 'Service Discovery', icon: 'compass' },
      { name: 'Saga Pattern', icon: 'repeat' },
      { name: 'Clean Architecture', icon: 'layers' },
      { name: 'Distributed Systems', icon: 'network' },
    ],
  },
  {
    title: 'AI & Automation',
    short: 'AI & Automation',
    blurb: 'Intelligent workflows that remove manual work.',
    icon: 'sparkles',
    items: [
      { name: 'AI Automation', icon: 'bot' },
      { name: 'Agentic AI', icon: 'brain' },
      { name: 'n8n', icon: 'workflow' },
      { name: 'AI-powered workflows', icon: 'sparkles' },
      { name: 'Spring AI', devicon: 'spring/spring-original' },
    ],
  },
];
