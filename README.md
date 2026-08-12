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
