import env from '../config/env';

const baseStyles = `
  body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0fdf4; }
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #16a34a, #059669, #0d9488); padding: 32px; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
  .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
  .logo-box { display: inline-block; background: #ffffff; border-radius: 12px; padding: 8px 20px; margin-bottom: 16px; }
  .logo-text { font-size: 24px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.5px; }
  .logo-text span { color: #16a34a; }
  .body { padding: 32px; }
  .body p { color: #4b5563; line-height: 1.7; margin: 0 0 16px; font-size: 15px; }
  .body h2 { color: #111827; font-size: 22px; margin: 0 0 16px; }
  .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #16a34a, #059669); color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; margin: 8px 0; }
  .token-box { background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
  .token-code { font-size: 14px; font-family: 'Courier New', monospace; color: #16a34a; font-weight: 700; word-break: break-all; letter-spacing: 0.5px; }
  .info-box { background: #f8fafc; border-left: 4px solid #16a34a; border-radius: 0 8px 8px 0; padding: 16px; margin: 20px 0; }
  .info-box p { margin: 0; color: #6b7280; font-size: 13px; }
  .footer { background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb; }
  .footer p { color: #9ca3af; font-size: 12px; margin: 0 0 4px; }
  .footer a { color: #16a34a; text-decoration: none; }
  .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
`;

const wrapTemplate = (content: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body style="margin:0;padding:20px;background:#f0fdf4;">
  <div class="container">
    ${content}
    <div class="footer">
      <p>${env.COMPANY_NAME}</p>
      <p>This is an automated email. Please do not reply directly.</p>
      <p><a href="${env.FRONTEND_URL}">${env.FRONTEND_URL}</a></p>
    </div>
  </div>
</body>
</html>
`;

// ========================
// PASSWORD RESET EMAIL
// ========================
export const passwordResetTemplate = (data: {
  userName: string;
  resetToken: string;
  resetUrl: string;
  expiryMinutes: number;
}): string => {
  return wrapTemplate(`
    <div class="header">
      <div class="logo-box">
        <div class="logo-text"><span>E-</span>FLORA</div>
      </div>
      <h1>Password Reset Request</h1>
      <p>We received a request to reset your password</p>
    </div>
    <div class="body">
      <h2>Hi ${data.userName},</h2>
      <p>You recently requested to reset your password for your eFlora account. Use the button below or copy the reset token to set a new password.</p>

      <div style="text-align:center;margin:24px 0;">
        <a href="${data.resetUrl}" class="btn">Reset My Password</a>
      </div>

      <p style="text-align:center;color:#9ca3af;font-size:13px;">Or copy and paste this token on the reset page:</p>

      <div class="token-box">
        <div class="token-code">${data.resetToken}</div>
      </div>

      <div class="info-box">
        <p>This link will expire in <strong>${data.expiryMinutes} minutes</strong>. If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.</p>
      </div>

      <div class="divider"></div>
      <p style="font-size:13px;color:#9ca3af;">If the button doesn't work, copy and paste this URL into your browser:</p>
      <p style="font-size:12px;color:#16a34a;word-break:break-all;">${data.resetUrl}</p>
    </div>
  `);
};

// ========================
// EMAIL VERIFICATION
// ========================
export const emailVerificationTemplate = (data: {
  userName: string;
  verificationToken: string;
  verificationUrl: string;
  expiryHours: number;
}): string => {
  return wrapTemplate(`
    <div class="header">
      <div class="logo-box">
        <div class="logo-text"><span>E-</span>FLORA</div>
      </div>
      <h1>Verify Your Email</h1>
      <p>Welcome to India's #1 Plant Marketplace</p>
    </div>
    <div class="body">
      <h2>Welcome, ${data.userName}!</h2>
      <p>Thanks for creating an eFlora account. Please verify your email address to get started with your plant journey.</p>

      <div style="text-align:center;margin:24px 0;">
        <a href="${data.verificationUrl}" class="btn">Verify Email Address</a>
      </div>

      <p style="text-align:center;color:#9ca3af;font-size:13px;">Or use this verification token:</p>

      <div class="token-box">
        <div class="token-code">${data.verificationToken}</div>
      </div>

      <div class="info-box">
        <p>This link expires in <strong>${data.expiryHours} hours</strong>. If you didn't create an account, please ignore this email.</p>
      </div>
    </div>
  `);
};

// ========================
// ORDER CONFIRMATION
// ========================
export const orderConfirmationTemplate = (data: {
  userName: string;
  orderNumber: string;
  totalAmount: string;
  itemCount: number;
  orderUrl: string;
}): string => {
  return wrapTemplate(`
    <div class="header">
      <div class="logo-box">
        <div class="logo-text"><span>E-</span>FLORA</div>
      </div>
      <h1>Order Confirmed!</h1>
      <p>Your order has been placed successfully</p>
    </div>
    <div class="body">
      <h2>Thank you, ${data.userName}!</h2>
      <p>Your order <strong>#${data.orderNumber}</strong> has been confirmed and is being processed.</p>

      <div class="token-box" style="border-color:#059669;">
        <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Order Summary</p>
        <div style="font-size:28px;font-weight:800;color:#16a34a;">Rs.${data.totalAmount}</div>
        <p style="margin:8px 0 0;color:#6b7280;font-size:13px;">${data.itemCount} item(s)</p>
      </div>

      <div style="text-align:center;margin:24px 0;">
        <a href="${data.orderUrl}" class="btn">View Order Details</a>
      </div>

      <div class="info-box">
        <p>We'll send you updates as your order progresses. You can track your order anytime from your account.</p>
      </div>
    </div>
  `);
};

// ========================
// WELCOME EMAIL
// ========================
export const welcomeTemplate = (data: {
  userName: string;
  role: string;
}): string => {
  const roleMessage = data.role === 'supplier'
    ? 'Start listing your plants and reach thousands of customers across India.'
    : 'Browse thousands of plants from verified nurseries across India.';

  return wrapTemplate(`
    <div class="header">
      <div class="logo-box">
        <div class="logo-text"><span>E-</span>FLORA</div>
      </div>
      <h1>Welcome to eFlora!</h1>
      <p>India's Premier Plant Marketplace</p>
    </div>
    <div class="body">
      <h2>Hi ${data.userName},</h2>
      <p>Welcome to eFlora! Your account has been created successfully.</p>
      <p>${roleMessage}</p>

      <div style="text-align:center;margin:24px 0;">
        <a href="${env.FRONTEND_URL}/products" class="btn">Start Exploring</a>
      </div>

      <div class="info-box">
        <p>Need help? Contact our support team at <a href="mailto:${env.COMPANY_EMAIL}" style="color:#16a34a;">${env.COMPANY_EMAIL}</a></p>
      </div>
    </div>
  `);
};
