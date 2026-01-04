'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FolderKanban, Ticket, ExternalLink, Copy, Check } from 'lucide-react';
import type { ProjectWithTicketCount } from '@/types/database';
import { useState } from 'react';

interface ProjectCardProps {
  project: ProjectWithTicketCount;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [copied, setCopied] = useState(false);
  const portalUrl = `/portal/${project.slug}`;

  const handleCopyLink = async () => {
    const fullUrl = `${window.location.origin}${portalUrl}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="hover:shadow-md transition-shadow" role="listitem">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            <CardTitle className="text-lg">{project.name}</CardTitle>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1" aria-label={`${project.ticket_count} ticket`}>
            <Ticket className="h-3 w-3" aria-hidden="true" />
            {project.ticket_count}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1 text-xs font-mono">
          /portal/{project.slug}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-600">
          {project.ticket_count === 0 
            ? 'Nessun ticket' 
            : project.ticket_count === 1 
              ? '1 ticket' 
              : `${project.ticket_count} ticket`}
        </p>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button asChild className="flex-1">
          <Link href={`/dashboard/${project.id}`} aria-label={`Apri bacheca Kanban per ${project.name}`}>
            Apri Kanban
          </Link>
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleCopyLink}
          aria-label={copied ? 'Link copiato' : 'Copia link portale'}
        >
          {copied ? <Check className="h-4 w-4 text-green-600" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          asChild
          aria-label={`Apri portale pubblico per ${project.name}`}
        >
          <Link href={portalUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
