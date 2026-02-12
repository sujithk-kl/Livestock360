const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Resolve hostname to IPv4 address to avoid IPv6 issues on Render
    const dns = require('dns');
    const util = require('util');
    const lookup = util.promisify(dns.lookup);

    let hostIP;
    try {
        const result = await lookup('smtp.gmail.com', { family: 4 });
        hostIP = result.address;
        console.log(`Resolved smtp.gmail.com to IPv4: ${hostIP}`);
    } catch (error) {
        console.error('DNS Lookup failed:', error);
        hostIP = 'smtp.gmail.com'; // Fallback
    }

    const transporter = nodemailer.createTransport({
        host: hostIP,
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            servername: 'smtp.gmail.com' // Required when using IP address
        }
    });

    const message = {
        from: `${process.env.FROM_NAME || 'Livestock360'} <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: options.html // You can add HTML support if needed
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
