# UI/UX Design

## Design System

| Token | Value |
|-------|-------|
| Primary | `#3b82f6` (blue-500) |
| Success | `#10b981` (emerald-500) |
| Warning | `#f59e0b` (amber-500) |
| Danger | `#ef4444` (red-500) |
| Surface | `#f9fafb` (gray-50) |
| Border | `#e5e7eb` (gray-200) |

Components use **Angular Material 20** with **Tailwind CSS 3.4** utilities.

---

## Analytics Dashboard (`/analytics`)

### User Flow

```
Login → Dashboard → Analytics
  └── Click "Analytics" in nav
       └── /analytics loads AnalyticsDashboardComponent
            ├── Fetch all 6 API endpoints in parallel
            ├── Render summary cards (top row)
            ├── Render performance line chart
            ├── Render skill + technology panels (side by side)
            └── Render recent interview history table
```

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  Analytics Dashboard        [subtitle]              │
├──────────┬──────────┬──────────┬───────────────────┤
│  Total   │ Avg Score│ Practice │  Current Streak   │
│ Interviews│  / 100  │  Hours   │   (days 🔥)       │
├──────────┴──────────┴──────────┴───────────────────┤
│  Progress Summary (trend badge + next level bar)    │
├─────────────────────────────────────────────────────┤
│  Performance Trend (SVG line chart — 30 days)       │
├────────────────────────┬────────────────────────────┤
│  Skill Assessment      │  Technology Performance    │
│  (horizontal bar chart)│  (stat cards per tech)     │
├────────────────────────┴────────────────────────────┤
│  Recent Interview History (paginated mat-table)     │
└─────────────────────────────────────────────────────┘
```

### Components

#### `SummaryCardComponent`
- Displays one metric with icon, value, unit, and optional trend arrow
- Icon colors use the design system tokens above
- Positive change → green arrow; negative → red arrow

#### `PerformanceChartComponent`
- Pure SVG line chart (no external chart library)
- X-axis: dates; Y-axis: score 0–100
- Circles at each data point, hover expands to r=6
- Empty state: centered grey text

#### `SkillChartComponent`
- Horizontal progress bars for 5 skills
- Bar color auto-assigned by score threshold (≥85 green, ≥75 blue, ≥65 amber, <65 red)
- Animated fill on render

#### `TechnologyPerformanceComponent`
- One card per technology
- Shows: interview count badge, average score, best score, improvement trend %
- Trend color: green (positive), red (negative), grey (zero)

#### `ProgressSummaryComponent`
- Trend badge: "Improving" | "Stable" | "Declining" with matching background
- Progress bar from current score → next level threshold
- Estimated days label

#### `InterviewHistoryComponent`
- `mat-table` with columns: Technology, Score, Date, Difficulty
- Score rendered as colored badge matching design tokens
- `MatPaginator` for page navigation

### Accessibility

- All `mat-icon` elements include `aria-hidden="true"`
- Interactive elements have visible focus rings (Tailwind `focus:ring-2`)
- Color contrast meets WCAG AA (4.5:1 minimum for text)
- Responsive: single-column on mobile (<768px), two-column on tablet, full grid on desktop

### Responsive Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| < 768px | 1-column, stacked sections |
| 768–1024px | 2-column cards, stacked charts |
| > 1024px | Full 4-column grid, side-by-side charts |

### State Feedback

| State | UI |
|-------|----|
| Loading | Centered `<mat-spinner>` with label |
| Error | Red alert box with "Retry" button |
| Empty data | Informational placeholder text per component |
