/**
 * Email notification utilities for ProjectLink
 * **Feature: project-link, Property 13: Email Notification Content**
 */

export interface NotifyRequestBody {
  ticket_id: string;
  title: string;
  description?: string | null;
  priority: 'low' | 'medium' | 'high';
  project_name?: string;
}

const priorityLabels: Record<string, string> = {
  low: 'Bassa',
  medium: 'Media',
  high: 'Alta',
};

const priorityColors: Record<string, string> = {
  low: '#6b7280',
  medium: '#eab308',
  high: '#ef4444',
};

/**
 * Generates HTML email content for ticket notification
 * Requirements: 6.2, 6.4
 */
export function generateEmailHtml(data: NotifyRequestBody, appUrl?: string): string {
  const baseUrl = appUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const dashboardLink = `${baseUrl}/dashboard`;

  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuovo Ticket - ProjectLink</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎫 Nuovo Ticket Creato</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    ${data.project_name ? `<p style="color: #6b7280; margin: 0 0 20px 0;">Progetto: <strong>${data.project_name}</strong></p>` : ''}
    
    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
      <h2 style="margin: 0 0 15px 0; color: #111827; font-size: 18px;">${data.title}</h2>
      
      ${data.description ? `
      <div style="margin-bottom: 15px;">
        <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase;">Descrizione</p>
        <p style="margin: 0; color: #374151;">${data.description}</p>
      </div>
      ` : ''}
      
      <div style="display: inline-block;">
        <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase;">Priorità</p>
        <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 500; background: ${priorityColors[data.priority]}20; color: ${priorityColors[data.priority]};">
          ${priorityLabels[data.priority]}
        </span>
      </div>
    </div>
    
    <a href="${dashboardLink}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
      Vai alla Dashboard →
    </a>
    
    <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0 0;">
      Questa email è stata inviata automaticamente da ProjectLink.
    </p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generates plain text email content for ticket notification
 * Requirements: 6.2
 */
export function generateEmailText(data: NotifyRequestBody, appUrl?: string): string {
  const baseUrl = appUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const dashboardLink = `${baseUrl}/dashboard`;

  let text = `Nuovo Ticket Creato\n\n`;
  
  if (data.project_name) {
    text += `Progetto: ${data.project_name}\n\n`;
  }
  
  text += `Titolo: ${data.title}\n`;
  
  if (data.description) {
    text += `Descrizione: ${data.description}\n`;
  }
  
  text += `Priorità: ${priorityLabels[data.priority]}\n\n`;
  text += `Vai alla Dashboard: ${dashboardLink}\n`;

  return text;
}
