# ScholarPath Mobile — Project Structure

One Expo app with two roles: **Student** and **Institute (Instansi)**. Code is grouped by role where it makes sense, with shared layers for auth, theme, and cross-role data (e.g. applications).

## Quick map

| What you need | Where to look |
|---------------|---------------|
| Student tabs & routes | `app/(tabs)/` |
| Institute tabs & routes | `app/(institute-tabs)/` |
| Login / Register | `app/(auth)/` + `src/features/auth/` |
| Student UI & logic | `src/features/student/` |
| Institute UI & logic | `src/features/institute/` |
| Student session & notifications | `src/context/student/` |
| Institute session & team | `src/context/institute/` |
| Application status (both roles) | `src/context/shared/ApplicationContext.tsx` |
| Shared types (program, auth, application) | `src/types/shared/` |
| Student types | `src/types/student/` |
| Institute types | `src/types/institute/` |
| Colors, fonts, typography | `src/theme/` |

## Routes (`app/`)

```
app/
├── (auth)/              # login, register, student profile setup
├── (tabs)/              # student main tabs: home, explore, ai, application, profile
├── (institute-tabs)/    # institute tabs: dashboard, programs, applicants, alerts, profile
├── program/[id]         # student program detail
├── program-register/    # student apply flow
├── track-application    # student track applications
├── notifications        # student notifications
├── wishlist, edit-profile, ai-recommendation
└── institute-*          # institute stack screens (settings, edit profile, applicant detail, …)
```

## Features (`src/features/`)

```
features/
├── auth/                # shared — login, register, role selector
├── institute/           # institute-only screens, components, constants
└── student/
    ├── home/            # home tab, tab bar, top bar
    ├── explore/         # browse programs
    ├── program/         # program detail & registration
    ├── application/     # active programs & track application
    ├── profile/         # profile setup, view, edit
    ├── notifications/   # student notification list
    ├── wishlist/
    ├── ai/                # AI hub tab
    └── ai-recommendation/ # recommendation wizard
```

## Context (`src/context/`)

```
context/
├── shared/
│   └── ApplicationContext.tsx    # registrations, accept/reject sync student ↔ institute
├── student/
│   ├── StudentSessionContext.tsx
│   ├── NotificationContext.tsx
│   └── WishlistContext.tsx
└── institute/
    ├── InstituteSessionContext.tsx
    ├── InstituteApplicantsContext.tsx
    ├── InstituteNotificationContext.tsx
    └── InstituteTeamContext.tsx
```

## Types (`src/types/`)

```
types/
├── shared/     # application, auth, program, program-registration
├── student/    # student-session, notification, ai-recommendation
└── institute/  # institute, institute-notification
```

## Cross-role flows

- **Institute accepts/rejects applicant** → `InstituteApplicantsContext` + `ApplicationContext.updateRegistrationStatus` → student sees update on **Track Application** and **Notifications**.
- **Shared program data** → student uses `student/explore` and `student/program`; institute uses `institute/constants/institute-programs` (mock data today).

## Conventions

- Institute components/screens are prefixed with `Institute*` where helpful.
- Student screens are prefixed with `Student*` where helpful.
- Prefer `@/src/...` path aliases over relative imports across feature boundaries.
