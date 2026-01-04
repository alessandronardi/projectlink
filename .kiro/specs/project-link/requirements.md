# Requirements Document

## Introduction

ProjectLink is a SaaS application designed for a single freelancer to manage client requests via shared Kanban boards. The system enables clients to access projects through public links (slugs) without authentication, where they can view tickets and create new requests. Only the authenticated freelancer (admin) can modify ticket statuses and manage projects. The application features a clean, Stripe-like Italian interface with real-time updates and email notifications.

## Glossary

- **Admin**: The authenticated freelancer who owns and manages all projects
- **Client**: An unauthenticated user who accesses projects via public portal links
- **Project**: A container for tickets, identified by a unique slug
- **Ticket**: A client request with title, description, status, and priority
- **Slug**: A secure random string used to create public portal URLs (e.g., "abc123xyz")
- **Kanban Board**: A visual board with columns representing ticket statuses
- **Portal**: The public-facing view of a project accessible without authentication
- **RLS (Row Level Security)**: Supabase security policies controlling data access

## Requirements

### Requirement 1: Project Management

**User Story:** As an admin, I want to create and manage projects, so that I can organize client requests into separate workspaces.

#### Acceptance Criteria

1. WHEN an admin clicks "Crea Nuovo Progetto" THEN the System SHALL create a new project with an auto-generated unique slug
2. WHEN an admin views the dashboard THEN the System SHALL display a list of all projects owned by the admin with ticket counts per project
3. WHEN a project is created THEN the System SHALL generate a secure random slug that is unique across all projects
4. WHEN an admin selects a project from the dashboard THEN the System SHALL navigate to the admin Kanban board for that project

### Requirement 2: Admin Kanban Board

**User Story:** As an admin, I want to view and manage tickets on a Kanban board, so that I can track and update the status of client requests.

#### Acceptance Criteria

1. WHEN an admin views the Kanban board THEN the System SHALL display tickets in three columns: "Da Fare", "In Lavorazione", "Completato"
2. WHEN an admin drags a ticket to a different column THEN the System SHALL update the ticket status to match the target column
3. WHEN an admin views a ticket THEN the System SHALL display the ticket title, description, priority, and creation date
4. WHEN an admin adds a comment to a ticket THEN the System SHALL save the comment with is_admin flag set to true
5. WHEN ticket data changes THEN the System SHALL reflect updates in real-time without page refresh

### Requirement 3: Public Portal Access

**User Story:** As a client, I want to access a project via a public link, so that I can view my requests and submit new ones without creating an account.

#### Acceptance Criteria

1. WHEN a client navigates to /portal/[slug] THEN the System SHALL display all tickets for that project grouped by status
2. WHEN a client clicks "Nuova Richiesta" THEN the System SHALL display a modal form for creating a new ticket
3. WHEN a client submits a new ticket THEN the System SHALL create the ticket with status "todo" and the specified priority
4. WHEN a client adds a comment THEN the System SHALL save the comment with is_admin flag set to false and require author_name
5. WHEN ticket or comment data changes THEN the System SHALL update the portal view in real-time using Supabase Realtime

### Requirement 4: Ticket Creation and Validation

**User Story:** As a client, I want to create detailed requests with priority levels, so that the freelancer understands the urgency and scope of my needs.

#### Acceptance Criteria

1. WHEN a client creates a ticket THEN the System SHALL require a non-empty title
2. WHEN a client creates a ticket THEN the System SHALL allow an optional description field
3. WHEN a client creates a ticket THEN the System SHALL require selection of priority: "low", "medium", or "high"
4. WHEN a ticket is created THEN the System SHALL set created_at and updated_at timestamps automatically
5. WHEN a ticket status changes THEN the System SHALL update the updated_at timestamp

### Requirement 5: Comment System

**User Story:** As a user (admin or client), I want to add comments to tickets, so that I can communicate about specific requests.

#### Acceptance Criteria

1. WHEN a comment is created THEN the System SHALL associate it with the correct ticket_id
2. WHEN a client creates a comment THEN the System SHALL require an author_name field
3. WHEN an admin creates a comment THEN the System SHALL use the admin's identity and set is_admin to true
4. WHEN comments are displayed THEN the System SHALL show them in chronological order with author name and timestamp
5. WHEN a comment is created THEN the System SHALL visually distinguish admin comments from client comments

### Requirement 6: Email Notifications

**User Story:** As an admin, I want to receive email notifications for new tickets, so that I can respond to client requests promptly.

#### Acceptance Criteria

1. WHEN a new ticket is created THEN the System SHALL send an email notification to the configured ADMIN_EMAIL
2. WHEN sending a notification email THEN the System SHALL include ticket title, description, priority, and a link to the dashboard
3. WHEN the email service is unavailable THEN the System SHALL log the error and continue ticket creation without blocking
4. WHEN sending emails THEN the System SHALL use HTML templates with proper formatting

### Requirement 7: Row Level Security

**User Story:** As a system administrator, I want proper data access controls, so that users can only perform authorized actions.

#### Acceptance Criteria

1. WHEN an authenticated admin queries projects THEN the System SHALL return only projects where user_id matches the admin's ID
2. WHEN an unauthenticated user queries tickets THEN the System SHALL allow read access to all tickets in public projects
3. WHEN an unauthenticated user attempts to update ticket status THEN the System SHALL reject the operation
4. WHEN an unauthenticated user creates a ticket THEN the System SHALL allow the insert operation
5. WHEN an unauthenticated user creates a comment THEN the System SHALL allow the insert operation with is_admin set to false

### Requirement 8: User Interface Design

**User Story:** As a user, I want a clean and responsive interface, so that I can use the application comfortably on any device.

#### Acceptance Criteria

1. WHEN displaying ticket status badges THEN the System SHALL use distinct colors: slate for "Da Fare", blue for "In Lavorazione", green for "Completato"
2. WHEN displaying priority badges THEN the System SHALL use distinct colors: gray for "Bassa", yellow for "Media", red for "Alta"
3. WHEN the viewport width changes THEN the System SHALL adapt the layout responsively for mobile and desktop
4. WHEN interactive elements are rendered THEN the System SHALL include appropriate ARIA labels for accessibility
5. WHEN displaying the interface THEN the System SHALL use Italian labels throughout the application

### Requirement 9: Data Persistence and Serialization

**User Story:** As a developer, I want reliable data storage and retrieval, so that the application maintains data integrity.

#### Acceptance Criteria

1. WHEN storing ticket data THEN the System SHALL serialize it to the PostgreSQL database via Supabase
2. WHEN retrieving ticket data THEN the System SHALL deserialize it from the database and validate the structure
3. WHEN a ticket is serialized and then deserialized THEN the System SHALL produce an equivalent ticket object
4. WHEN a project is serialized and then deserialized THEN the System SHALL produce an equivalent project object
5. WHEN a comment is serialized and then deserialized THEN the System SHALL produce an equivalent comment object

### Requirement 10: Authentication and Authorization

**User Story:** As an admin, I want secure access to the dashboard, so that only I can manage projects and change ticket statuses.

#### Acceptance Criteria

1. WHEN an unauthenticated user accesses /dashboard THEN the System SHALL redirect to the login page
2. WHEN an unauthenticated user accesses /dashboard/[projectId] THEN the System SHALL redirect to the login page
3. WHEN an admin successfully authenticates THEN the System SHALL grant access to the dashboard and admin Kanban views
4. WHEN an admin session expires THEN the System SHALL require re-authentication before allowing protected actions
