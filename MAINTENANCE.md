# Documentazione di Manutenzione ProjectLink

Questo documento fornisce dettagli tecnici per la manutenzione e l'estensione dell'applicazione ProjectLink.

## Indice

1. [Schema Database](#schema-database)
2. [Politiche Row Level Security (RLS)](#politiche-row-level-security-rls)
3. [API Routes](#api-routes)
4. [Architettura Componenti](#architettura-componenti)
5. [Risoluzione Problemi](#risoluzione-problemi)

---

## Schema Database

L'applicazione utilizza tre tabelle principali in PostgreSQL tramite Supabase.

### Tabella Projects

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| `id` | UUID | Chiave primaria, auto-generata |
| `user_id` | UUID | Chiave esterna verso auth.users (admin proprietario) |
| `name` | TEXT | Nome visualizzato del progetto |
| `slug` | TEXT | Identificatore univoco URL-safe per accesso pubblico |
| `archived` | BOOLEAN | Se il progetto è archiviato (default: false) |
| `created_at` | TIMESTAMPTZ | Timestamp di creazione |

### Tabella Tickets

```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

| Colonna | Tipo | Vincoli | Descrizione |
|---------|------|---------|-------------|
| `id` | UUID | PRIMARY KEY | Auto-generato |
| `project_id` | UUID | FOREIGN KEY | Riferimento a projects.id |
| `title` | TEXT | NOT NULL | Titolo del ticket |
| `description` | TEXT | nullable | Descrizione opzionale |
| `status` | TEXT | CHECK constraint | Uno tra: `todo`, `in_progress`, `done` |
| `priority` | TEXT | CHECK constraint | Uno tra: `low`, `medium`, `high` |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp di creazione |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp ultimo aggiornamento |

### Tabella Comments

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| `id` | UUID | Chiave primaria, auto-generata |
| `ticket_id` | UUID | Chiave esterna verso tickets |
| `author_name` | TEXT | Nome visualizzato dell'autore |
| `content` | TEXT | Contenuto del commento |
| `is_admin` | BOOLEAN | True se il commento è dell'admin |
| `created_at` | TIMESTAMPTZ | Timestamp di creazione |

### Indici

```sql
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_tickets_project_id ON tickets(project_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_comments_ticket_id ON comments(ticket_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
```

### Trigger

Il trigger `update_updated_at_column()` aggiorna automaticamente `updated_at` alle modifiche dei ticket:

```sql
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Politiche Row Level Security (RLS)

RLS è abilitato su tutte le tabelle per applicare il controllo accessi a livello database.

### Politiche Projects

| Politica | Ruolo | Operazione | Regola |
|----------|-------|------------|--------|
| Admin può leggere propri progetti | authenticated | SELECT | `auth.uid() = user_id` |
| Admin può inserire propri progetti | authenticated | INSERT | `auth.uid() = user_id` |
| Admin può aggiornare propri progetti | authenticated | UPDATE | `auth.uid() = user_id` |
| Admin può eliminare propri progetti | authenticated | DELETE | `auth.uid() = user_id` |
| Pubblico può leggere progetti per slug | anon | SELECT | `true` (tutti i progetti) |

### Politiche Tickets

| Politica | Ruolo | Operazione | Regola |
|----------|-------|------------|--------|
| Admin può leggere ticket nei propri progetti | authenticated | SELECT | Verifica proprietà progetto |
| Admin può inserire ticket nei propri progetti | authenticated | INSERT | Verifica proprietà progetto |
| Admin può aggiornare ticket nei propri progetti | authenticated | UPDATE | Verifica proprietà progetto |
| Admin può eliminare ticket nei propri progetti | authenticated | DELETE | Verifica proprietà progetto |
| Pubblico può leggere ticket | anon | SELECT | `true` (tutti i ticket) |
| Pubblico può inserire ticket | anon | INSERT | `true` (nuove richieste) |

**Nota**: Nessuna politica UPDATE per il ruolo `anon` significa che gli utenti non autenticati non possono cambiare lo stato dei ticket.

### Politiche Comments

| Politica | Ruolo | Operazione | Regola |
|----------|-------|------------|--------|
| Admin può leggere commenti nei ticket dei propri progetti | authenticated | SELECT | Proprietà progetto via ticket |
| Admin può inserire commenti | authenticated | INSERT | Proprietà progetto via ticket |
| Admin può aggiornare propri commenti | authenticated | UPDATE | `is_admin = true` + proprietà |
| Admin può eliminare commenti nei ticket dei propri progetti | authenticated | DELETE | Proprietà progetto via ticket |
| Pubblico può leggere commenti | anon | SELECT | `true` |
| Pubblico può inserire commenti | anon | INSERT | `is_admin = false AND author_name IS NOT NULL` |

---

## API Routes

### API Projects

#### `POST /api/projects`
Crea un nuovo progetto.

**Autenticazione**: Richiesta

**Body Richiesta**:
```json
{
  "name": "Nome Progetto"
}
```

**Risposta**: `201 Created`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Nome Progetto",
  "slug": "abc123xyz",
  "archived": false,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### `GET /api/projects/list`
Ottiene tutti i progetti dell'utente autenticato.

**Autenticazione**: Richiesta

**Parametri Query**:
- `includeArchived` (opzionale): `true` per includere progetti archiviati

**Risposta**: `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Nome Progetto",
    "slug": "abc123xyz",
    "archived": false,
    "ticket_count": 5,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### `GET /api/projects/slug/[slug]`
Ottiene un progetto tramite il suo slug pubblico.

**Autenticazione**: Non richiesta

**Risposta**: `200 OK` - Oggetto progetto

#### `GET /api/projects/[projectId]`
Ottiene un progetto tramite ID.

**Autenticazione**: Richiesta

**Risposta**: `200 OK` - Oggetto progetto

#### `PATCH /api/projects/[projectId]/archive`
Archivia o ripristina un progetto.

**Autenticazione**: Richiesta

**Body Richiesta**:
```json
{
  "archived": true
}
```

**Risposta**: `200 OK` - Oggetto progetto aggiornato

### API Tickets

#### `POST /api/tickets/create`
Crea un nuovo ticket.

**Autenticazione**: Non richiesta (portale pubblico)

**Body Richiesta**:
```json
{
  "project_id": "uuid",
  "title": "Titolo Ticket",
  "description": "Descrizione opzionale",
  "priority": "low" | "medium" | "high"
}
```

**Risposta**: `201 Created` - Oggetto ticket con `status: "todo"`

#### `PATCH /api/tickets`
Aggiorna lo stato del ticket.

**Autenticazione**: Richiesta

**Body Richiesta**:
```json
{
  "ticketId": "uuid",
  "status": "todo" | "in_progress" | "done"
}
```

**Risposta**: `200 OK` - Oggetto ticket aggiornato

#### `GET /api/tickets/[projectId]`
Ottiene tutti i ticket di un progetto.

**Autenticazione**: Non richiesta

**Risposta**: `200 OK` - Array di ticket

### API Comments

#### `POST /api/comments`
Crea un nuovo commento.

**Autenticazione**: Non richiesta (ma influenza il flag `is_admin`)

**Body Richiesta**:
```json
{
  "ticket_id": "uuid",
  "author_name": "Nome Autore",
  "content": "Contenuto commento",
  "is_admin": false
}
```

**Risposta**: `201 Created` - Oggetto commento

#### `GET /api/comments/[ticketId]`
Ottiene tutti i commenti di un ticket.

**Autenticazione**: Non richiesta

**Risposta**: `200 OK` - Array di commenti (ordine cronologico)

### API Notifiche

#### `POST /api/notify`
Invia notifica email per nuovo ticket.

**Body Richiesta**:
```json
{
  "title": "Titolo Ticket",
  "description": "Descrizione ticket",
  "priority": "high",
  "projectName": "Nome Progetto",
  "dashboardUrl": "https://..."
}
```

**Risposta**: `200 OK`
```json
{
  "success": true,
  "id": "email-id"
}
```

---

## Architettura Componenti

### Struttura Directory

```
src/components/
├── comments/
│   ├── CommentForm.tsx      # Form per aggiungere commenti
│   ├── CommentList.tsx      # Visualizza commenti cronologicamente
│   └── index.ts             # Export barrel
├── kanban/
│   ├── KanbanBoard.tsx      # Board principale con 3 colonne
│   ├── KanbanColumn.tsx     # Singola colonna di stato
│   ├── TicketCard.tsx       # Card singolo ticket
│   └── index.ts
├── projects/
│   ├── NewProjectModal.tsx  # Modale per creare progetti
│   └── ProjectCard.tsx      # Card progetto per dashboard
├── tickets/
│   ├── NewTicketForm.tsx    # Form per creare ticket
│   ├── NewTicketModal.tsx   # Wrapper modale per form ticket
│   ├── TicketModal.tsx      # Modale dettaglio ticket con commenti
│   └── index.ts
└── ui/                      # Componenti Shadcn/UI
```

### Componenti Principali

#### KanbanBoard
- Renderizza tre colonne: "Da Fare", "In Lavorazione", "Completato"
- Gestisce drag-and-drop per utenti admin
- Si iscrive agli aggiornamenti real-time dei ticket

#### TicketCard
- Visualizza titolo ticket, badge priorità, data creazione
- Trascinabile quando `isAdmin=true`
- Cliccabile per aprire TicketModal

#### TicketModal
- Mostra dettagli completi del ticket
- Include CommentList e CommentForm
- Si iscrive agli aggiornamenti real-time dei commenti

#### CommentList
- Visualizza commenti in ordine cronologico
- Distingue visivamente commenti admin vs cliente
- Commenti admin hanno stile blu

#### ProjectCard
- Visualizza nome progetto, slug, conteggio ticket
- Pulsante archivia/ripristina progetto
- Link per copiare URL portale e aprire Kanban

### Hook Personalizzati

#### `useRealtimeTickets(projectId)`
Si iscrive ai cambiamenti dei ticket per un progetto.

```typescript
const { tickets, loading, error } = useRealtimeTickets(projectId);
```

#### `useRealtimeComments(ticketId)`
Si iscrive ai cambiamenti dei commenti per un ticket.

```typescript
const { comments, loading, error } = useRealtimeComments(ticketId);
```

### Flusso Dati

1. **Server Components** recuperano dati iniziali via funzioni lib
2. **Client Components** ricevono dati come props
3. **Hook real-time** si iscrivono ai canali Supabase
4. **API routes** gestiscono le mutazioni
5. **Trigger Supabase** trasmettono cambiamenti agli iscritti

---

## Risoluzione Problemi

### Problemi Comuni

#### "Non autorizzato" (401) sulla Dashboard

**Causa**: Sessione utente scaduta o non autenticato.

**Soluzione**:
1. Verificare che i cookie siano abilitati
2. Cancellare storage browser e ri-effettuare login
3. Verificare configurazione Supabase Auth

#### Ticket Non Si Aggiornano in Real-time

**Causa**: Sottoscrizione Realtime non attiva.

**Soluzione**:
1. Verificare che la pubblicazione `supabase_realtime` includa la tabella tickets
2. Controllare console browser per errori WebSocket
3. Assicurarsi che il progetto Supabase abbia Realtime abilitato

#### Notifiche Email Non Inviate

**Causa**: Problema configurazione Resend.

**Soluzione**:
1. Verificare che `RESEND_API_KEY` sia impostata correttamente
2. Controllare che `ADMIN_EMAIL` sia un'email valida
3. Controllare dashboard Resend per stato consegna
4. Controllare log server per messaggi errore

#### Violazioni Politiche RLS

**Causa**: Utente tenta operazione non autorizzata.

**Soluzione**:
1. Verificare che l'utente sia autenticato per operazioni protette
2. Controllare che l'utente sia proprietario del progetto per operazioni admin
3. Rivedere politiche RLS nella dashboard Supabase

#### Collisione Slug alla Creazione Progetto

**Causa**: Estremamente raro - slug generato già esistente.

**Soluzione**: La funzione `generateUniqueSlug` riprova automaticamente con un nuovo slug. Se persistente, controllare problemi database.

### Modalità Debug

Abilitare logging verboso aggiungendo a `.env.local`:

```bash
DEBUG=true
```

### Query Database

Query utili per debug:

```sql
-- Controlla tutti i progetti di un utente
SELECT * FROM projects WHERE user_id = 'user-uuid';

-- Controlla progetti archiviati
SELECT * FROM projects WHERE archived = true;

-- Controlla ticket con il loro progetto
SELECT t.*, p.name as project_name 
FROM tickets t 
JOIN projects p ON t.project_id = p.id;

-- Controlla politiche RLS
SELECT * FROM pg_policies WHERE tablename IN ('projects', 'tickets', 'comments');

-- Controlla pubblicazione realtime
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

### Controlli Salute

1. **Database**: Query `SELECT 1` via dashboard Supabase
2. **Auth**: Controllare che `/api/auth/signout` restituisca 200
3. **Realtime**: Monitorare connessione WebSocket in DevTools browser
4. **Email**: Inviare test via dashboard Resend

### Ottimizzazione Performance

1. **Indici**: Assicurarsi che tutti gli indici da schema.sql siano creati
2. **Query**: Usare `.select()` con colonne specifiche quando possibile
3. **Realtime**: Disiscriversi dai canali quando i componenti si smontano
4. **Caching**: Considerare aggiunta di SWR o React Query per caching client-side

---

## Estendere l'Applicazione

### Aggiungere una Nuova Entità

1. Aggiungere tabella a `supabase/schema.sql`
2. Creare politiche RLS
3. Aggiungere tipi TypeScript a `src/types/database.ts`
4. Creare funzioni servizio in `src/lib/`
5. Aggiungere API routes in `src/app/api/`
6. Creare componenti in `src/components/`

### Aggiungere Nuovo Stato Ticket

1. Aggiornare vincolo CHECK nel database
2. Aggiornare tipo `TicketStatus` in `src/types/database.ts`
3. Aggiungere colonna al componente KanbanBoard
4. Aggiornare colori stato nei componenti UI

### Internazionalizzazione

Attualmente hardcoded in italiano. Per aggiungere i18n:

1. Installare `next-intl` o simile
2. Estrarre stringhe in file di traduzione
3. Aggiornare componenti per usare funzioni di traduzione
4. Aggiungere componente selettore lingua
