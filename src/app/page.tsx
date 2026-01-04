import Link from "next/link";
import { Kanban, Users, Bell, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">ProjectLink</h1>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Accedi
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Gestisci le richieste dei clienti
            <br />
            <span className="text-blue-600">con semplicità</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Kanban board condivise per freelancer. I tuoi clienti possono inviare 
            richieste e seguire lo stato dei lavori senza bisogno di registrarsi.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Inizia Ora
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Vai alla Dashboard
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Kanban className="w-6 h-6" />}
            title="Kanban Board"
            description="Organizza i ticket in colonne: Da Fare, In Lavorazione, Completato"
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Accesso Pubblico"
            description="Condividi un link con i clienti, nessuna registrazione richiesta"
          />
          <FeatureCard
            icon={<Bell className="w-6 h-6" />}
            title="Notifiche Email"
            description="Ricevi una email per ogni nuova richiesta dei clienti"
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Controllo Totale"
            description="Solo tu puoi modificare lo stato dei ticket"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-slate-500">
          ProjectLink — Gestione richieste per freelancer
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}
