/**
 * Prisma seed – Phase 3.1
 * Seeds reference data that must exist before any interview can be created:
 *   • Technologies  (Angular, React, NestJS, …)
 *   • Skills        (Signals, RxJS, …)  – each attached to a Technology
 *   • Categories    (Frontend, Backend, …)
 *
 * Run:
 *   npx prisma db seed --schema apps/api/prisma/schema.prisma
 */

import { PrismaClient, InterviewType } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

const TECHNOLOGIES = [
  { name: 'Angular',      slug: 'angular',      color: '#DD0031', icon: 'angular',      description: 'Google\'s TypeScript-based web framework' },
  { name: 'React',        slug: 'react',        color: '#61DAFB', icon: 'react',        description: 'Facebook\'s UI library' },
  { name: 'Vue.js',       slug: 'vue',          color: '#4FC08D', icon: 'vue',          description: 'Progressive JavaScript framework' },
  { name: 'Node.js',      slug: 'nodejs',       color: '#339933', icon: 'nodejs',       description: 'JavaScript runtime built on V8' },
  { name: 'NestJS',       slug: 'nestjs',       color: '#E0234E', icon: 'nestjs',       description: 'Progressive Node.js framework' },
  { name: 'Spring Boot',  slug: 'spring-boot',  color: '#6DB33F', icon: 'spring',       description: 'Java-based enterprise framework' },
  { name: 'Python',       slug: 'python',       color: '#3776AB', icon: 'python',       description: 'General-purpose programming language' },
  { name: 'Docker',       slug: 'docker',       color: '#2496ED', icon: 'docker',       description: 'Container platform' },
  { name: 'AWS',          slug: 'aws',          color: '#FF9900', icon: 'aws',          description: 'Amazon Web Services cloud platform' },
  { name: 'Azure',        slug: 'azure',        color: '#0078D4', icon: 'azure',        description: 'Microsoft cloud platform' },
  { name: 'Kubernetes',   slug: 'kubernetes',   color: '#326CE5', icon: 'kubernetes',   description: 'Container orchestration' },
  { name: 'PostgreSQL',   slug: 'postgresql',   color: '#336791', icon: 'postgresql',   description: 'Open-source relational database' },
  { name: 'MongoDB',      slug: 'mongodb',      color: '#47A248', icon: 'mongodb',      description: 'Document-oriented NoSQL database' },
  { name: 'TypeScript',   slug: 'typescript',   color: '#3178C6', icon: 'typescript',   description: 'Typed superset of JavaScript' },
  { name: 'GraphQL',      slug: 'graphql',      color: '#E10098', icon: 'graphql',      description: 'Query language for APIs' },
] as const;

