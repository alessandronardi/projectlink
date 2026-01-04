# Implementation Plan

- [x] 1. Set up project foundation and database schema






  - [x] 1.1 Initialize Next.js 14+ project with TypeScript, Tailwind CSS, and Shadcn/UI

    - Configure App Router structure
    - Install dependencies: @supabase/supabase-js, @supabase/ssr, lucide-react, resend
    - Set up environment variables template
    - _Requirements: 8.3, 8.5_

  - [x] 1.2 Create Supabase client utilities

    - Implement `utils/supabase/server.ts` with createClient and createServiceClient
    - Implement `utils/supabase/client.ts` for browser-side client
    - Implement `utils/supabase/middleware.ts` for auth session handling
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 1.3 Create database schema SQL and RLS policies

    - Write complete SQL for projects, tickets, comments tables
    - Implement RLS policies for admin CRUD and public read/insert
    - Create indexes for performance
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 2. Implement TypeScript types and validation utilities






  - [x] 2.1 Create TypeScript type definitions

    - Define Project, Ticket, Comment interfaces in `types/database.ts`
    - Define TicketStatus and TicketPriority union types
    - Define input types for create operations
    - _Requirements: 9.1, 9.2_
  - [x] 2.2 Write property test for ticket round-trip serialization


    - **Property 16: Ticket Round-Trip Serialization**
    - **Validates: Requirements 9.3**

  - [x] 2.3 Write property test for project round-trip serialization

    - **Property 17: Project Round-Trip Serialization**
    - **Validates: Requirements 9.4**

  - [x] 2.4 Write property test for comment round-trip serialization

    - **Property 18: Comment Round-Trip Serialization**
    - **Validates: Requirements 9.5**
  - [x] 2.5 Implement validation utilities


    - Create `lib/validation.ts` with title, priority, author_name validators
    - Implement slug generation function with uniqueness check
    - _Requirements: 4.1, 4.3, 5.2, 1.3_

  - [x] 2.6 Write property test for slug uniqueness

    - **Property 1: Slug Uniqueness**
    - **Validates: Requirements 1.1, 1.3**

  - [x] 2.7 Write property test for ticket title validation

    - **Property 8: Ticket Title Validation**
    - **Validates: Requirements 4.1**

  - [x] 2.8 Write property test for priority validation

    - **Property 9: Priority Validation**
    - **Validates: Requirements 4.3**

- [x] 3. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement data access layer





  - [x] 4.1 Create project service


    - Implement `lib/projects.ts` with getProjects, getProjectById, getProjectBySlug, createProject
    - Include ticket count aggregation in getProjects
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 4.2 Write property test for project ownership filtering


    - **Property 2: Project Ownership Filtering**
    - **Validates: Requirements 1.2, 7.1**
  - [x] 4.3 Create ticket service


    - Implement `lib/tickets.ts` with getTicketsByProject, getTicketById, createTicket, updateTicketStatus
    - Ensure new tickets default to "todo" status
    - Handle timestamp updates on status change
    - _Requirements: 2.2, 3.1, 3.3, 4.4, 4.5_
  - [x] 4.4 Write property test for new ticket default status


    - **Property 6: New Ticket Default Status**
    - **Validates: Requirements 3.3**
  - [x] 4.5 Write property test for ticket status update persistence


    - **Property 3: Ticket Status Update Persistence**
    - **Validates: Requirements 2.2, 4.5**
  - [x] 4.6 Write property test for ticket timestamp initialization


    - **Property 10: Ticket Timestamp Initialization**
    - **Validates: Requirements 4.4**
  - [x] 4.7 Write property test for tickets by slug retrieval


    - **Property 5: Tickets By Slug Retrieval**
    - **Validates: Requirements 3.1**
  - [x] 4.8 Create comment service


    - Implement `lib/comments.ts` with getCommentsByTicket, createComment
    - Ensure chronological ordering
    - Validate author_name for client comments
    - _Requirements: 5.1, 5.2, 5.4_
  - [x] 4.9 Write property test for comment-ticket association


    - **Property 11: Comment-Ticket Association**
    - **Validates: Requirements 5.1**
  - [x] 4.10 Write property test for comment chronological order


    - **Property 12: Comment Chronological Order**
    - **Validates: Requirements 5.4**
  - [x] 4.11 Write property test for admin comment flag


    - **Property 4: Admin Comment Flag**
    - **Validates: Requirements 2.4, 5.3**
  - [x] 4.12 Write property test for client comment constraints


    - **Property 7: Client Comment Constraints**
    - **Validates: Requirements 3.4, 5.2, 7.5**

