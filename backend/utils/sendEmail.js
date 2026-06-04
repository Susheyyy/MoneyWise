const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"MoneyWise System" <${process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<div style="font-family: 'Montserrat', sans-serif; color: #364C4F; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid rgba(54,76,79,0.12); border-radius: 8px;">
            <h2 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 2px; color: #364C4F; text-align: center; border-bottom: 2px solid #384C4F; padding-bottom: 10px;">MoneyWise Security Verification</h2>
            <p style="margin-top: 20px; font-size: 1rem; line-height: 1.6;">Hello ${options.name},</p>
            <p style="font-size: 0.9rem; line-height: 1.6; color: #6B8B8E;">Welcome to MoneyWise. Use the secure verification blueprint code token below to authorize your student finance workspace dashboard account profile:</p>
            <div style="background: #F2F5F5; padding: 15px; border-radius: 4px; text-align: center; font-size: 2rem; font-family: 'Oswald', sans-serif; font-weight: 600; letter-spacing: 6px; color: #364C4F; margin: 25px 0;">
              ${options.code}
            </div>
            <p style="font-size: 0.78rem; color: #A7A7A9; text-align: center;">This security session token vector expires in 15 minutes.</p>
          </div>`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;