// Skills keyed by their technology slug
const SKILLS_BY_TECH: Record<string, { name: string; description: string }[]> = {
  angular: [
    { name: 'Signals',               description: 'Angular 17+ reactivity primitives' },
    { name: 'RxJS',                  description: 'Reactive Extensions for JavaScript' },
    { name: 'NgRx',                  description: 'Redux-inspired state management for Angular' },
    { name: 'Dependency Injection',  description: 'Angular\'s hierarchical DI system' },
    { name: 'Standalone Components', description: 'Module-free component architecture' },
    { name: 'Angular Material',      description: 'Material Design component library' },
    { name: 'Lazy Loading',          description: 'Route-based code splitting' },
    { name: 'Angular Universal',     description: 'Server-side rendering for Angular' },
    { name: 'Microfrontends',        description: 'Module Federation micro-architecture' },
  ],
  react: [
    { name: 'Hooks',           description: 'useState, useEffect, custom hooks' },
    { name: 'Context API',     description: 'Built-in state sharing mechanism' },
    { name: 'Redux Toolkit',   description: 'Official Redux toolset' },
    { name: 'React Query',     description: 'Server-state management library' },
    { name: 'Server Components', description: 'React Server Components (RSC)' },
    { name: 'Next.js',         description: 'Full-stack React framework' },
  ],
  nestjs: [
    { name: 'Modules',         description: 'NestJS module system' },
    { name: 'Guards',          description: 'Route protection mechanism' },
    { name: 'Interceptors',    description: 'Request/response transformation layer' },
    { name: 'Pipes',           description: 'Data validation and transformation' },
    { name: 'Microservices',   description: 'NestJS microservice patterns' },
    { name: 'WebSockets',      description: 'Real-time communication with Gateways' },
    { name: 'CQRS',            description: 'Command Query Responsibility Segregation' },
  ],
  nodejs: [
    { name: 'Event Loop',      description: 'Node.js concurrency model' },
    { name: 'Streams',         description: 'Node.js streaming API' },
    { name: 'Clustering',      description: 'Multi-process Node.js applications' },
    { name: 'REST APIs',       description: 'RESTful API design and implementation' },
    { name: 'Authentication',  description: 'JWT, OAuth, session management' },
  ],
  typescript: [
    { name: 'Generics',        description: 'Type-safe reusable code patterns' },
    { name: 'Decorators',      description: 'TypeScript decorator pattern' },
    { name: 'Mapped Types',    description: 'Type transformation utilities' },
    { name: 'Conditional Types', description: 'Type-level conditional logic' },
    { name: 'Type Guards',     description: 'Runtime type narrowing' },
  ],
  postgresql: [
    { name: 'Indexing',        description: 'B-tree, GIN, partial indexes' },
    { name: 'Query Optimisation', description: 'EXPLAIN ANALYSE and plan tuning' },
    { name: 'Transactions',    description: 'ACID transaction management' },
    { name: 'Partitioning',    description: 'Table partitioning strategies' },
    { name: 'Full Text Search', description: 'tsvector and tsquery' },
  ],
  docker: [
    { name: 'Containerisation', description: 'Building and running containers' },
    { name: 'Docker Compose',   description: 'Multi-container orchestration' },
    { name: 'Multi-stage Builds', description: 'Optimised production images' },
    { name: 'Networking',       description: 'Container network configuration' },
  ],
  kubernetes: [
    { name: 'Deployments',     description: 'Rolling updates and replica sets' },
    { name: 'Services',        description: 'Service discovery and load balancing' },
    { name: 'Helm Charts',     description: 'Kubernetes package management' },
    { name: 'ConfigMaps',      description: 'Configuration management' },
    { name: 'Autoscaling',     description: 'HPA and VPA configuration' },
  ],
  aws: [
    { name: 'EC2',             description: 'Virtual machine management' },
    { name: 'S3',              description: 'Object storage service' },
    { name: 'Lambda',          description: 'Serverless compute functions' },
    { name: 'RDS',             description: 'Managed relational database service' },
    { name: 'ECS/EKS',         description: 'Container orchestration services' },
  ],
};

const CATEGORIES = [
  { name: 'Frontend',       slug: 'frontend',       description: 'Client-side and UI/UX topics' },
  { name: 'Backend',        slug: 'backend',        description: 'Server-side and API topics' },
  { name: 'Full Stack',     slug: 'full-stack',     description: 'End-to-end application development' },
  { name: 'Cloud',          slug: 'cloud',          description: 'Cloud platforms and services' },
  { name: 'DevOps',         slug: 'devops',         description: 'CI/CD, containers, and infrastructure' },
  { name: 'Behavioral',     slug: 'behavioral',     description: 'Soft skills and situational questions' },
  { name: 'Algorithms',     slug: 'algorithms',     description: 'Data structures and algorithm problems' },
  { name: 'System Design',  slug: 'system-design',  description: 'Large-scale architecture and design patterns' },
];

// ---------------------------------------------------------------------------
// Seed runner
// ---------------------------------------------------------------------------

async function main() {
  console.log('🌱  Starting seed…');

  // ── Technologies ──────────────────────────────────────────────────────────
  console.log('  ↳ Upserting technologies…');
  const techMap: Record<string, string> = {};

  for (const tech of TECHNOLOGIES) {
    const record = await prisma.technology.upsert({
      where:  { slug: tech.slug },
      update: { name: tech.name, color: tech.color, icon: tech.icon, description: tech.description },
      create: { ...tech },
    });
    techMap[tech.slug] = record.id;
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  console.log('  ↳ Upserting skills…');

  for (const [slug, skills] of Object.entries(SKILLS_BY_TECH)) {
    const technologyId = techMap[slug];
    if (!technologyId) continue;

    for (const skill of skills) {
      await prisma.skill.upsert({
        where:  { technologyId_name: { technologyId, name: skill.name } },
        update: { description: skill.description },
        create: { technologyId, ...skill },
      });
    }
  }

  // ── Categories ────────────────────────────────────────────────────────────
  console.log('  ↳ Upserting categories…');

  for (const cat of CATEGORIES) {
    await prisma.interviewCategory.upsert({
      where:  { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: { ...cat },
    });
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const [techCount, skillCount, catCount] = await Promise.all([
    prisma.technology.count(),
    prisma.skill.count(),
    prisma.interviewCategory.count(),
  ]);

  console.log(`\n✅  Seed complete:`);
  console.log(`    Technologies : ${techCount}`);
  console.log(`    Skills       : ${skillCount}`);
  console.log(`    Categories   : ${catCount}`);
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
