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
    private static string WrapInLayout(string bodyContent, string sentToEmail = "")
    {
        var footerSentTo = !string.IsNullOrEmpty(sentToEmail)
            ? $@"<p style=""color:#8e8e8e;font-size:12px;margin:6px 0 0;"">This message was sent to <a href=""mailto:{sentToEmail}"" style=""color:#385898;text-decoration:none;"">{sentToEmail}</a>.</p>"
            : "";

        return $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>GharBazar</title>
</head>
<body style=""margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"">
    <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#ffffff;"">
        <tr>
            <td align=""center"" style=""padding:40px 20px 0;"">

                <!-- Logo -->
                <table width=""468"" cellpadding=""0"" cellspacing=""0"">
                    <tr>
                        <td align=""center"" style=""padding-bottom:28px;"">
                            <table cellpadding=""0"" cellspacing=""0"">
                                <tr>
                                    <td style=""background:linear-gradient(135deg,#1d4ed8,#2563eb);border-radius:14px;padding:10px 14px;vertical-align:middle;"">
                                        <span style=""font-size:22px;"">🏠</span>
                                    </td>
                                    <td style=""padding-left:10px;vertical-align:middle;"">
                                        <span style=""font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;color:#1a1a1a;letter-spacing:-0.5px;"">GharBazar</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Card -->
                <table width=""468"" cellpadding=""0"" cellspacing=""0"" style=""border:1px solid #dbdbdb;border-radius:4px;"">
                    <tr>
                        <td style=""padding:40px 40px 28px;"">
                            {bodyContent}
                        </td>
                    </tr>
                </table>

                <!-- Footer -->
                <table width=""468"" cellpadding=""0"" cellspacing=""0"">
                    <tr>
                        <td style=""padding:18px 0 40px;text-align:center;"">
                            <p style=""color:#8e8e8e;font-size:12px;margin:0;"">from</p>
                            <p style=""color:#1a1a1a;font-size:14px;font-weight:700;margin:4px 0 0;"">🏠 GharBazar</p>
                            <p style=""color:#8e8e8e;font-size:12px;margin:10px 0 0;"">© {DateTime.UtcNow.Year} GharBazar, Inc. All rights reserved.</p>
                            {footerSentTo}
                            <p style=""color:#8e8e8e;font-size:12px;margin:6px 0 0;"">
                                <a href=""#"" style=""color:#8e8e8e;text-decoration:underline;"">Remove your email</a> from this account.
                            </p>
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>";
    }

    public static string WelcomeEmail(string userName, string sentToEmail = "")
    {
        var body = $@"
            <p style=""color:#262626;font-size:16px;line-height:1.5;margin:0 0 16px;"">Hi <strong>{userName}</strong>,</p>
            <p style=""color:#262626;font-size:16px;line-height:1.5;margin:0 0 24px;"">
                Welcome to <strong>GharBazar</strong>! Your account has been verified and is ready to use.
                You can now browse properties, save your favorites, and connect with sellers across Nepal.
            </p>
            <div style=""text-align:center;margin:28px 0;"">
                <a href=""http://localhost:5173"" style=""display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;padding:12px 40px;border-radius:4px;font-weight:600;font-size:15px;"">
                    Start Exploring
                </a>
            </div>
            <div style=""border-top:1px solid #dbdbdb;margin-top:28px;padding-top:20px;"">
                <p style=""color:#8e8e8e;font-size:13px;line-height:1.5;margin:0;"">
                    Happy house hunting!<br><strong style=""color:#262626;"">The GharBazar Team</strong>
                </p>
            </div>";
        return WrapInLayout(body, sentToEmail);
    }

    public static string PasswordResetLink(string resetLink, string sentToEmail = "")
    {
        var body = $@"
            <p style=""color:#262626;font-size:16px;line-height:1.5;margin:0 0 16px;"">
                We got a request to reset your GharBazar password.
            </p>
            <div style=""text-align:center;margin:28px 0;"">
                <a href=""{resetLink}"" style=""display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;padding:12px 40px;border-radius:4px;font-weight:600;font-size:15px;"">
                    Reset password
                </a>
            </div>
            <p style=""color:#262626;font-size:14px;line-height:1.5;margin:0 0 16px;"">
                If you ignore this message, your password will not be changed. If you didn't request a password reset,
                <a href=""mailto:gharbazar2026@gmail.com"" style=""color:#2563eb;text-decoration:none;"">let us know</a>.
            </p>
            <div style=""border-top:1px solid #dbdbdb;margin-top:20px;padding-top:16px;"">
                <p style=""color:#8e8e8e;font-size:12px;margin:0;"">⚠️ This link expires in <strong>1 hour</strong>.</p>
            </div>";
        return WrapInLayout(body, sentToEmail);
    }

    public static string PasswordChangedConfirmation(string sentToEmail = "")
    {
        var body = $@"
            <p style=""color:#262626;font-size:16px;line-height:1.5;margin:0 0 16px;"">
                Your GharBazar password has been changed successfully.
            </p>
            <p style=""color:#262626;font-size:14px;line-height:1.5;margin:0 0 24px;"">
                If you made this change, you can ignore this message. If you didn't change your password,
                <a href=""http://localhost:5173/#/forgot-password"" style=""color:#2563eb;text-decoration:none;"">reset your password</a> immediately or
                <a href=""mailto:gharbazar2026@gmail.com"" style=""color:#2563eb;text-decoration:none;"">contact support</a>.
            </p>
            <div style=""border-top:1px solid #dbdbdb;margin-top:20px;padding-top:16px;"">
                <p style=""color:#8e8e8e;font-size:12px;margin:0;"">🔒 Your account security is important to us.</p>
            </div>";
        return WrapInLayout(body, sentToEmail);
    }

    public static string EmailVerificationOtp(string otp, string sentToEmail = "")
    {
        var body = $@"
            <p style=""color:#262626;font-size:16px;line-height:1.5;margin:0 0 16px;"">
                Hi there,
            </p>
            <p style=""color:#262626;font-size:16px;line-height:1.5;margin:0 0 24px;"">
                Please use the verification code below to complete your GharBazar registration.
                This code is valid for <strong>15 minutes</strong>.
            </p>
            <div style=""text-align:center;margin:28px 0;"">
                <span style=""display:inline-block;background-color:#f5f5f5;color:#262626;padding:18px 36px;border-radius:6px;font-weight:700;font-size:34px;letter-spacing:10px;border:1px solid #dbdbdb;font-family:monospace;"">
                    {otp}
                </span>
            </div>
            <p style=""color:#262626;font-size:14px;line-height:1.5;margin:0 0 16px;"">
                If you ignore this message, your account will not be created and this code will expire shortly.
            </p>
            <div style=""border-top:1px solid #dbdbdb;margin-top:20px;padding-top:16px;"">
                <p style=""color:#8e8e8e;font-size:12px;margin:0;"">⚠️ Do not share this code with anyone.</p>
            </div>";
        return WrapInLayout(body, sentToEmail);
    }
}
