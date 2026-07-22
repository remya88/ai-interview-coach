# API Specification

## Authentication APIs

### Register
POST /api/auth/register

Request body:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "Password1"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "role": "USER"
  },
  "accessToken": "jwt",
  "refreshToken": "jwt"
}
```

### Login
POST /api/auth/login

### Refresh
POST /api/auth/refresh

### Logout
POST /api/auth/logout

### Profile
GET /api/users/profile
PATCH /api/users/profile

---

## Analytics APIs

All endpoints require `Authorization: Bearer <token>` header.

### GET /api/analytics/dashboard

Returns aggregated metrics for the authenticated user's dashboard.

**Response:**
```json
{
  "totalInterviews": 25,
  "completedInterviews": 22,
  "averageScore": 78,
  "totalPracticeHours": 12,
  "currentStreak": 5,
  "strongestSkills": [
    { "skill": "Technical Knowledge", "score": 88 },
    { "skill": "Problem Solving", "score": 82 }
  ],
  "weakestSkills": [
    { "skill": "Architecture", "score": 62 },
    { "skill": "Code Quality", "score": 65 }
  ],
  "recentInterviews": [
    {
      "id": "uuid",
      "technology": "JavaScript",
      "score": 85,
      "date": "2026-07-18T10:00:00Z",
      "difficulty": "MEDIUM"
    }
  ]
}
```

---

### GET /api/analytics/performance

Returns daily average scores over a rolling period.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `days` | number | `30` | Number of past days to include |

**Response:**
```json
[
  { "date": "2026-07-01T00:00:00Z", "averageScore": 72, "interviewCount": 2 },
  { "date": "2026-07-08T00:00:00Z", "averageScore": 78, "interviewCount": 1 }
]
```

---

### GET /api/analytics/skills

Returns per-skill performance breakdown.

**Response:**
```json
[
  {
    "skillName": "Technical Knowledge",
    "currentScore": 88,
    "improvement": 12,
    "attempts": 8,
    "category": "strong"
  },
  {
    "skillName": "Architecture",
    "currentScore": 62,
    "improvement": -3,
    "attempts": 5,
    "category": "weak"
  }
]
```

`category` is one of: `"strong"` | `"weak"` | `"improving"`

---

### GET /api/analytics/technology

Returns performance grouped by technology.

**Response:**
```json
[
  {
    "technology": "JavaScript",
    "interviews": 10,
    "averageScore": 80,
    "bestScore": 95,
    "worstScore": 60,
    "improvementTrend": 8
  }
]
```

`improvementTrend` is a signed percentage (positive = improving, negative = declining).

---

### GET /api/analytics/history

Returns paginated interview history with optional filters.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 100) |
| `technology` | string | Filter by technology name (partial match) |
| `difficulty` | string | Filter by difficulty: `EASY` \| `MEDIUM` \| `HARD` |
| `fromDate` | ISO string | Filter interviews on or after this date |
| `toDate` | ISO string | Filter interviews on or before this date |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "technology": "TypeScript",
      "score": 82,
      "date": "2026-07-15T14:00:00Z",
      "difficulty": "MEDIUM",
      "type": "TECHNICAL",
      "questionsCount": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 22,
    "pages": 3
  }
}
```

---

### GET /api/analytics/summary

Returns overall performance trend analysis.

**Response:**
```json
{
  "data": {
    "overallTrend": "improving",
    "trendPercentage": 6,
    "nextLevelThreshold": 85,
    "estimatedDaysToNextLevel": 14
  },
  "timestamp": "2026-07-20T08:00:00Z"
}
```

`overallTrend` is one of: `"improving"` | `"stable"` | `"declining"`

---

## Resume APIs

All endpoints require `Authorization: Bearer <token>` header.

### POST /api/resume/upload

Upload a resume file (PDF or DOCX, max 5 MB).

**Content-Type:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `file` | File | PDF or DOCX file |

**Response (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "originalFilename": "my-resume.pdf",
  "fileType": "application/pdf",
  "fileSize": 204800,
  "processingStatus": "COMPLETED",
  "atsScore": null,
  "uploadedAt": "2026-07-20T10:00:00Z"
}
```

---

### GET /api/resume

Returns all resumes for the authenticated user.

**Response:**
```json
[
  {
    "id": "uuid",
    "originalFilename": "my-resume.pdf",
    "processingStatus": "COMPLETED",
    "atsScore": 88,
    "uploadedAt": "2026-07-20T10:00:00Z",
    "resumeAnalyses": [{ "id": "uuid", "overallScore": 85, "createdAt": "..." }]
  }
]
```

---

### GET /api/resume/:id

Returns a specific resume with its latest analysis summary.

---

### POST /api/resume/:id/analyze

Triggers AI analysis for the specified resume.

**Response (200):**
```json
{
  "id": "uuid",
  "resumeId": "uuid",
  "overallScore": 85,
  "atsScore": 88,
  "skillScore": 82,
  "experienceScore": 80,
  "formatScore": 90,
  "experienceLevel": "SENIOR",
  "detectedSkills": ["TypeScript", "Angular", "NestJS"],
  "strengths": ["Strong TypeScript skills", "Good project portfolio"],
  "weaknesses": ["Limited cloud infrastructure experience"],
  "missingKeywords": ["Kubernetes", "Terraform"],
  "recommendations": ["Add cloud certifications to profile"],
  "improvedSummary": "Experienced full-stack engineer...",
  "summary": "Strong developer with 5 years of experience",
  "createdAt": "2026-07-20T10:05:00Z"
}
```

---

### GET /api/resume/:id/report

Returns the resume metadata and its latest analysis together.

**Response:**
```json
{
  "resume": {
    "id": "uuid",
    "originalFilename": "my-resume.pdf",
    "processingStatus": "COMPLETED",
    "uploadedAt": "2026-07-20T10:00:00Z"
  },
  "analysis": { "...": "full analysis object above" }
}
```

---

## Job Analysis APIs

### POST /api/job-analysis/match

Match a resume against a job description using AI.

**Request Body:**
```json
{
  "resumeId": "uuid",
  "jobTitle": "Senior Frontend Engineer",
  "jobDescription": "We are looking for a Senior Frontend Engineer...",
  "companyName": "TechCorp",
  "requiredSkills": ["TypeScript", "Angular"],
  "preferredSkills": ["Kubernetes"]
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "resumeId": "uuid",
  "jobDescriptionId": "uuid",
  "matchPercentage": 82,
  "matchedSkills": ["TypeScript", "Angular", "Node.js"],
  "missingSkills": ["Kubernetes", "Terraform"],
  "skillGap": {
    "critical": ["Kubernetes"],
    "optional": ["Terraform"]
  },
  "recommendations": [
    "Complete a Kubernetes certification",
    "Add infrastructure-as-code projects to portfolio"
  ],
  "interviewPreparationTips": [
    "Study system design patterns for distributed systems",
    "Prepare examples of leading frontend architecture decisions"
  ],
  "overallAssessment": "Strong frontend match with minor DevOps gaps.",
  "experienceGap": "Candidate has solid development background but lacks DevOps.",
  "jobDescription": {
    "id": "uuid",
    "jobTitle": "Senior Frontend Engineer",
    "companyName": "TechCorp"
  },
  "createdAt": "2026-07-20T10:10:00Z"
}
```

---

### GET /api/job-analysis

Returns all job match results for the authenticated user.

---

### GET /api/job-analysis/:id

Returns a specific job match result by ID.

