const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use service 'gmail' for simpler config if possible, but keep host/port if explicit control needed
        host: 'smtp.gmail.com',
        port: 587,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        // Force IPv4
        family: 4,
        // Allow potentially problematic certs (common in dev/cheap hosting)
        tls: {
            rejectUnauthorized: false
        }
    });

    // Define email options
    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address
        to: options.email, // List of receivers
        subject: options.subject, // Subject line
        html: options.message // HTML body
    };

    // Log transporter config (sanitized)
    console.log('[sendEmail] Transporter Config:', {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: true,
        authUser: process.env.EMAIL_USER ? '***' : 'MISSING',
        authPass: process.env.EMAIL_PASS ? '***' : 'MISSING',
        family: 4
    });

    // Send email
    try {
        console.log(`[sendEmail] Attempting to send email to: ${options.email}`);
        const info = await transporter.sendMail(mailOptions);
        console.log('[sendEmail] Email sent successfully. MessageID: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('[sendEmail] Error sending email:', error);
        console.error('[sendEmail] Error stack:', error.stack);
        if (error.code === 'EAUTH') {
            console.error('[sendEmail] Authentication failed. Check EMAIL_USER and EMAIL_PASS.');
        }
        throw error;
    }
};

module.exports = sendEmail;
