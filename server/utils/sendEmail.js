const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Define email options
    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address
        to: options.email, // List of receivers
        subject: options.subject, // Subject line
        html: options.message // HTML body
    };

    // Send email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
