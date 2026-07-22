# Admin Portal Design

## Overview

The Admin Portal is a comprehensive administrative dashboard for managing the AI Interview Coach platform. It provides role-based access control (RBAC), allowing authorized administrators to oversee users, monitor platform activity, view AI usage metrics, and configure system settings.

## Architecture

### Backend Architecture

**Module Location**: `apps/api/src/modules/admin/`

**Key Components**:
1. **AdminGuard** (`guards/admin.guard.ts`)
   - Extends NestJS AuthGuard('jwt')
   - Validates JWT tokens
   - Checks user role === 'ADMIN'
   - Returns ForbiddenException (403) if unauthorized

2. **AdminService** (`services/admin.service.ts`)
   - Core business logic with 40+ methods
   - Organized in logical sections: Dashboard, Users, Interviews, AI Usage, Configurations
   - All methods use PrismaService for data access
   - Implements error handling and validation

3. **AdminController** (`controllers/admin.controller.ts`)
   - REST API endpoints (16 total)
   - All endpoints protected with @UseGuards(AdminGuard)
   - Supports pagination, filtering, and search
   - Proper error responses

4. **AIUsageLogService** (`services/ai-usage-log.service.ts`)
   - Centralized logging for AI operations
   - Logs AI usage across features
   - Tracks system errors with severity levels
   - Try-catch wrapped to prevent logging failures from breaking operations

### Frontend Architecture

**Feature Location**: `apps/web/src/app/features/admin/`

**Key Components**:
1. **AdminService** (`services/admin.service.ts`)
   - HTTP client for all admin API calls
   - Observable-based API
   - Proper query parameter handling

2. **AdminStore** (`store/admin.store.ts`)
   - Angular signals-based state management
   - Manages: dashboard, users, AI usage, configurations, errors
   - Computed signals for derived state (activeConfig, criticalErrors)
   - Methods for state updates and reset

3. **Reusable Components**:
   - `MetricCardComponent`: Displays individual metrics
   - `UserTableComponent`: User management with search/filter/pagination
   - `ErrorTableComponent`: Error logs with severity badges

4. **Pages**:
   - `DashboardComponent`: Main admin dashboard with metrics and quick nav
   - `UsersComponent`: User management interface
   - `AIMonitoringComponent`: AI usage and cost analysis
   - `SettingsComponent`: AI configuration management

5. **Routing & Protection**:
   - `admin.routes.ts`: Route configuration
   - `admin.guard.ts`: Frontend route protection
   - All admin routes require user.role === 'ADMIN'

## Security Model

### Backend Security

```
1. JWT Validation → 2. User Extraction → 3. Role Verification → 4. Request Processing
```

