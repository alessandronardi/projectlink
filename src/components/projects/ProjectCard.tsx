'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FolderKanban, Ticket, ExternalLink, Copy, Check, Archive, ArchiveRestore } from 'lucide-react';
import type { ProjectWithTicketCount } from '@/types/database';
import { useState } from 'react';

interface ProjectCardProps {
  project: ProjectWithTicketCount;
  onArchiveToggle?: (projectId: string, archived: boolean) => void;
}

export function ProjectCard({ project, onArchiveToggle }: ProjectCardProps) {
  const [copied, setCopied] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const portalUrl = `/portal/${project.slug}`;

  const handleCopyLink = async () => {
    const fullUrl = `${window.location.origin}${portalUrl}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleArchiveToggle = async () => {
    if (isArchiving) return;
    setIsArchiving(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: !project.archived }),
      });
      if (response.ok && onArchiveToggle) {
        onArchiveToggle(project.id, !project.archived);
      }
    } catch (error) {
      console.error('Error toggling archive:', error);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${project.archived ? 'opacity-60' : ''}`} role="listitem">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            <CardTitle className="text-lg">{project.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {project.archived && (
              <Badge variant="outline" className="text-gray-500">
                Archiviato
              </Badge>
            )}
            <Badge variant="secondary" className="flex items-center gap-1" aria-label={`${project.ticket_count} ticket`}>
              <Ticket className="h-3 w-3" aria-hidden="true" />
              {project.ticket_count}
            </Badge>
          </div>
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
          onClick={handleArchiveToggle}
          disabled={isArchiving}
          aria-label={project.archived ? 'Ripristina progetto' : 'Archivia progetto'}
        >
          {project.archived 
            ? <ArchiveRestore className="h-4 w-4 text-green-600" aria-hidden="true" />
            : <Archive className="h-4 w-4" aria-hidden="true" />
          }
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
