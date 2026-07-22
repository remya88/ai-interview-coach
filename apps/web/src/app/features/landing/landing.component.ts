import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100">
      <header class="border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">AI Interview Coach</p>
            <h1 class="text-xl font-semibold">Your interview readiness workspace</h1>
          </div>
          <div class="flex gap-3">
            <a
              routerLink="/auth/login"
              class="inline-flex items-center justify-center rounded-full border border-white/25 bg-slate-900/60 px-5 py-2 text-sm font-semibold text-slate-100 shadow-lg shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:bg-cyan-500/15"
            >
              Sign in
            </a>
            <a
              routerLink="/auth/register"
              class="inline-flex items-center justify-center rounded-full border border-cyan-300/40 bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition duration-200 hover:-translate-y-0.5 hover:from-cyan-300 hover:to-emerald-300"
            >
              Create account
            </a>
          </div>
        </div>
      </header>

      <main class="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        <!-- Status banner -->
        <section class="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4">
          <span class="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span>
          <p class="text-sm font-medium text-emerald-300">Application is running successfully.</p>
        </section>

        <section class="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <p class="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Foundation ready</p>
          <h2 class="text-3xl font-semibold">AI Interview Coach</h2>
          <p class="mt-4 max-w-3xl text-base text-slate-300">
            Practice technical and behavioural interviews with AI-powered feedback. Get personalised coaching,
            evaluate your responses, and track your progress towards landing your next role.
          </p>
          <div class="mt-6 flex gap-3">
            <a
              routerLink="/auth/register"
              class="inline-flex min-h-12 items-center justify-center rounded-xl border border-cyan-300/45 bg-gradient-to-r from-cyan-400 to-emerald-400 px-7 py-3 text-sm font-bold tracking-wide text-slate-950 shadow-xl shadow-cyan-500/25 transition duration-200 hover:-translate-y-0.5 hover:from-cyan-300 hover:to-emerald-300"
            >
              Create account
            </a>
            <a
              routerLink="/auth/login"
              class="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 bg-slate-900/55 px-7 py-3 text-sm font-bold tracking-wide text-slate-100 shadow-lg shadow-black/25 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:bg-cyan-500/12"
            >
              Sign in
            </a>
          </div>
        </section>

        <section class="grid gap-6 md:grid-cols-3">
          <article class="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <h3 class="text-lg font-semibold">Frontend</h3>
            <p class="mt-2 text-sm text-slate-400">Angular 20, Tailwind CSS, and Angular Material — serving at
              <code class="text-cyan-400">localhost:4200</code>.</p>
          </article>
          <article class="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <h3 class="text-lg font-semibold">Backend</h3>
            <p class="mt-2 text-sm text-slate-400">NestJS with auth, Prisma, and Swagger — serving at
              <code class="text-cyan-400">localhost:3000/api</code>.</p>
          </article>
          <article class="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <h3 class="text-lg font-semibold">Database</h3>
            <p class="mt-2 text-sm text-slate-400">PostgreSQL via Docker Compose with Prisma migrations.</p>
          </article>
        </section>
      </main>
    </div>
  `,
})
export class LandingComponent {}
