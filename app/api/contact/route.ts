import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Test mode - change to ['hello@aretian.com'] for production
const RECIPIENTS = ['emunn@aretian.com'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, message, isFollowUp, browserData } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get server-side data
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
      || headersList.get('x-real-ip')
      || 'Unknown';
    const userAgent = headersList.get('user-agent') || 'Unknown';
    const referer = headersList.get('referer') || 'Direct';
    const timestamp = new Date().toISOString();

    const subject = isFollowUp
      ? `Follow-up from ${email}`
      : `New contact from ${email}`;

    // Build metadata section
    const metadataHtml = `
      <div style="background: #f5f5f5; padding: 12px; border-radius: 6px; margin-top: 20px;">
        <p style="margin: 0 0 8px 0; font-size: 11px; color: #666; font-weight: bold; text-transform: uppercase;">Visitor Details</p>
        <table style="font-size: 12px; color: #444; width: 100%;">
          <tr><td style="padding: 2px 8px 2px 0; color: #888;">IP Address:</td><td>${ip}</td></tr>
          <tr><td style="padding: 2px 8px 2px 0; color: #888;">Timestamp:</td><td>${timestamp}</td></tr>
          <tr><td style="padding: 2px 8px 2px 0; color: #888;">Referrer:</td><td>${referer}</td></tr>
          ${browserData?.timezone ? `<tr><td style="padding: 2px 8px 2px 0; color: #888;">Timezone:</td><td>${browserData.timezone}</td></tr>` : ''}
          ${browserData?.language ? `<tr><td style="padding: 2px 8px 2px 0; color: #888;">Language:</td><td>${browserData.language}</td></tr>` : ''}
          ${browserData?.screenSize ? `<tr><td style="padding: 2px 8px 2px 0; color: #888;">Screen:</td><td>${browserData.screenSize}</td></tr>` : ''}
          ${browserData?.page ? `<tr><td style="padding: 2px 8px 2px 0; color: #888;">Page:</td><td>${browserData.page}</td></tr>` : ''}
          <tr><td style="padding: 2px 8px 2px 0; color: #888; vertical-align: top;">User Agent:</td><td style="word-break: break-all;">${userAgent}</td></tr>
        </table>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      // Use Resend's onboarding domain until aretian.com is verified
      from: 'Aretian Contact <onboarding@resend.dev>',
      to: RECIPIENTS,
      replyTo: email,
      subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px;">
          <h2 style="color: #1e40af; margin-bottom: 16px;">${isFollowUp ? 'Follow-up Message' : 'New Contact'}</h2>
          <p><strong>From:</strong> <a href="mailto:${email}" style="color: #1e40af;">${email}</a></p>
          ${message ? `<p><strong>Message:</strong></p><div style="background: #fafafa; padding: 16px; border-left: 3px solid #1e40af; white-space: pre-wrap;">${message}</div>` : '<p style="color: #888;"><em>No message provided</em></p>'}
          ${metadataHtml}
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 11px;">Sent from aretian.com contact form</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