- [x] 5. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement authentication and middleware





  - [x] 6.1 Create authentication middleware


    - Implement `middleware.ts` for route protection
    - Redirect unauthenticated users from /dashboard/* to login
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  - [x] 6.2 Create login page


    - Implement `app/login/page.tsx` with Supabase Auth UI
    - Handle redirect after successful login
    - _Requirements: 10.3_

- [x] 7. Implement admin dashboard





  - [x] 7.1 Create dashboard layout


    - Implement `app/dashboard/layout.tsx` with navigation
    - Add Italian labels and responsive design
    - _Requirements: 8.3, 8.5_
  - [x] 7.2 Create project list page


    - Implement `app/dashboard/page.tsx` with project cards
    - Display ticket counts per project
    - Add "Crea Nuovo Progetto" button with modal
    - _Requirements: 1.2, 1.4_

  - [x] 7.3 Create ProjectCard component

    - Implement `components/projects/ProjectCard.tsx`
    - Display project name, slug, ticket count
    - Link to admin Kanban board
    - _Requirements: 1.2, 1.4_

  - [x] 7.4 Create NewProjectModal component

    - Implement `components/projects/NewProjectModal.tsx`
    - Form for project name input
    - Auto-generate slug on creation
    - _Requirements: 1.1, 1.3_

- [x] 8. Implement Kanban board components

  - [x] 8.1 Create KanbanBoard component
    - Implement `components/kanban/KanbanBoard.tsx`
    - Three columns: "Da Fare", "In Lavorazione", "Completato"
    - Support drag and drop for admin
    - _Requirements: 2.1, 2.2_

  - [x] 8.2 Create KanbanColumn component
    - Implement `components/kanban/KanbanColumn.tsx`
    - Display tickets filtered by status
    - Apply status-specific styling
    - _Requirements: 2.1, 8.1_

  - [x] 8.3 Create TicketCard component
    - Implement `components/kanban/TicketCard.tsx`
    - Display title, priority badge, creation date
    - Draggable for admin, clickable for details
    - _Requirements: 2.3, 8.2_

  - [x] 8.4 Create admin Kanban page

    - Implement `app/dashboard/[projectId]/page.tsx`
    - Fetch project and tickets
    - Handle drag and drop status updates
    - _Requirements: 2.1, 2.2, 2.5_

- [x] 9. Implement ticket detail and comments



  - [x] 9.1 Create TicketModal component


    - Implement `components/tickets/TicketModal.tsx`
    - Display full ticket details
    - Include comment section
    - _Requirements: 2.3, 5.4, 5.5_

  - [x] 9.2 Create CommentList component

    - Implement `components/comments/CommentList.tsx`
    - Display comments in chronological order
    - Visually distinguish admin vs client comments
    - _Requirements: 5.4, 5.5_
  - [x] 9.3 Create CommentForm component



    - Implement `components/comments/CommentForm.tsx`
    - Admin: no author_name field, is_admin=true
    - Client: require author_name, is_admin=false
    - _Requirements: 2.4, 3.4, 5.2, 5.3_

- [x] 10. Implement public portal





  - [x] 10.1 Create public portal page


    - Implement `app/portal/[slug]/page.tsx`
    - Fetch project by slug
    - Display tickets grouped by status (read-only Kanban)
    - _Requirements: 3.1_

  - [x] 10.2 Create NewTicketForm component

    - Implement `components/tickets/NewTicketForm.tsx`
    - Form with title, description, priority fields
    - Validate inputs before submission
    - _Requirements: 3.2, 4.1, 4.2, 4.3_

  - [x] 10.3 Create NewTicketModal component

    - Implement `components/tickets/NewTicketModal.tsx`
    - "Nuova Richiesta" button triggers modal
    - Handle form submission and success feedback
    - _Requirements: 3.2, 3.3_
  - [x] 10.4 Write property test for unauthenticated ticket creation


    - **Property 15: Unauthenticated Ticket Creation**
    - **Validates: Requirements 7.4**

  - [x] 10.5 Write property test for unauthenticated status update rejection
    - **Property 14: Unauthenticated Status Update Rejection**
    - **Validates: Requirements 7.3**

- [x] 11. Implement real-time updates






  - [x] 11.1 Add Supabase Realtime subscriptions

    - Subscribe to ticket changes in KanbanBoard
    - Subscribe to comment changes in TicketModal
    - Handle subscription cleanup
    - _Requirements: 2.5, 3.5_

  - [x] 11.2 Integrate realtime in public portal

    - Subscribe to ticket and comment changes
    - Update UI without page refresh
    - _Requirements: 3.5_

- [x] 12. Implement email notifications






  - [x] 12.1 Create email notification API route

    - Implement `app/api/notify/route.ts`
    - Accept ticket data, send email via Resend
    - Include HTML template with ticket details
    - _Requirements: 6.1, 6.2, 6.4_

  - [x] 12.2 Write property test for email notification content

    - **Property 13: Email Notification Content**
    - **Validates: Requirements 6.2**

  - [x] 12.3 Integrate notification on ticket creation

    - Call notify API after successful ticket creation
    - Handle errors gracefully (non-blocking)
    - _Requirements: 6.1, 6.3_

- [x] 13. Final polish and accessibility






  - [x] 13.1 Add ARIA labels and accessibility attributes

    - Add aria-label to interactive elements
    - Ensure keyboard navigation works
    - _Requirements: 8.4_

  - [x] 13.2 Verify Italian labels throughout

    - Review all UI text for Italian consistency
    - _Requirements: 8.5_

  - [x] 13.3 Test responsive design

    - Verify mobile and desktop layouts
    - _Requirements: 8.3_

- [x] 14. Final Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.


- [x] 15. Documentation






  - [x] 15.1 Create README.md

    - Project overview and features
    - Tech stack description
    - Environment variables setup
    - Local development instructions
    - Deployment guide for Vercel
    - _Requirements: All_

  - [x] 15.2 Create maintenance documentation

    - Database schema documentation
    - RLS policies explanation
    - API routes documentation
    - Component architecture overview
    - Troubleshooting guide
    - _Requirements: All_