**AdminGuard Flow**:
- Passport.js JWT strategy validates token signature and expiration
- Decoded payload attached to `request.user`
- AdminGuard checks `request.user.role === 'ADMIN'`
- ForbiddenException thrown if not admin
- Only admins can access /api/admin/* endpoints

### Frontend Security

```
canActivate: [adminGuard] → Check isAuthenticated() → Check user.role === 'ADMIN'
```

**Guard Logic**:
- Redirects unauthenticated users to `/login`
- Redirects non-admin users to `/dashboard`
- Only admins access admin routes

### Data Protection

- Soft-delete pattern for technologies and categories (isActive boolean)
- User deletion cascades appropriately via Prisma relations
- Sensitive operations (role changes, status updates) require admin verification
- All API responses include proper HTTP status codes

## Database Schema

### New Models

#### AIUsageLog
```prisma
model AIUsageLog {
  id              String    @id @default(cuid())
  userId          String?   @db.Uuid
  feature         AIFeature
  model           String    // e.g., "gpt-4o-mini"
  tokensUsed      Int       @default(0)
  requestDuration Int?      // milliseconds
  status          String    @default("SUCCESS")
  errorMessage    String?   @db.Text
  createdAt       DateTime  @default(now())
  user            User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  @@index([userId])
  @@index([feature])
  @@index([createdAt])
  @@index([status])
}
```

#### SystemErrorLog
```prisma
model SystemErrorLog {
  id           String        @id @default(cuid())
  service      String        // e.g., "AuthService"
  errorMessage String        @db.Text
  stackTrace   String?       @db.Text
  severity     ErrorSeverity @default(MEDIUM)
  context      Json?
  createdAt    DateTime      @default(now())
  
  @@index([service])
  @@index([severity])
  @@index([createdAt])
}
```

#### AIConfiguration
```prisma
model AIConfiguration {
  id                  String  @id @default(cuid())
  modelName           String
  temperature         Float   // 0.0 - 2.0
  maxTokens           Int     // 100 - 8000
  systemPromptVersion String  @default("1.0")
  isActive            Boolean @default(false)
  description         String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  @@index([isActive])
}
```

#### Enums

**AIFeature**:
- INTERVIEW_EVALUATION
- RESUME_ANALYSIS
- JOB_MATCHING
- QUESTION_GENERATION

**ErrorSeverity**:
- LOW
- MEDIUM
- HIGH
- CRITICAL

## API Endpoints

### Dashboard
- **GET** `/api/admin/dashboard` → AdminDashboard (10 metrics)

### User Management
- **GET** `/api/admin/users?page=1&limit=20&search=john&role=USER&isActive=true` → Paginated users list
- **GET** `/api/admin/users/:id` → User detail with interviews, resumes, AI usage
- **PATCH** `/api/admin/users/:id/status` → Update user active status
- **PATCH** `/api/admin/users/:id/role` → Update user role (USER ↔ ADMIN)

### Interview Management
- **GET** `/api/admin/interviews?page=1&limit=20&status=COMPLETED` → Paginated interviews

### AI Usage Monitoring
- **GET** `/api/admin/ai-usage?days=30` → Aggregated usage stats
  - Total requests, tokens, estimated cost
  - Breakdown by feature
  - Daily usage trend (last 7 days)

### AI Configuration
- **GET** `/api/admin/ai-config` → List all configurations
- **POST** `/api/admin/ai-config` → Create new configuration
- **PATCH** `/api/admin/ai-config/:id` → Update configuration
- **PATCH** `/api/admin/ai-config/:id/activate` → Activate config (deactivates others)

### Technology Management
- **GET** `/api/admin/technologies` → List all technologies
- **POST** `/api/admin/technologies` → Create technology
- **PATCH** `/api/admin/technologies/:id` → Update technology
- **DELETE** `/api/admin/technologies/:id` → Soft-delete technology

### Category Management
- **GET** `/api/admin/categories` → List all categories
- **POST** `/api/admin/categories` → Create category
- **PATCH** `/api/admin/categories/:id` → Update category
- **DELETE** `/api/admin/categories/:id` → Soft-delete category

### Error Monitoring
- **GET** `/api/admin/errors?severity=CRITICAL&days=7` → System error logs with severity filter

## AI Cost Calculation

**Pricing Model**: $0.00015 per 1000 tokens (gpt-4o-mini)

**Formula**: 
```
estimatedCost = (totalTokens / 1000) * 0.00015
```

**Example**:
- 100,000 tokens used
- Cost = (100,000 / 1000) * 0.00015 = $0.015

## Workflows

### User Management Workflow
1. Admin navigates to Users page
2. Admin searches/filters users
3. Admin clicks action menu on user
4. Admin can:
   - Activate/Deactivate user account
   - Promote to Admin / Demote to User
5. Changes reflected in real-time
6. Snackbar notification confirms action

### AI Configuration Workflow
1. Admin navigates to Settings
2. Admin reviews current active configuration
3. Admin can:
   - Create new configuration with different parameters
   - Edit existing configuration
   - Activate different configuration (auto-deactivates current)
4. New config takes effect immediately for new requests

### Error Monitoring Workflow
1. Admin views dashboard for critical errors
2. Admin clicks to error details page
3. Admin filters by severity level
4. Admin reviews stack trace and context
5. Admin can identify affected services and take corrective action

## Admin Dashboard Metrics

| Metric | Purpose |
|--------|---------|
| Total Users | Platform reach |
| Active Users | Engagement level |
| New Users (week) | Growth rate |
| Total Interviews | Usage volume |
| Completed Interviews | Completion rate |
| Average Score | Performance metric |
| Total Resumes | Document volume |
| Total AI Requests | AI usage |
| Critical Errors (24h) | System health |

## Error Handling

### Backend
- All endpoints return appropriate HTTP status codes
- 403 Forbidden for unauthorized access
- 400 Bad Request for invalid input
- 500 Internal Server Error with descriptive messages
- Logging errors with severity classification

### Frontend
- HTTP errors caught and displayed to user
- Snackbar notifications for action feedback
- Loading states during operations
- Error boundary prevents cascading failures

## Testing

### Backend Tests
- **AdminGuard**: JWT validation, role verification, error cases
- **AdminService**: Dashboard aggregation, user filtering, CRUD operations
- **AIUsageLogService**: Logging without breaking operations

### Frontend Tests
- **AdminService**: HTTP calls with HttpTestingController
- **AdminStore**: Signal updates, computed properties, state management
- **Guard**: Authentication and authorization checks
- **Components**: Input binding, event emission, Material integration

## Monitoring & Logging

### What Gets Logged
- All AI operations (feature, model, tokens, duration)
- System errors with severity levels
- User actions (status changes, role promotions)
- Configuration changes

### Log Retention
- AIUsageLog: Indefinite (for analytics)
- SystemErrorLog: 30 days recommended
- Action audit: Stored in User.auditLog or separate AuditLog table

## Future Enhancements

1. **Audit Logging**: Track all admin actions for compliance
2. **Batch Operations**: Bulk user status/role updates
3. **Advanced Analytics**: Cohort analysis, retention curves
4. **Custom Reports**: Admin can create and schedule reports
5. **Webhook Integrations**: Alert admins on critical errors
6. **Rate Limiting**: Per-user/feature rate limits configurable
7. **Data Export**: CSV export of user/interview/error data
8. **Role-based Granularity**: More specific permissions (e.g., "View Analytics Only")

## Deployment Considerations

- AdminGuard must be deployed with updated User entity including role field
- Prisma migrations required for new models
- Frontend routes must be protected before deployment
- JWT strategy must be configured in auth module
- Environment variables for AI pricing if it changes
