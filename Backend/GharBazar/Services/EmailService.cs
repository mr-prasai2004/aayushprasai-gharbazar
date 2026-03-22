using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace GharBazar.API.Services;

public class EmailSettings
{
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string htmlBody);
}

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(EmailSettings settings, ILogger<EmailService> logger)
    {
        _settings = settings;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;

            var builder = new BodyBuilder
            {
                HtmlBody = htmlBody
            };
            message.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_settings.SenderEmail, _settings.Password);
            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);

            _logger.LogInformation("Email sent successfully to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            // Don't throw — email failure should not break the main flow
        }
    }
}

// Static helper class for building branded HTML email templates
public static class EmailTemplates
{
    private static string WrapInLayout(string title, string bodyContent)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
</head>
<body style=""margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;"">
    <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#f4f6f9;padding:40px 0;"">
        <tr>
            <td align=""center"">
                <table width=""600"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"">
                    <!-- Header -->
                    <tr>
                        <td style=""background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px 40px;text-align:center;"">
                            <h1 style=""color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;"">🏠 GharBazar</h1>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style=""padding:40px;"">
                            <h2 style=""color:#1e293b;margin:0 0 20px;font-size:22px;font-weight:600;"">{title}</h2>
                            {bodyContent}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style=""background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;"">
                            <p style=""color:#94a3b8;font-size:13px;margin:0;"">© {DateTime.UtcNow.Year} GharBazar. All rights reserved.</p>
                            <p style=""color:#94a3b8;font-size:12px;margin:8px 0 0;"">This is an automated message, please do not reply.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    public static string WelcomeEmail(string userName)
    {
        var body = $@"
            <p style=""color:#475569;font-size:16px;line-height:1.6;margin:0 0 16px;"">
                Hello <strong>{userName}</strong>,
            </p>
            <p style=""color:#475569;font-size:16px;line-height:1.6;margin:0 0 24px;"">
                Welcome to <strong>GharBazar</strong>! Your account has been created successfully. 
                You can now browse properties, save your favorites, and connect with sellers.
            </p>
            <div style=""background-color:#eff6ff;border-left:4px solid #2563eb;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 24px;"">
                <p style=""color:#1e40af;font-size:14px;margin:0;font-weight:500;"">🎉 Start exploring properties on GharBazar today!</p>
            </div>
            <p style=""color:#475569;font-size:15px;line-height:1.6;margin:0;"">
                Happy house hunting!<br><strong>The GharBazar Team</strong>
            </p>";
        return WrapInLayout("Welcome to GharBazar!", body);
    }

    public static string PasswordResetLink(string resetLink)
    {
        var body = $@"
            <p style=""color:#475569;font-size:16px;line-height:1.6;margin:0 0 16px;"">
                We received a request to reset your password. Click the button below to set a new password:
            </p>
            <div style=""text-align:center;margin:32px 0;"">
                <a href=""{resetLink}"" style=""display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-weight:600;font-size:16px;box-shadow:0 4px 12px rgba(37,99,235,0.3);"">
                    Reset Password
                </a>
            </div>
            <div style=""background-color:#fef3c7;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 24px;"">
                <p style=""color:#92400e;font-size:14px;margin:0;"">⚠️ This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
            </div>
            <p style=""color:#475569;font-size:15px;line-height:1.6;margin:0;"">
                Stay safe,<br><strong>The GharBazar Team</strong>
            </p>";
        return WrapInLayout("Reset Your Password", body);
    }

    public static string PasswordChangedConfirmation()
    {
        var body = $@"
            <p style=""color:#475569;font-size:16px;line-height:1.6;margin:0 0 16px;"">
                Your password has been changed successfully.
            </p>
            <div style=""background-color:#fef2f2;border-left:4px solid #ef4444;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 24px;"">
                <p style=""color:#991b1b;font-size:14px;margin:0;font-weight:500;"">🔒 If you did not make this change, please reset your password immediately or contact support.</p>
            </div>
            <p style=""color:#475569;font-size:15px;line-height:1.6;margin:0;"">
                Stay secure,<br><strong>The GharBazar Team</strong>
            </p>";
        return WrapInLayout("Password Changed", body);
    }

    public static string EmailVerificationOtp(string otp)
    {
        var body = $@"
            <p style=""color:#475569;font-size:16px;line-height:1.6;margin:0 0 16px;"">
                Welcome to GharBazar! Please verify your email address to complete your registration.
            </p>
            <div style=""text-align:center;margin:32px 0;"">
                <span style=""display:inline-block;background:#f3f4f6;color:#111827;padding:16px 32px;border-radius:12px;font-weight:700;font-size:32px;letter-spacing:8px;border:2px dashed #cbd5e1;"">
                    {otp}
                </span>
            </div>
            <div style=""background-color:#fef3c7;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 24px;"">
                <p style=""color:#92400e;font-size:14px;margin:0;"">⚠️ This code expires in <strong>15 minutes</strong>. Do not share this code with anyone.</p>
            </div>
            <p style=""color:#475569;font-size:15px;line-height:1.6;margin:0;"">
                Happy house hunting,<br><strong>The GharBazar Team</strong>
            </p>";
        return WrapInLayout("Verify Your Email Address", body);
    }
}
