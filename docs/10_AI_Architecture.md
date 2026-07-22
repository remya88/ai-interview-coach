# AI Architecture

## Overview

The AI Interview Coach uses OpenAI GPT-4o-mini for three AI pipelines:

1. **Interview Question Generation** — generates role-appropriate technical questions
2. **Answer Evaluation** — evaluates candidate answers per skill dimension
3. **Resume Analysis & Job Matching** *(Phase 4)* — analyzes resumes and matches them to job descriptions

All AI communication is centralized through `OpenAIService` (`apps/api/src/modules/ai/`).

---

## Shared AI Layer (`modules/ai`)

```
ai/
├── services/
│   └── openai.service.ts   # Centralized OpenAI client, retry logic
├── constants/
│   └── ai.constants.ts     # Model name, max tokens, temperature, retry config
└── interfaces/
    └── ai-response.interface.ts
```

**`OpenAIService.sendMessage(messages, systemPrompt)`**
- Accepts messages array + system prompt
- Calls `gpt-4o-mini` with `response_format: { type: "json_object" }`
- Auto-retries up to 3 times with exponential backoff
- Throws `HttpException` on API errors

---

## Resume AI Pipeline (`modules/resume`)

### Processing Flow

```
POST /api/resume/upload
  ↓ Store file (disk / S3)
  ↓ ResumeParserService.parseFile()
      ├── PDF → pdf-parse
      └── DOCX → mammoth
  ↓ Extract raw text + skills

POST /api/resume/:id/analyze
  ↓ Load extracted text from DB
  ↓ Build prompt (RESUME_ANALYSIS_PROMPT)
  ↓ OpenAIService.sendMessage()
  ↓ JSON.parse() → validate required fields
  ↓ Upsert ResumeAnalysis record
  ↓ Update Resume.processingStatus = COMPLETED
```

### Prompt Architecture

**File:** `modules/resume/prompts/resume-analysis.prompt.ts`

| Prompt | Purpose |
|--------|---------|
| `RESUME_ANALYSIS_PROMPT` | Full resume evaluation (scores, skills, recommendations) |
| `SKILL_EXTRACTION_PROMPT` | Lightweight skill-only extraction |

**Evaluation dimensions:**

| Score | Description |
|-------|-------------|
| `overallScore` | Holistic resume quality (0-100) |
| `atsScore` | Applicant Tracking System compatibility |
| `skillScore` | Depth and relevance of technical skills |
| `experienceScore` | Work history quality and relevance |
| `formatScore` | Readability and professional presentation |

### AI Response Schema

```json
{
  "overallScore": 85,
  "atsScore": 90,
  "skillScore": 82,
  "experienceScore": 80,
  "formatScore": 88,
  "experienceLevel": "SENIOR",
  "detectedSkills": ["TypeScript", "Angular", "NestJS"],
  "strengths": ["..."],
  "weaknesses": ["..."],
  "missingKeywords": ["Kubernetes", "Terraform"],
  "recommendations": ["..."],
  "improvedSummary": "...",
  "summary": "..."
}
```

---

## Job Matching AI Pipeline (`modules/jobs`)

### Processing Flow

```
POST /api/job-analysis/match
  ↓ Validate resume ownership
  ↓ Validate extracted text exists
  ↓ Save JobDescription record
  ↓ Build prompt (JOB_MATCH_PROMPT)
  ↓ OpenAIService.sendMessage()
  ↓ JSON.parse() → validate matchPercentage
  ↓ Save JobMatchAnalysis record
```

### Prompt Architecture

**File:** `modules/jobs/prompts/job-match.prompt.ts`

Inputs to prompt:
- Resume full text (first 4000 chars)
- Job description (first 3000 chars)
- Job title + company name

### AI Response Schema

```json
{
  "matchPercentage": 82,
  "matchedSkills": ["TypeScript", "Angular"],
  "missingSkills": ["Kubernetes", "Terraform"],
  "skillGap": {
    "critical": ["Kubernetes"],
    "optional": ["Terraform"]
  },
  "recommendations": ["..."],
  "interviewPreparationTips": ["..."],
  "experienceGap": "...",
  "overallAssessment": "..."
}
```

---

## Interview Evaluation AI Pipeline (`modules/evaluation`)

*(Pre-existing — Phase 3)*

Evaluates each answer across 5 skill dimensions:
- Technical Knowledge
- Architecture & Design
- Communication
- Problem Solving
- Code Quality

Returns: `technicalScore`, `architectureScore`, `communicationScore`, `problemSolvingScore`, `codeQualityScore`, `overallScore`, `strengths`, `weaknesses`, `recommendations`.

---

## Security Notes

- API key stored in `OPENAI_API_KEY` environment variable only
- Never logged or returned in API responses
- All AI endpoints protected by JWT `@UseGuards(JwtAuthGuard)`
- User ownership validated before any AI call
- Resume text truncated to prevent prompt injection via large files
