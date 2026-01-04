# 🚀 ProjectLink

Un'applicazione SaaS per freelancer per gestire le richieste dei clienti tramite Kanban board condivise. I clienti possono accedere ai progetti tramite link pubblici senza autenticazione, visualizzare i ticket e inviare nuove richieste. Solo il freelancer autenticato (admin) può modificare lo stato dei ticket e gestire i progetti.

---

## ✨ Funzionalità

- **Gestione Progetti** — Crea e gestisci più progetti con URL pubblici unici
- **Kanban Board** — Gestione visuale dei ticket con drag-and-drop per aggiornare lo stato
- **Portale Pubblico** — Condividi link con i clienti per visualizzare e inviare ticket
- **Aggiornamenti Real-time** — Sincronizzazione live tramite Supabase Realtime
- **Notifiche Email** — Notifiche automatiche per nuovi ticket via Resend
- **Interfaccia Italiana** — Supporto completo in lingua italiana
- **Design Responsive** — Funziona su desktop e dispositivi mobili

---

## 🛠️ Tech Stack

| Categoria | Tecnologia |
|-----------|------------|
| Framework | Next.js 16+ con App Router |
| Linguaggio | TypeScript |
| Styling | Tailwind CSS + Shadcn/UI |
| Database | PostgreSQL via Supabase |
| Autenticazione | Supabase Auth |
| Real-time | Supabase Realtime |
| Email | Resend API |
| Testing | Vitest + fast-check |

---

## 📋 Prerequisiti

- Node.js 18+
- npm o yarn
- Account Supabase
- Account Resend (per notifiche email)

---

## 👤 Utilizzo

### Workflow Admin

1. Accedi su `/login`
2. Crea un nuovo progetto dalla dashboard
3. Condividi il link del portale (`/portal/[slug]`) con i clienti
4. Gestisci i ticket con drag-and-drop sulla Kanban board
5. Rispondi ai clienti tramite commenti

### Workflow Cliente

1. Accedi al link del portale condiviso
2. Visualizza i ticket esistenti e il loro stato
3. Invia nuove richieste tramite "Nuova Richiesta"
4. Aggiungi commenti per comunicare con il freelancer

---

## 📄 Licenza

MIT
