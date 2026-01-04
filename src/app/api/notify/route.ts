import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateEmailHtml, generateEmailText, type NotifyRequestBody } from '@/lib/email';

/**
 * POST /api/notify - Send email notification for new ticket
 * Requirements: 6.1, 6.2, 6.4
 */
export async function POST(request: NextRequest) {
  try {
    const body: NotifyRequestBody = await request.json();
    const { title, priority } = body;

    // Validate required fields
    if (!title || !priority) {
      return NextResponse.json(
        { error: 'Titolo e priorità sono obbligatori' },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error('ADMIN_EMAIL not configured');
      return NextResponse.json(
        { error: 'Email admin non configurata' },
        { status: 500 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Servizio email non configurato' },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const htmlContent = generateEmailHtml(body);
    const textContent = generateEmailText(body);

    const { data, error } = await resend.emails.send({
      from: 'ProjectLink <onboarding@resend.dev>',
      to: [adminEmail],
      subject: `Nuovo Ticket: ${title}`,
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        { error: 'Errore durante l\'invio dell\'email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id }, { status: 200 });
  } catch (error) {
    console.error('Error in notify API:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'invio della notifica' },
      { status: 500 }
    );
  }
}
