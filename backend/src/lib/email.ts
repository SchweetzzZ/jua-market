import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }: { to: string, subject: string, html: string }) => {
    const { data, error } = await resend.emails.send({
        from: 'Juá Market <onboarding@resend.dev>',
        to,
        subject,
        html,
    });

    if (error) {
        throw new Error('Falha ao enviar email');
    }

    return data;
};

export const sendResetPasswordEmail = async (email: string, name: string, url: string) => {
    // A 'url' que o better-auth passa pode vir em formatos diferentes, 
    // então extraímos o token de forma definitiva
    const urlObj = new URL(url);
    let token = urlObj.searchParams.get("token") || urlObj.pathname.split('/').pop();

    // Garantimos que o token não carregue restos de query string caso venha do path
    if (token?.includes('?')) {
        token = token.split('?')[0];
    }

    // CONSTRUÇÃO DEFINITIVA DA URL DO FRONTEND
    // Ignoramos a URL que o backend sugere e forçamos o caminho correto do frontend
    const frontendUrl = `http://localhost:5173/reset-password?token=${token}`;

    console.log(`[AUTH-DEBUG] Email enviado para ${email} com link: ${frontendUrl}`);

    return sendEmail({
        to: email,
        subject: "Redefinição de Senha (NOVA) - Juá Market",
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #4f46e5; text-align: center;">Juá Market</h2>
                <p style="font-size: 16px; color: #334155;">Olá, <strong>${name}</strong>!</p>
                <p style="font-size: 16px; color: #334155;">Recebemos uma solicitação para redefinir a sua senha. Clique no botão abaixo:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${frontendUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Redefinir Senha</a>
                </div>
                <p style="font-size: 14px; color: #64748b; line-height: 1.5;">O link é válido por 1 hora. Se não pediu isso, ignore.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; 2026 Juá Market.</p>
            </div>
        `,
    });
};
