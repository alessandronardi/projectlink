import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProjectLink - Gestione Richieste per Freelancer",
  description: "Kanban board condivise per freelancer. Gestisci le richieste dei clienti con link pubblici, aggiornamenti real-time e notifiche email.",
  keywords: ["kanban", "freelancer", "gestione progetti", "ticket", "richieste clienti"],
  authors: [{ name: "ProjectLink" }],
  openGraph: {
    title: "ProjectLink - Gestione Richieste per Freelancer",
    description: "Kanban board condivise per freelancer. I tuoi clienti possono inviare richieste e seguire lo stato dei lavori senza registrarsi.",
    type: "website",
    locale: "it_IT",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ProjectLink - Kanban board per freelancer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ProjectLink - Gestione Richieste per Freelancer",
    description: "Kanban board condivise per freelancer. Gestisci le richieste dei clienti con link pubblici e aggiornamenti real-time.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
