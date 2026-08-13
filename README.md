# Fli OS

Fli OS is the business operating system for the Fli Disc Golf League.

## Purpose

Fli OS provides role- and department-specific workflows for managing league operations while reducing complexity for individual users.

Users interact with workflows appropriate to their responsibilities, while the system maintains consistent data, naming, approvals, budgets, and operational records.

## Technology

- SvelteKit
- TypeScript
- Tailwind CSS
- shadcn-svelte
- PocketBase
- Railway
- GitHub Codespaces

## Architecture

Fli OS follows a domain-oriented, object-oriented architecture.

```text
UI
↓
Controllers
↓
Services
↓
Repository Interfaces
↓
PocketBase Repository Adapters
↓
PocketBaseProvider
↓
PocketBase
```

## Current Domains

### Organization

Represents an organization operating within Fli OS.

### Users

Authenticated Fli OS users belonging to an organization.

### Roles

Organization-scoped roles containing explicit permissions.

### Departments

Organization-scoped operational departments.

### Projects and Tasks

The first completed operational workflow is centered on project management:

- Create Project
- Open Project
- Add Task
- Assign User
- Update Task Status

This layer is fully wired from the Svelte UI through the controller, service, repository interface, PocketBase adapter, and the Railway-hosted PocketBase backend.

## Authentication & Authorization

Authentication identity is resolved through `AuthContext`.

Authorization is permission-based through `AuthorizationService`.

Fli OS intentionally avoids hardcoded role checks such as `isAdmin()` or `isManager()`.

> Repositories answer how data is stored and retrieved. Services answer whether an operation is valid. Authorization answers whether the current actor may perform it.

## Current Development Status

### Completed

- Project foundation
- SvelteKit and TypeScript architecture
- PocketBase integration
- AppContainer dependency composition
- Organization domain
- User domain
- Role and permission domain
- Department domain
- Repository interfaces
- PocketBase repository adapters
- Domain services
- Authentication context
- Authorization service
- Organization-scoped validation
- Department-scoped validation
- Project and task workflow
- Create Project → Open Project → Add Task → Assign User → Update Task Status
- Authenticated route protection
- Permission-aware navigation

### Next Recommendation

The next business slice should extend the project/task workflow into procurement, likely:

- Bid Request
- Bid
- Bid Selection

This naturally expands from the existing `BID_REQUIRED` task type already modeled in the task domain.

### Planned

- Work orders and approvals
- Department budgets
- League financial management
- Seasons and tournaments
- Teams and professional players
- Tournament payouts
- Sponsors and revenue
- Vendor bidding
- Broadcasting
- Contracts
- Ticketing
- Merchandise
- Reporting and audit history

## Development

```sh
npm install
npm run dev
```

## Production Build

```sh
npm run build
```

## Project Notes

This repository is intentionally structured around domain-first design and service validation before controller/UI expansion. The application is still in early product-building phases, but the foundational architecture is already established and is designed to support growth without coupling the UI directly to storage or authorization logic.

> Every persisted Fli OS domain change must include a committed PocketBase migration.
>
> Phase 2 constraint-enforcement migrations are intentionally staged outside the active PocketBase migration directory until production data has been backed up, backfilled, and verified.
>
> Never move a staged constraint migration into the active PocketBase migration directory until the prerequisite data migration/backfill has been independently verified.

## PocketBase Migration Checkpoint

Current stop point for the rehearsal migration work:

- Phase 1 remains the active migration in [pb_migrations/1755030000_create_fli_os_core_collections.js](pb_migrations/1755030000_create_fli_os_core_collections.js).
- Phase 2 is intentionally parked in [migration_staging/1755030100_require_user_organization.js](migration_staging/1755030100_require_user_organization.js) and has not been moved into the active migration directory.
- The fresh rehearsal copy of the live Railway data exists in `/tmp/fli-os-rehearsal/pb_data` and is the only environment being used for migration verification.
- The current blocker is the runtime migration error: `failed to apply migration ... name: cannot be blank`.
- We have not tested login, have not touched live data, and have not backfilled or changed any user organization assignments.

Required next step for tomorrow:

1. Instrument the `$app.save(...)` calls in [pb_migrations/1755030000_create_fli_os_core_collections.js](pb_migrations/1755030000_create_fli_os_core_collections.js) to identify exactly which save emits the blank `name` validation error.
2. Re-run the migration against the fresh rehearsal copy only.
3. Fix the single mutation/save path responsible for the invalid collection field or collection object state.
4. Restore another clean rehearsal copy before re-testing.
5. Verify the migration succeeds, PocketBase starts cleanly, exactly six collections exist, and an existing user login still works.
6. Only after that, create/verify the Fli organization, backfill `users.organization`, and confirm every user has a valid organization before enabling the required Phase 2 constraint.

This is the clean checkpoint for tomorrow: Phase 1 applied ✓ → Six collections present ← NEXT → Existing user login works → Then backfill organization → Then make organization required in Phase 2.
