# DailyTaskVerse - Project Walkthrough

A step-by-step guide to understanding the complete architecture, codebase, and workflow of the DailyTaskVerse application — an internal office productivity tool for managing daily tasks, work logs, and productivity analytics.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Solution Structure](#3-solution-structure)
4. [Backend Walkthrough](#4-backend-walkthrough)
   - 4.1 [Domain Layer](#41-domain-layer---entities--business-rules)
   - 4.2 [Infrastructure Layer](#42-infrastructure-layer---data-access)
   - 4.3 [Application Layer](#43-application-layer---business-logic)
   - 4.4 [API Layer](#44-api-layer---controllers--middleware)
5. [Frontend Walkthrough](#5-frontend-walkthrough)
   - 5.1 [Entry Point & Providers](#51-entry-point--providers)
   - 5.2 [Routing & Route Guards](#52-routing--route-guards)
   - 5.3 [State Management (Contexts)](#53-state-management-contexts)
   - 5.4 [API Service Layer](#54-api-service-layer)
   - 5.5 [Utility Functions](#55-utility-functions)
   - 5.6 [Page Components](#56-page-components)
   - 5.7 [Layout & Common Components](#57-layout--common-components)
   - 5.8 [Theming System](#58-theming-system)
6. [Database Schema](#6-database-schema)
7. [API Endpoints Reference](#7-api-endpoints-reference)
8. [Application Workflows](#8-application-workflows)
9. [Running the Project](#9-running-the-project)
10. [Configuration Reference](#10-configuration-reference)

---

## 1. Project Overview

**DailyTaskVerse** is a full-stack web application designed as an internal office productivity tool. It allows employees to manage their daily tasks, write work logs, track time, take notes, and view productivity analytics. Administrators get an additional dashboard to monitor all users and system-wide statistics.

### Key Features

| Feature | Employee | Admin |
|---------|----------|-------|
| Task Management (CRUD, filter, paginate, categories, recurring) | Yes | Yes |
| Task Reminders (preset or custom datetime) | Yes | Yes |
| Daily Work Log with Hours Tracking (CRUD, paginate) | Yes | Yes |
| Daily Standup Generator (auto-generated from recent work) | Yes | Yes |
| Weekly Timesheet View (hours per day, task stats) | Yes | Yes |
| Notes / Scratchpad (CRUD, pin/unpin) | Yes | Yes |
| Personal Dashboard (stats, recent activity) | Yes | Yes |
| Reports (weekly, monthly, status charts) | Yes | Yes |
| In-App Notifications (overdue alerts, reminders) | Yes | Yes |
| Export to Excel (Tasks, Daily Logs, Timesheet, Notes) | Yes | Yes |
| Admin Dashboard (all users, system stats) | No | Yes |
| User Management (view all users) | No | Yes |
| Theme Customization (6 themes) | Yes | Yes |

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@dailytaskverse.com` | `Admin@123` |

New employees can self-register via the registration form.

---

## 2. Technology Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **ASP.NET Core 9.0** | Web API framework |
| **Entity Framework Core 9.0** | ORM / Database access |
| **SQL Server** | Relational database |
| **ASP.NET Core Identity** | User management & password hashing |
| **ClosedXML** | Excel file generation (Export to .xlsx) |
| **Swashbuckle** | Swagger/OpenAPI documentation |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **React Router 7** | Client-side routing |
| **Vite 7** | Build tool & dev server |
| **Axios** | HTTP client for API calls |
| **Recharts** | Charts & data visualization |
| **React Hot Toast** | Toast notifications |
| **React Icons** | Material Design icon library |

### Tooling
| Tool | Purpose |
|------|---------|
| **.NET 9 SDK (9.0.308)** | Backend build & run |
| **Node.js + npm** | Frontend dependency management |
| **global.json** | Pins .NET SDK version |
| **Directory.Build.props** | MSBuildSDKsPath for .NET 9 |

---

## 3. Solution Structure

```
DailyTaskVerse/
├── DailyTaskVerse.sln                    # .NET solution file
├── global.json                           # SDK version: 9.0.308
├── Directory.Build.props                 # MSBuildSDKsPath config
├── scripts/
│   ├── run-all.bat                       # Launch API + UI together
│   ├── run-api.bat                       # Launch API only
│   ├── run-ui.bat                        # Launch UI only
│   └── bump-version.bat                  # Version management (auto/major/minor/patch/set/tag)
│
├── DailyTaskVerse.Domain/                # Layer 1: Core entities & interfaces
│   ├── Entities/
│   │   ├── ApplicationUser.cs
│   │   ├── TaskItem.cs
│   │   ├── DailyLog.cs
│   │   ├── Note.cs
│   │   └── Notification.cs
│   ├── Enums/
│   │   ├── UserRole.cs
│   │   ├── TaskPriority.cs
│   │   ├── TaskItemStatus.cs
│   │   └── NotificationType.cs
│   └── Interfaces/
│       ├── ITaskRepository.cs
│       ├── IDailyLogRepository.cs
│       ├── IUserRepository.cs
│       ├── INoteRepository.cs
│       └── INotificationRepository.cs
│
├── DailyTaskVerse.Infrastructure/        # Layer 2: Data access
│   ├── Data/
│   │   └── AppDbContext.cs
│   ├── Repositories/
│   │   ├── TaskRepository.cs
│   │   ├── DailyLogRepository.cs
│   │   ├── UserRepository.cs
│   │   ├── NoteRepository.cs
│   │   └── NotificationRepository.cs
│   ├── Migrations/
│   │   ├── 20260212171007_InitialCreate.cs
│   │   ├── 20260212174707_AddLastLoginAt.cs
│   │   ├── 20260213171534_AddHoursSpentToDailyLog.cs
│   │   ├── 20260213190536_AddCategoryToTask.cs
│   │   ├── 20260213191329_AddRecurringTaskFields.cs
│   │   ├── 20260213191806_AddNotesTable.cs
│   │   ├── 20260213195133_AddNotificationsAndReminders.cs
│   │   ├── 20260216173455_AddStandupTimeToUser.cs
│   │   └── 20260217171316_AddDailyLogTimeFields.cs
│   └── DependencyInjection.cs
│
├── DailyTaskVerse.Application/           # Layer 3: Business logic & DTOs
│   ├── Interfaces/
│   │   ├── IAuthService.cs
│   │   ├── ITaskService.cs
│   │   ├── IDailyLogService.cs
│   │   ├── IDashboardService.cs
│   │   ├── IAdminService.cs
│   │   ├── INoteService.cs
│   │   ├── IExportService.cs
│   │   └── INotificationService.cs
│   ├── Services/
│   │   ├── AuthService.cs
│   │   ├── TaskService.cs
│   │   ├── DailyLogService.cs
│   │   ├── DashboardService.cs
│   │   ├── AdminService.cs
│   │   ├── NoteService.cs
│   │   ├── ExportService.cs
│   │   └── NotificationService.cs
│   ├── DTOs/
│   │   ├── Auth/ (LoginRequest, RegisterRequest, AuthResponse)
│   │   ├── Tasks/ (TaskDto, CreateTaskRequest, UpdateTaskRequest, TaskFilterRequest)
│   │   ├── DailyLogs/ (DailyLogDto, CreateDailyLogRequest, UpdateDailyLogRequest)
│   │   ├── Dashboard/ (DashboardDto, ReportDto, StandupDto, TimesheetDto)
│   │   ├── Admin/ (AdminDashboardDto)
│   │   ├── Notes/ (NoteDto, CreateNoteRequest, UpdateNoteRequest)
│   │   ├── Notifications/ (NotificationDto)
│   │   └── Common/ (PagedResult<T>)
│   └── DependencyInjection.cs
│
├── DailyTaskVerse.API/                   # Layer 4: Web API
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── TaskController.cs
│   │   ├── DailyLogController.cs
│   │   ├── DashboardController.cs
│   │   ├── AdminController.cs
│   │   ├── NoteController.cs
│   │   ├── ExportController.cs
│   │   └── NotificationController.cs
│   ├── BackgroundServices/
│   │   ├── OverdueTaskCheckerService.cs
│   │   └── ReminderCheckerService.cs
│   ├── Middleware/
│   │   └── ExceptionHandlingMiddleware.cs
│   ├── Program.cs                        # App startup & configuration
│   ├── appsettings.json
│   └── appsettings.Development.json
│
└── dailytaskverse-client/                # React Frontend
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx                      # Entry point
        ├── App.jsx                       # Routing & providers
        ├── index.css                     # Design tokens (CSS variables)
        ├── themes.css                    # 6 theme overrides
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ThemeContext.jsx
        ├── services/
        │   └── api.js                    # Axios instance & API modules
        ├── utils/
        │   └── dateUtils.js              # IST timezone date formatting helpers
        ├── pages/
        │   ├── Login.jsx / Login.css
        │   ├── Dashboard.jsx / Dashboard.css
        │   ├── Tasks.jsx / Tasks.css
        │   ├── DailyLog.jsx / DailyLog.css
        │   ├── Standup.jsx / Standup.css
        │   ├── Timesheet.jsx / Timesheet.css
        │   ├── Notes.jsx / Notes.css
        │   ├── Reports.jsx / Reports.css
        │   └── AdminDashboard.jsx / AdminDashboard.css
        └── components/
            ├── layout/
            │   ├── AppLayout.jsx / AppLayout.css
            │   └── Sidebar.jsx / Sidebar.css
            └── common/
                ├── Modal.jsx / Modal.css
                ├── ConfirmDialog.jsx / ConfirmDialog.css
                ├── CustomSelect.jsx / CustomSelect.css
                ├── CustomDatePicker.jsx / CustomDatePicker.css
                ├── CustomTimePicker.jsx / CustomTimePicker.css
                ├── NotificationBell.jsx / NotificationBell.css
                └── ThemePicker.jsx / ThemePicker.css
```

---

## 4. Backend Walkthrough

The backend follows **Clean Architecture** with 4 clearly separated layers. Dependencies flow inward: API → Application → Domain, with Infrastructure implementing Domain interfaces.

### 4.1 Domain Layer - Entities & Business Rules

**Project:** `DailyTaskVerse.Domain`

This is the innermost layer with zero external dependencies (only `Microsoft.Extensions.Identity.Stores` for `IdentityUser` base class).

#### Entities

**ApplicationUser** (`Entities/ApplicationUser.cs`)
- Extends `IdentityUser<Guid>` (ASP.NET Core Identity)
- Custom properties: `Name`, `Role` (enum), `CreatedAt`, `LastLoginAt`, `StandupTime` (TimeSpan, default 10:00 AM)
- Navigation properties: `Tasks`, `DailyLogs`, `Notes`, `Notifications` collections

**TaskItem** (`Entities/TaskItem.cs`)
- Properties: `Id`, `Title`, `Description`, `Priority`, `Status`, `Category`, `IsRecurring`, `RecurrencePattern`, `DueDate`, `ReminderAt`, `CreatedAt`, `UpdatedAt`
- Foreign key: `UserId` → `ApplicationUser`
- Supports task categories (Development, Meetings, Code Review, etc.)
- Supports recurring tasks (Daily, Weekly, Monthly patterns)
- Supports reminders via `ReminderAt` (nullable DateTime)

**DailyLog** (`Entities/DailyLog.cs`)
- Properties: `Id`, `LogDate`, `Content`, `HoursSpent`, `FromTime`, `ToTime`, `CreatedAt`
- Foreign key: `UserId` → `ApplicationUser`
- Business rule: One log per user per date
- `HoursSpent` (nullable decimal) tracks hours worked per day
- `FromTime` / `ToTime` (nullable TimeSpan) track work time range per day

**Note** (`Entities/Note.cs`)
- Properties: `Id`, `Title`, `Content`, `IsPinned`, `CreatedAt`, `UpdatedAt`
- Foreign key: `UserId` → `ApplicationUser`
- Supports pinning to keep important notes at the top

**Notification** (`Entities/Notification.cs`)
- Properties: `Id`, `Title`, `Message`, `Type` (enum), `IsRead`, `CreatedAt`
- Foreign keys: `UserId` → `ApplicationUser`, `TaskId` (nullable) → `TaskItem`
- Generated automatically by background services for overdue tasks and reminders

#### Enums

```
UserRole:          Employee (0), Admin (1)
TaskPriority:      Low (0), Medium (1), High (2)
TaskItemStatus:    Pending (0), InProgress (1), Completed (2)
NotificationType:  TaskOverdue (0), TaskDueSoon (1), Reminder (2)
```

#### Repository Interfaces

- `ITaskRepository` — CRUD + analytics (status distribution, daily stats, count queries)
- `IDailyLogRepository` — CRUD + date-based lookup + count queries
- `IUserRepository` — User counts, active users, users with task counts
- `INoteRepository` — CRUD for user-scoped notes
- `INotificationRepository` — Get by user, unread count, create, mark read, mark all read, exists check (for duplicate prevention)

---

### 4.2 Infrastructure Layer - Data Access

**Project:** `DailyTaskVerse.Infrastructure`

Implements data access using Entity Framework Core with SQL Server.

#### AppDbContext (`Data/AppDbContext.cs`)

- Extends `IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>`
- DbSets: `Tasks`, `DailyLogs`, `Notes`, `Notifications` (Identity tables inherited)
- Entity configuration via Fluent API in `OnModelCreating()`:
  - Enums stored as strings (via `HasConversion`)
  - Primary keys use `NEWSEQUENTIALID()` for performance
  - Indexes on: `TaskItem.UserId`, `TaskItem.Status`, `DailyLog.UserId`, `DailyLog.LogDate`, `Notification.(UserId, IsRead)`
  - Cascade delete on user relationships
  - Notification → TaskItem FK uses `DeleteBehavior.NoAction` (avoids SQL Server multiple cascade path conflict)

#### Repositories

Each repository implements its Domain interface using EF Core:

- **TaskRepository** — Filtered/paginated queries with category support, date range analytics, status distribution grouping
- **DailyLogRepository** — Paginated retrieval, date-based lookup for uniqueness, count queries
- **UserRepository** — Count queries, eager loading of Tasks for user lists
- **NoteRepository** — User-scoped CRUD with pinned-first ordering
- **NotificationRepository** — Latest 50 per user (ordered by CreatedAt desc), unread count, bulk mark-all-as-read via `ExecuteUpdateAsync`, duplicate check via `ExistsAsync`

#### DependencyInjection (`DependencyInjection.cs`)

Registers infrastructure services:
```csharp
services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
services.AddScoped<ITaskRepository, TaskRepository>();
services.AddScoped<IDailyLogRepository, DailyLogRepository>();
services.AddScoped<IUserRepository, UserRepository>();
services.AddScoped<INoteRepository, NoteRepository>();
services.AddScoped<INotificationRepository, NotificationRepository>();
```

#### Migrations

1. **InitialCreate** — All Identity tables + Tasks + DailyLogs tables with indexes
2. **AddLastLoginAt** — Adds nullable `LastLoginAt` column to users
3. **AddHoursSpentToDailyLog** — Adds nullable `HoursSpent` (decimal) column to DailyLogs
4. **AddCategoryToTask** — Adds `Category` (string, max 50) column to Tasks
5. **AddRecurringTaskFields** — Adds `IsRecurring` (bool) and `RecurrencePattern` (string, max 20) to Tasks
6. **AddNotesTable** — Creates Notes table with Id, Title, Content, IsPinned, CreatedAt, UpdatedAt, UserId
7. **AddNotificationsAndReminders** — Creates Notifications table + adds `ReminderAt` (DateTime?) column to Tasks
8. **AddStandupTimeToUser** — Adds `StandupTime` (TIME, default 10:00 AM) column to AspNetUsers
9. **AddDailyLogTimeFields** — Adds nullable `FromTime` (TIME) and `ToTime` (TIME) columns to DailyLogs

---

### 4.3 Application Layer - Business Logic

**Project:** `DailyTaskVerse.Application`

Contains all business logic via service classes and data transfer objects (DTOs).

#### Services

**AuthService**
- `LoginAsync()` — Validates credentials via `UserManager`, updates `LastLoginAt`, returns `UserDto`
- `RegisterAsync()` — Creates new Employee user, validates email uniqueness

**TaskService**
- Full CRUD with ownership verification (every operation checks `userId`)
- Filtering by status, priority, and category with enum parsing
- Pagination via `page`/`pageSize` parameters
- `MarkAsCompletedAsync()` — Sets status to Completed; if recurring, creates next occurrence with calculated next due date
- Maps `ReminderAt` in Create, Update, and MapToDto

**DailyLogService**
- CRUD with ownership verification
- Enforces one-log-per-date business rule (checks existing log for same date)
- Supports `HoursSpent` field and `FromTime`/`ToTime` time-range tracking
- Parses time strings to `TimeSpan` via `ParseTime()` helper
- Pagination support

**DashboardService**
- `GetDashboardAsync()` — Aggregates: total/completed/pending/inProgress tasks, productivity %, 5 recent activities
- `GetWeeklyReportAsync()` — Daily completion stats for current week (Mon-Sun)
- `GetMonthlyReportAsync()` — Weekly aggregated stats for current month
- `GetStatusDistributionAsync()` — Task counts grouped by status
- `GetStandupAsync()` — Auto-generates standup report from yesterday's completed tasks, today's pending tasks, overdue items, daily log content/hours, and configurable standup time windows
- `GetTimesheetAsync()` — Weekly timesheet with daily hours, log content, and task completion stats

**AdminService**
- `GetAdminDashboardAsync()` — System-wide: total users, active today/this week, total/completed tasks, overall productivity
- `GetUsersAsync()` — All users with task counts

**NoteService**
- Full CRUD with ownership verification
- Returns notes ordered by pinned status (pinned first) then by updated date

**ExportService**
- Uses **ClosedXML** library to generate styled Excel workbooks
- `ExportTasksAsync()` — Exports filtered tasks with Title, Description, Priority, Status, Category, Due Date, Recurring, Created columns
- `ExportDailyLogsAsync()` — Exports all daily logs with Date, Content, Hours Spent columns
- `ExportTimesheetAsync()` — Exports weekly timesheet with daily breakdown and summary row
- `ExportNotesAsync()` — Exports all notes with Title, Content, Pinned, Created, Updated columns
- All exports feature bold colored headers (#4F46E5 background, white text) and auto-fitted columns

**NotificationService**
- `GetAllAsync()` — Returns latest 50 notifications for a user
- `GetUnreadCountAsync()` — Returns count of unread notifications
- `MarkAsReadAsync()` — Marks a single notification as read
- `MarkAllAsReadAsync()` — Marks all notifications as read for a user

#### DTOs (Data Transfer Objects)

DTOs are organized by feature area:
- **Auth:** `LoginRequest`, `RegisterRequest`, `AuthResponse`
- **Tasks:** `TaskDto`, `CreateTaskRequest`, `UpdateTaskRequest`, `TaskFilterRequest`
- **DailyLogs:** `DailyLogDto`, `CreateDailyLogRequest`, `UpdateDailyLogRequest` — all include `FromTime`/`ToTime` fields
- **Dashboard:** `DashboardDto`, `ReportDto` (weekly/monthly), `StandupDto` (includes reporting windows, daily logs, hours, standup config), `TimesheetDto`, `StandupConfigDto`, `UpdateStandupConfigRequest`
- **Admin:** `AdminDashboardDto`
- **Notes:** `NoteDto`, `CreateNoteRequest`, `UpdateNoteRequest`
- **Notifications:** `NotificationDto`
- **Common:** `PagedResult<T>` (generic paginated response)

All request DTOs use data annotations for validation (`[Required]`, `[MaxLength]`, `[EmailAddress]`, etc.).

---

### 4.4 API Layer - Controllers & Middleware

**Project:** `DailyTaskVerse.API`

#### Program.cs — Application Startup

The startup configures services and middleware in this order:

```
1. Register Infrastructure layer (DbContext + Repositories)
2. Register Application layer (Services)
3. Configure ASP.NET Core Identity (password rules, EF stores)
4. Register Background Services (OverdueTaskChecker, ReminderChecker)
5. Add Controllers
6. Configure Swagger/OpenAPI
7. Configure CORS (allow frontend origin)
8. Build the app
9. Seed admin user (if not exists)
10. Configure middleware pipeline:
    - Swagger UI (dev only)
    - Exception handling middleware
    - HTTPS redirection
    - CORS
    - Controller routing
```

#### Controllers

All controllers follow the pattern: `[ApiController]`, `[Route("api/[controller]")]`

**AuthController** — Login & Registration
```
POST /api/auth/login         → LoginRequest  → AuthResponse
POST /api/auth/register      → RegisterRequest → AuthResponse (201)
```

**TaskController** — Task CRUD (user-scoped via {userId} route parameter)
```
GET    /api/task/{userId}                → PagedResult<TaskDto>  (with filter query params)
GET    /api/task/{userId}/{id}           → TaskDto
POST   /api/task/{userId}               → TaskDto (201)
PUT    /api/task/{userId}/{id}           → TaskDto
PATCH  /api/task/{userId}/{id}/complete  → TaskDto
DELETE /api/task/{userId}/{id}           → 204 NoContent
```

**DailyLogController** — Daily Log CRUD (user-scoped)
```
GET    /api/dailylog/{userId}            → PagedResult<DailyLogDto>  (with page/pageSize)
GET    /api/dailylog/{userId}/{id}       → DailyLogDto
POST   /api/dailylog/{userId}            → DailyLogDto (201)
PUT    /api/dailylog/{userId}/{id}       → DailyLogDto
DELETE /api/dailylog/{userId}/{id}       → 204 NoContent
```

**DashboardController** — Analytics (user-scoped)
```
GET /api/dashboard/{userId}                    → DashboardDto
GET /api/dashboard/{userId}/weekly-report      → WeeklyReportDto
GET /api/dashboard/{userId}/monthly-report     → MonthlyReportDto
GET /api/dashboard/{userId}/status-distribution → List<StatusDistributionDto>
GET /api/dashboard/{userId}/standup            → StandupDto
GET /api/dashboard/{userId}/timesheet?weekStart= → TimesheetDto
```

**NoteController** — Notes CRUD (user-scoped)
```
GET    /api/note/{userId}                → List<NoteDto>
GET    /api/note/{userId}/{id}           → NoteDto
POST   /api/note/{userId}               → NoteDto (201)
PUT    /api/note/{userId}/{id}           → NoteDto
DELETE /api/note/{userId}/{id}           → 204 NoContent
```

**ExportController** — Excel Export (user-scoped)
```
GET /api/export/{userId}/tasks?status=&priority=&category=  → tasks_{date}.xlsx
GET /api/export/{userId}/daily-logs                          → daily_logs_{date}.xlsx
GET /api/export/{userId}/timesheet?weekStart=                → timesheet_{date}.xlsx
GET /api/export/{userId}/notes                               → notes_{date}.xlsx
```

**NotificationController** — In-App Notifications (user-scoped)
```
GET   /api/notification/{userId}              → List<NotificationDto> (latest 50)
GET   /api/notification/{userId}/unread-count → { count: N }
PATCH /api/notification/{userId}/{id}/read    → 204 NoContent
PATCH /api/notification/{userId}/read-all     → 204 NoContent
```

**AdminController** — Admin-only endpoints
```
GET /api/admin/dashboard  → AdminDashboardDto
GET /api/admin/users      → List<UserListDto>
```

#### Background Services

**OverdueTaskCheckerService** — Runs every **30 minutes** (and immediately on startup)
- Scans all users' non-completed tasks where `DueDate < DateTime.UtcNow`
- Creates `TaskOverdue` notifications for newly overdue tasks
- Uses `ExistsAsync` to prevent duplicate notifications for the same task

**ReminderCheckerService** — Runs every **5 minutes** (and immediately on startup)
- Scans all users' non-completed tasks where `ReminderAt <= DateTime.UtcNow`
- Creates `Reminder` notifications for triggered reminders
- Clears `ReminderAt` to `null` after firing (prevents re-triggering)
- Uses `ExistsAsync` to prevent duplicate notifications

#### ExceptionHandlingMiddleware

Global exception handler that maps exceptions to HTTP status codes:

| Exception | Status Code |
|-----------|-------------|
| `UnauthorizedAccessException` | 401 Unauthorized |
| `KeyNotFoundException` | 404 Not Found |
| `InvalidOperationException` | 400 Bad Request |
| `ArgumentException` | 400 Bad Request |
| Any other exception | 500 Internal Server Error |

Response format: `{ "error": "message" }`

---

## 5. Frontend Walkthrough

The React frontend is a single-page application (SPA) with client-side routing, context-based state management, and a comprehensive CSS theming system.

### 5.1 Entry Point & Providers

**`main.jsx`** — Renders the root `<App />` component inside `React.StrictMode`, importing global styles (`index.css`) and theme overrides (`themes.css`).

**`App.jsx`** — Sets up the provider hierarchy:

```
<ThemeProvider>              ← Theme state (outermost, no router dependency)
  <BrowserRouter>            ← React Router
    <AuthProvider>           ← Auth state (needs router for redirects)
      <AppRoutes />          ← Route definitions
      <Toaster />            ← Toast notifications
    </AuthProvider>
  </BrowserRouter>
</ThemeProvider>
```

### 5.2 Routing & Route Guards

Three route guard wrapper components protect routes:

| Guard | Purpose |
|-------|---------|
| `ProtectedRoute` | Redirects unauthenticated users to `/login` |
| `AdminRoute` | Requires authenticated Admin; redirects others to `/` |
| `PublicRoute` | Redirects authenticated users away from login (Admins → `/admin`, Employees → `/`) |

**Route Table:**

| Path | Component | Guard | Layout |
|------|-----------|-------|--------|
| `/login` | `Login` | PublicRoute | None (standalone) |
| `/` | `Dashboard` | ProtectedRoute | AppLayout (with sidebar) |
| `/tasks` | `Tasks` | ProtectedRoute | AppLayout |
| `/daily-log` | `DailyLog` | ProtectedRoute | AppLayout |
| `/standup` | `Standup` | ProtectedRoute | AppLayout |
| `/timesheet` | `Timesheet` | ProtectedRoute | AppLayout |
| `/notes` | `Notes` | ProtectedRoute | AppLayout |
| `/reports` | `Reports` | ProtectedRoute | AppLayout |
| `/admin` | `AdminDashboard` | AdminRoute | AppLayout |
| `*` | Redirect to `/` | — | — |

### 5.3 State Management (Contexts)

#### AuthContext (`context/AuthContext.jsx`)

Manages user authentication state with localStorage persistence.

**State:**
- `user` — Current user object `{ id, name, email, role }` or `null`
- `loading` — Boolean for async operations

**Methods:**
- `login(email, password)` — POST `/auth/login`, stores user in localStorage
- `register(name, email, password)` — POST `/auth/register`, stores user in localStorage
- `logout()` — Clears localStorage, user becomes `null`
- `isAuthenticated` — Computed from `!!user`

#### ThemeContext (`context/ThemeContext.jsx`)

Manages the active theme with localStorage persistence.

**Available Themes:**

| ID | Name | Accent Color | Mode |
|----|------|-------------|------|
| `cosmic-light` | Cosmic | `#4f46e5` (Indigo) | Light |
| `cosmic-dark` | Cosmic Dark | `#7c6aff` (Bright Purple) | Dark |
| `ocean` | Ocean | `#0891b2` (Cyan) | Light |
| `sunset` | Sunset | `#ea580c` (Orange) | Light |
| `forest` | Forest | `#059669` (Emerald) | Light |
| `midnight` | Midnight | `#6366f1` (Indigo) | Dark |

**How it works:**
1. Reads saved theme from localStorage (`dtv-theme` key)
2. Sets `data-theme` attribute on `<html>` element
3. CSS variables in `themes.css` respond to `[data-theme="..."]` selectors
4. Adds temporary `theme-transitioning` class for 400ms smooth color transition

### 5.4 API Service Layer

**File:** `services/api.js`

Centralized Axios instance with all API modules:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:5246/api',  // or VITE_API_URL env var
  headers: { 'Content-Type': 'application/json' }
});
```

**Response interceptor:** Catches 401 errors → clears localStorage → redirects to `/login`

**API Modules:**

| Module | Methods |
|--------|---------|
| `authApi` | `login(data)`, `register(data)` |
| `taskApi` | `getAll(params)`, `getById(id)`, `create(data)`, `update(id, data)`, `complete(id)`, `delete(id)` |
| `dailyLogApi` | `getAll(params)`, `getById(id)`, `create(data)`, `update(id, data)`, `delete(id)` |
| `dashboardApi` | `get()`, `weeklyReport()`, `monthlyReport()`, `statusDistribution()`, `standup()`, `timesheet(weekStart)` |
| `noteApi` | `getAll()`, `getById(id)`, `create(data)`, `update(id, data)`, `delete(id)` |
| `exportApi` | `tasks(params)`, `dailyLogs()`, `timesheet(weekStart)`, `notes()` — all return blobs |
| `notificationApi` | `getAll()`, `getUnreadCount()`, `markRead(id)`, `markAllRead()` |
| `adminApi` | `getDashboard()`, `getUsers()` |

All user-scoped endpoints automatically inject `userId` from localStorage via a `getUserId()` helper.

### 5.5 Utility Functions

**File:** `utils/dateUtils.js`

IST (India Standard Time) timezone-aware date formatting helpers used across Dashboard and Tasks pages:

| Function | Purpose |
|----------|---------|
| `formatDateIST(dateStr, options)` | General-purpose IST date formatting with custom options |
| `formatDateShortIST(dateStr)` | Short format: "Feb 19" |
| `formatDateFullIST(dateStr)` | Full format: "Thu, Feb 19, 2026" |
| `formatDateTimeIST(dateStr)` | Date + time: "Feb 19, 10:30 AM" |
| `todayIST()` | Today's date in `YYYY-MM-DD` format (IST) |
| `nowTimeIST()` | Current time in `HH:mm` format (IST, 24-hour) |
| `plusOneHourIST()` | Current time + 1 hour in `HH:mm` format (IST, 24-hour) |

### 5.6 Page Components

#### Login Page (`pages/Login.jsx`)

- Toggle between **Login** and **Register** modes
- Form fields: Name (register only), Email, Password
- Loading spinner during submission
- Success/error toast notifications
- After login: Admins → `/admin`, Employees → `/`

#### Dashboard Page (`pages/Dashboard.jsx`)

- **4 Stat Cards** with color-coded left borders:
  - Total Tasks (blue)
  - Completed Tasks (green)
  - Pending Tasks (orange)
  - Productivity % (color varies by percentage)
- **Recent Activity** list showing latest 5 task updates with status badges and timestamps

#### Tasks Page (`pages/Tasks.jsx`)

- **Filter bar** — CustomSelect dropdown filters for Status (colored dots), Priority (colored dots), and Category (icons)
- **Task list** — Cards showing title, description, priority badge, status badge, category badge, recurring badge, reminder badge, due date
- **Action buttons** — Complete (checkmark), Edit (pencil), Delete (trash)
- **Export button** — Downloads filtered tasks as .xlsx file
- **Modal form** — Create/Edit tasks with:
  - Title, Description, Priority (CustomSelect with colored dots), Status (edit only, CustomSelect with colored dots), Category (CustomSelect with icons)
  - Due Date (CustomDatePicker calendar)
  - Recurring toggle (Daily / Weekly / Monthly patterns via CustomSelect)
  - Reminder dropdown (No Reminder, 1h/1d/3d before due, Custom date/time)
  - Custom reminder uses separate CustomDatePicker + CustomTimePicker side by side
- **Pagination** — 10 tasks per page with Previous/Next controls
- **Recurring tasks** — Completing a recurring task auto-creates the next occurrence

#### Daily Log Page (`pages/DailyLog.jsx`)

- **Log cards** — Date badge (day/date/month) + content area + hours spent
- **Date badge** — Gradient background showing formatted date
- **Export button** — Downloads all logs as .xlsx
- **Modal form** — Log Date (CustomDatePicker) + Content (textarea) + Hours Spent (number) + From Time / To Time (CustomTimePicker)
- **Pagination** — 10 logs per page
- **Edit/Delete actions** — Per log entry

#### Standup Page (`pages/Standup.jsx`)

- **Auto-generated standup** from recent work data:
  - **Yesterday** — Completed tasks from the previous day, daily log content, hours worked
  - **Today** — Pending/In-Progress tasks, today's daily log content, committed hours
  - **Blockers** — Overdue tasks flagged as potential blockers
- Configurable standup time via CustomTimePicker in settings popover
- Fetches data from `/dashboard/{userId}/standup` endpoint

#### Timesheet Page (`pages/Timesheet.jsx`)

- **Weekly view** — 7-day grid (Monday through Sunday)
- **Daily breakdown** — Hours logged, daily log content, tasks completed that day
- **Week navigation** — Previous/Next week buttons
- **Export button** — Downloads current week's timesheet as .xlsx
- **Summary row** — Total hours for the week
- Fetches data from `/dashboard/{userId}/timesheet?weekStart=` endpoint

#### Notes Page (`pages/Notes.jsx`)

- **Note cards** — Title, content preview, pinned indicator, timestamps
- **Pin/Unpin** — Toggle pin status to keep important notes at top
- **Export button** — Downloads all notes as .xlsx
- **Modal form** — Title + Content (textarea)
- **Edit/Delete actions** — Per note

#### Reports Page (`pages/Reports.jsx`)

- **Weekly Bar Chart** (Recharts) — Daily completed vs total tasks for current week
- **Status Distribution Pie Chart** — Breakdown of Pending / In Progress / Completed
- **Monthly Line Chart** (full width) — Weekly productivity percentage trend
- All three charts load in parallel on mount

#### Admin Dashboard Page (`pages/AdminDashboard.jsx`)

- **6 Stat Cards** — Total Users, Active Today, Active This Week, Total Tasks, Completed Tasks, Overall Productivity %
- **Users Table** — Columns: Name (with avatar initial), Email, Role (badge), Joined Date, Last Login, Task Count
- Role badges styled differently: Admin (purple), Employee (blue)

### 5.7 Layout & Common Components

#### AppLayout (`components/layout/AppLayout.jsx`)

Main authenticated layout — flex container with:
- Fixed sidebar (260px width, full viewport height)
- Scrollable main content area (remaining width, 32px padding)
- Uses React Router `<Outlet />` for nested page rendering

#### Sidebar (`components/layout/Sidebar.jsx`)

- **Brand header** — "DailyTaskVerse" with gradient text + Notification bell
- **Navigation** — Icon + label links with active state highlighting
  - Employees see: Dashboard, Tasks, Daily Log, Standup, Timesheet, Notes, Reports
  - Admins see: Admin Dashboard + all employee items
- **User info** — Avatar (first letter), name, role
- **Theme picker** — 6 colored dots to switch themes
- **Logout button** — Clears auth and redirects to login

#### Modal (`components/common/Modal.jsx`)

Reusable overlay modal:
- Backdrop blur (6px) with dark overlay
- Centered card (max-width 540px)
- Close button (X icon)
- Click-outside-to-close
- Prevents body scroll when open

#### ConfirmDialog (`components/common/ConfirmDialog.jsx`)

Reusable deletion confirmation dialog:
- Warning icon (MdWarningAmber)
- Customizable title and message
- Escape key and click-outside-to-close support
- Delete/Cancel button pair
- Used in Tasks, DailyLog, and Notes pages for delete confirmations

#### CustomSelect (`components/common/CustomSelect.jsx`)

Enhanced dropdown select component (portal-based):
- Full keyboard navigation (arrow keys, enter, escape)
- Type-ahead search (type first letter to jump to matching option)
- Mouse hover support with scroll-into-view
- Checkmark indicator for selected option
- Colored dot indicators and icon support per option
- Portal-based dropdown (`createPortal`) to avoid modal overflow clipping
- `position: fixed` with viewport-relative positioning from `getBoundingClientRect()`
- Auto-repositions on scroll/resize, opens above when insufficient space below
- ARIA attributes for accessibility
- Used in Tasks page for filter dropdowns and form selects (status, priority, category)

#### CustomDatePicker (`components/common/CustomDatePicker.jsx`)

Custom calendar date picker component (portal-based):
- Full calendar UI with month/year navigation (chevron buttons)
- 7×6 day grid with Sunday–Saturday column headers
- Day states: today (accent background), selected (cosmic gradient), other-month (dimmed)
- "Today" quick-select button and "Clear" button in footer
- Accepts/outputs `YYYY-MM-DD` format strings
- Displays formatted date like "Feb 19, 2026" in trigger button
- Syncs view month/year to selected date when opening
- Portal-based dropdown with auto-positioning (opens above/below based on viewport space)
- Click-outside-to-close, Escape key support
- Repositions on scroll/resize while open
- Used in Tasks (due date, custom reminder date) and DailyLog (log date) pages

#### CustomTimePicker (`components/common/CustomTimePicker.jsx`)

Custom three-column time picker component (portal-based):
- Three scrollable columns: Hours (12, 1–11), Minutes (00–55 in 5-min steps), AM/PM
- Current time display at top of dropdown (large, bold, cosmic-primary color)
- Accepts/outputs 24-hour format (`HH:mm`) for API compatibility
- Displays 12-hour format with AM/PM for user-friendliness
- Helper functions: `parse24()` (24h → 12h), `to24()` (12h → 24h), `formatDisplay()`
- Auto-scrolls selected items into view when dropdown opens
- Selected items use cosmic gradient background with box-shadow
- Portal-based dropdown with auto-positioning
- Click-outside-to-close, Escape key support
- Used in Tasks (custom reminder time), DailyLog (from/to time), and Standup (DS time config)

#### NotificationBell (`components/common/NotificationBell.jsx`)

Bell icon in the sidebar header with:
- **Unread count badge** — Red dot with number when unread notifications exist
- **Dropdown panel** — Click toggles an absolute-positioned panel (320px wide, max-height 420px)
- **Notification items** — Title, message, relative time ("2 hours ago"), read/unread styling
- **Mark as read** — Click individual notification to mark as read
- **Mark all read** — Button to mark all notifications as read
- **Polling** — Fetches unread count every 60 seconds
- **Click-outside-to-close** — Uses `useRef` for outside click detection

#### ThemePicker (`components/common/ThemePicker.jsx`)

Row of 6 colored dots in sidebar footer:
- Each dot shows theme's accent color
- Active theme has white ring + glow effect
- Hover scales dot up with color glow
- Click switches theme with smooth 350ms transition

### 5.8 Theming System

The theming system is built on **CSS Custom Properties** (variables) with `data-theme` attribute selectors.

#### How It Works

```
1. All UI colors reference CSS variables:  color: var(--text-primary)
2. Default values are defined in :root     (index.css)
3. Theme overrides use attribute selectors (themes.css):
   [data-theme="ocean"] { --text-primary: #0c4a6e; }
4. ThemeContext sets data-theme on <html>
5. Browser instantly re-renders with new variable values
```

#### Design Token Categories (30+ variables per theme)

| Category | Examples |
|----------|---------|
| **Cosmic palette** | `--cosmic-deepest`, `--cosmic-primary`, `--cosmic-glow`, `--cosmic-star` |
| **Purple accents** | `--purple-deep`, `--purple-mid`, `--purple-light`, `--purple-lightest` |
| **Surfaces** | `--surface-bg`, `--surface-card`, `--surface-hover`, `--surface-muted`, `--surface-border` |
| **Text** | `--text-primary`, `--text-secondary`, `--text-muted`, `--text-on-dark`, `--text-on-dark-muted` |
| **Status** | `--status-success`, `--status-warning`, `--status-info`, `--status-error` (+ bg variants) |
| **Shadows** | `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`, `--shadow-glow` |
| **Gradients** | `--gradient-cosmic-deep`, `--gradient-cosmic-accent`, `--gradient-cosmic-btn` |
| **Accent opacity** | `--accent-bg-subtle`, `--accent-bg-medium`, `--accent-shadow-md`, `--accent-focus-ring` |

#### Dark Theme Considerations

The two dark themes (`cosmic-dark`, `midnight`) additionally set:
- `color-scheme: dark` — Tells the browser to use dark scrollbars, form controls, etc.
- Inverted surface values (dark backgrounds, light text)
- Adjusted shadow opacity (less visible on dark backgrounds)
- Brighter accent colors for contrast

---

## 6. Database Schema

```
┌──────────────────────────────┐
│        AspNetUsers           │    (ASP.NET Identity + Custom Fields)
├──────────────────────────────┤
│ Id              GUID (PK)    │
│ Name            NVARCHAR(200)│
│ Email           NVARCHAR(256)│
│ UserName        NVARCHAR(256)│
│ Role            NVARCHAR(20) │    (Employee | Admin)
│ CreatedAt       DATETIME2    │
│ LastLoginAt     DATETIME2?   │
│ StandupTime     TIME         │    (default 10:00:00)
│ PasswordHash    NVARCHAR(MAX)│
│ + Identity columns...        │
├──────────────────────────────┤
│  1 ──── * Tasks              │
│  1 ──── * DailyLogs          │
│  1 ──── * Notes              │
│  1 ──── * Notifications      │
└──────────────────────────────┘

┌──────────────────────────────┐
│          Tasks               │
├──────────────────────────────┤
│ Id              GUID (PK)    │    (NEWSEQUENTIALID)
│ Title           NVARCHAR(500)│
│ Description     NVARCHAR(4000)│
│ Priority        NVARCHAR(20) │    (Low | Medium | High)
│ Status          NVARCHAR(20) │    (Pending | InProgress | Completed)
│ Category        NVARCHAR(50) │
│ IsRecurring     BIT          │
│ RecurrencePattern NVARCHAR(20)│   (Daily | Weekly | Monthly)
│ DueDate         DATETIME2?   │
│ ReminderAt      DATETIME2?   │
│ CreatedAt       DATETIME2    │
│ UpdatedAt       DATETIME2    │
│ UserId          GUID (FK)    │    → AspNetUsers.Id (CASCADE DELETE)
├──────────────────────────────┤
│ INDEX: IX_Tasks_UserId       │
│ INDEX: IX_Tasks_Status       │
└──────────────────────────────┘

┌──────────────────────────────┐
│        DailyLogs             │
├──────────────────────────────┤
│ Id              GUID (PK)    │    (NEWSEQUENTIALID)
│ LogDate         DATE         │
│ Content         NVARCHAR(MAX)│
│ HoursSpent      DECIMAL?     │
│ FromTime        TIME?        │
│ ToTime          TIME?        │
│ CreatedAt       DATETIME2    │
│ UserId          GUID (FK)    │    → AspNetUsers.Id (CASCADE DELETE)
├──────────────────────────────┤
│ INDEX: IX_DailyLogs_UserId   │
│ INDEX: IX_DailyLogs_LogDate  │
└──────────────────────────────┘

┌──────────────────────────────┐
│          Notes               │
├──────────────────────────────┤
│ Id              GUID (PK)    │    (NEWSEQUENTIALID)
│ Title           NVARCHAR(200)│
│ Content         NVARCHAR(MAX)│
│ IsPinned        BIT          │
│ CreatedAt       DATETIME2    │
│ UpdatedAt       DATETIME2    │
│ UserId          GUID (FK)    │    → AspNetUsers.Id (CASCADE DELETE)
├──────────────────────────────┤
│ INDEX: IX_Notes_UserId       │
└──────────────────────────────┘

┌──────────────────────────────┐
│       Notifications          │
├──────────────────────────────┤
│ Id              GUID (PK)    │    (NEWSEQUENTIALID)
│ Title           NVARCHAR(200)│
│ Message         NVARCHAR(1000)│
│ Type            NVARCHAR(50) │    (TaskOverdue | TaskDueSoon | Reminder)
│ IsRead          BIT          │
│ CreatedAt       DATETIME2    │
│ UserId          GUID (FK)    │    → AspNetUsers.Id (CASCADE DELETE)
│ TaskId          GUID? (FK)   │    → Tasks.Id (NO ACTION)
├──────────────────────────────┤
│ INDEX: IX_Notifications_     │
│        UserId_IsRead         │
└──────────────────────────────┘
```

Additional ASP.NET Identity tables: `AspNetRoles`, `AspNetUserRoles`, `AspNetUserClaims`, `AspNetUserLogins`, `AspNetUserTokens`, `AspNetRoleClaims`

---

## 7. API Endpoints Reference

### Authentication
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/login` | `{ email, password }` | `{ user: { id, name, email, role } }` |
| POST | `/api/auth/register` | `{ name, email, password }` | `{ user: { id, name, email, role } }` |

### Tasks (User-Scoped)
| Method | Endpoint | Query/Body | Response |
|--------|----------|------------|----------|
| GET | `/api/task/{userId}` | `?status=&priority=&category=&page=1&pageSize=10` | `{ items, totalCount, page, pageSize }` |
| GET | `/api/task/{userId}/{id}` | — | `TaskDto` |
| POST | `/api/task/{userId}` | `{ title, description, priority, category, dueDate, isRecurring, recurrencePattern, reminderAt }` | `TaskDto` (201) |
| PUT | `/api/task/{userId}/{id}` | `{ title, description, priority, status, category, dueDate, isRecurring, recurrencePattern, reminderAt }` | `TaskDto` |
| PATCH | `/api/task/{userId}/{id}/complete` | — | `TaskDto` |
| DELETE | `/api/task/{userId}/{id}` | — | 204 |

### Daily Logs (User-Scoped)
| Method | Endpoint | Query/Body | Response |
|--------|----------|------------|----------|
| GET | `/api/dailylog/{userId}` | `?page=1&pageSize=10` | `{ items, totalCount, page, pageSize }` |
| GET | `/api/dailylog/{userId}/{id}` | — | `DailyLogDto` |
| POST | `/api/dailylog/{userId}` | `{ logDate, content, hoursSpent, fromTime, toTime }` | `DailyLogDto` (201) |
| PUT | `/api/dailylog/{userId}/{id}` | `{ content, hoursSpent, fromTime, toTime }` | `DailyLogDto` |
| DELETE | `/api/dailylog/{userId}/{id}` | — | 204 |

### Notes (User-Scoped)
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/note/{userId}` | — | `List<NoteDto>` |
| GET | `/api/note/{userId}/{id}` | — | `NoteDto` |
| POST | `/api/note/{userId}` | `{ title, content, isPinned }` | `NoteDto` (201) |
| PUT | `/api/note/{userId}/{id}` | `{ title, content, isPinned }` | `NoteDto` |
| DELETE | `/api/note/{userId}/{id}` | — | 204 |

### Dashboard (User-Scoped)
| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/api/dashboard/{userId}` | `{ totalTasks, completedTasks, pendingTasks, inProgressTasks, productivityPercentage, recentActivity }` |
| GET | `/api/dashboard/{userId}/weekly-report` | `{ dailyStats: [{ date, completed, total }] }` |
| GET | `/api/dashboard/{userId}/monthly-report` | `{ weeklyStats: [{ week, completed, total, productivityPercentage }] }` |
| GET | `/api/dashboard/{userId}/status-distribution` | `[{ status, count }]` |
| GET | `/api/dashboard/{userId}/standup` | `StandupDto` |
| GET | `/api/dashboard/{userId}/timesheet?weekStart=` | `TimesheetDto` |

### Export (User-Scoped)
| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/api/export/{userId}/tasks?status=&priority=&category=` | `tasks_{date}.xlsx` |
| GET | `/api/export/{userId}/daily-logs` | `daily_logs_{date}.xlsx` |
| GET | `/api/export/{userId}/timesheet?weekStart=` | `timesheet_{date}.xlsx` |
| GET | `/api/export/{userId}/notes` | `notes_{date}.xlsx` |

### Notifications (User-Scoped)
| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/api/notification/{userId}` | `List<NotificationDto>` (latest 50) |
| GET | `/api/notification/{userId}/unread-count` | `{ count: N }` |
| PATCH | `/api/notification/{userId}/{id}/read` | 204 |
| PATCH | `/api/notification/{userId}/read-all` | 204 |

### Admin
| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/api/admin/dashboard` | `{ totalUsers, activeToday, activeThisWeek, totalTasks, completedTasks, overallProductivity }` |
| GET | `/api/admin/users` | `[{ id, name, email, role, createdAt, lastLoginAt, taskCount }]` |

---

## 8. Application Workflows

### User Authentication Flow

```
User                    Frontend                   Backend                    Database
 │                         │                          │                          │
 ├─ Enter credentials ────►│                          │                          │
 │                         ├─ POST /auth/login ──────►│                          │
 │                         │                          ├─ UserManager.FindByEmail─►│
 │                         │                          │◄─ User record ───────────┤
 │                         │                          ├─ Check password hash     │
 │                         │                          ├─ Update LastLoginAt ────►│
 │                         │◄─ AuthResponse (UserDto)─┤                          │
 │                         ├─ Store user in localStorage                         │
 │                         ├─ Set axios userId         │                          │
 │◄─ Redirect to dashboard─┤                          │                          │
```

### Task Management Flow

```
User                    Frontend                   Backend                    Database
 │                         │                          │                          │
 ├─ Click "Add Task" ─────►│                          │                          │
 │◄─ Show modal form ──────┤                          │                          │
 ├─ Fill form, submit ────►│                          │                          │
 │                         ├─ POST /task/{userId} ───►│                          │
 │                         │                          ├─ Validate request        │
 │                         │                          ├─ Create TaskItem ───────►│
 │                         │                          │◄─ Saved task ────────────┤
 │                         │◄─ TaskDto ───────────────┤                          │
 │                         ├─ Close modal              │                          │
 │                         ├─ Refresh task list        │                          │
 │◄─ Show success toast ───┤                          │                          │
```

### Recurring Task Completion Flow

```
User                    Frontend                   Backend                    Database
 │                         │                          │                          │
 ├─ Click "Complete" ─────►│                          │                          │
 │                         ├─ PATCH .../complete ────►│                          │
 │                         │                          ├─ Mark task Completed ───►│
 │                         │                          ├─ IsRecurring? Yes        │
 │                         │                          ├─ Calculate next due date │
 │                         │                          ├─ Create new TaskItem ───►│
 │                         │◄─ Completed TaskDto ─────┤                          │
 │                         ├─ Refresh task list        │                          │
 │◄─ New task appears ─────┤                          │                          │
```

### Notification & Reminder Flow

```
Background Service                    Database                    Frontend
       │                                 │                          │
       ├─ Every 30 min: Check overdue    │                          │
       ├─ Query overdue tasks ──────────►│                          │
       │◄─ Overdue tasks list ───────────┤                          │
       ├─ Check if already notified ────►│                          │
       ├─ Create Notification ──────────►│                          │
       │                                 │                          │
       ├─ Every 5 min: Check reminders   │                          │
       ├─ Query tasks with ReminderAt ──►│                          │
       │◄─ Due reminders list ───────────┤                          │
       ├─ Create Notification ──────────►│                          │
       ├─ Clear ReminderAt on task ─────►│                          │
       │                                 │                          │
       │                                 │    Every 60 sec: Poll ───┤
       │                                 │◄─ GET /unread-count ─────┤
       │                                 ├─ { count: N } ──────────►│
       │                                 │                          ├─ Show badge on bell
       │                                 │                          │
       │                                 │    User clicks bell ─────┤
       │                                 │◄─ GET /notification ─────┤
       │                                 ├─ Notification list ─────►│
       │                                 │                          ├─ Show dropdown
```

### Export to Excel Flow

```
User                    Frontend                   Backend                    Database
 │                         │                          │                          │
 ├─ Click "Export" ───────►│                          │                          │
 │                         ├─ GET /export/.../tasks ─►│                          │
 │                         │  (responseType: blob)     ├─ Query filtered tasks ──►│
 │                         │                          │◄─ Task list ─────────────┤
 │                         │                          ├─ Build XLWorkbook        │
 │                         │                          ├─ Style headers, rows     │
 │                         │                          ├─ Auto-fit columns        │
 │                         │◄─ .xlsx file bytes ──────┤                          │
 │                         ├─ Create Blob + URL        │                          │
 │                         ├─ Trigger download         │                          │
 │◄─ tasks_20260214.xlsx ──┤                          │                          │
```

### Theme Switching Flow

```
User                    Frontend                               Browser
 │                         │                                      │
 ├─ Click theme dot ──────►│                                      │
 │                         ├─ setTheme("ocean")                   │
 │                         ├─ Add .theme-transitioning to <html>  │
 │                         ├─ Set data-theme="ocean" on <html> ──►│
 │                         │                                      ├─ CSS [data-theme="ocean"]
 │                         │                                      │   overrides all variables
 │                         │                                      ├─ Smooth 350ms transition
 │                         ├─ Save "ocean" to localStorage        │
 │                         ├─ Remove .theme-transitioning (400ms) │
 │◄─ UI fully transitioned─┤                                      │
```

### Dashboard Analytics Flow

```
Frontend                       Backend                         Database
   │                              │                                │
   ├─ GET /dashboard/{userId} ───►│                                │
   │                              ├─ Get completed count (week) ──►│
   │                              ├─ Get total count (week) ──────►│
   │                              ├─ Get status distribution ─────►│
   │                              ├─ Get recent 5 tasks ──────────►│
   │                              ├─ Calculate productivity %      │
   │◄─ DashboardDto ─────────────┤                                │
   ├─ Render 4 stat cards         │                                │
   ├─ Render recent activity list │                                │
```

---

## 9. Running the Project

### Prerequisites

| Requirement | Version |
|-------------|---------|
| .NET SDK | 9.0.308+ |
| Node.js | 18+ (LTS recommended) |
| SQL Server | Any edition (LocalDB, Express, or full) |

### Quick Start

**Option A: Run both together**
```bash
# From project root
scripts\run-all.bat
```
This opens two terminal windows — one for API, one for UI.

**Option B: Run separately**

Terminal 1 — API:
```bash
scripts\run-api.bat
# Or manually:
set "MSBuildSDKsPath=C:\Program Files\dotnet\sdk\9.0.308\Sdks"
dotnet run --project DailyTaskVerse.API --launch-profile http
```

Terminal 2 — UI:
```bash
scripts\run-ui.bat
# Or manually:
cd dailytaskverse-client
npm run dev
```

### Access Points

| Service | URL |
|---------|-----|
| React UI | http://localhost:5173 |
| API | http://localhost:5246 |
| Swagger UI | http://localhost:5246/swagger |

### Database Setup

The database is created automatically via EF Core on first run. To apply migrations manually:

```bash
set "MSBuildSDKsPath=C:\Program Files\dotnet\sdk\9.0.308\Sdks"
dotnet ef database update --project DailyTaskVerse.Infrastructure --startup-project DailyTaskVerse.API
```

The admin user (`admin@dailytaskverse.com` / `Admin@123`) is seeded automatically on startup.

### Frontend Dependencies

```bash
cd dailytaskverse-client
npm install
```

---

## 10. Configuration Reference

### Backend Configuration

**`appsettings.json`**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DailyTaskVerse;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173"]
  }
}
```

**`appsettings.Development.json`** — Overrides connection string for development SQL Server instance.

**Identity Password Rules** (configured in `Program.cs`):
- Minimum length: 6
- Require digit: Yes
- Require lowercase: Yes
- Require uppercase: Yes
- Require non-alphanumeric: No

**Background Service Intervals** (configured in respective service classes):
- Overdue task checker: Every 30 minutes
- Reminder checker: Every 5 minutes

### Frontend Configuration

**Environment Variables** (via Vite):
- `VITE_API_URL` — API base URL (defaults to `http://localhost:5246/api`)

**localStorage Keys:**
- `dtv-user` — Serialized user object `{ id, name, email, role }`
- `dtv-theme` — Active theme ID (e.g., `cosmic-light`, `ocean`, `midnight`)

### Build SDK Configuration

**`global.json`** — Pins .NET SDK to version `9.0.308` with `latestMinor` roll-forward.

**`Directory.Build.props`** — Sets `MSBuildSDKsPath` to ensure correct SDK path on Windows.

---

*This walkthrough covers the complete DailyTaskVerse application as of February 2026.*
