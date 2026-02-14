const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email using Resend
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 */
const sendEmail = async (options) => {
    try {
        // Send email via Resend API
        const { data, error } = await resend.emails.send({
            from: 'Livestock360 <onboarding@resend.dev>', // Resend's verified domain for testing
            to: options.to,
            subject: options.subject,
            html: options.html
        });

        if (error) {
            console.error('Resend API error:', error);
            throw new Error(`Email could not be sent: ${error.message}`);
        }

        console.log('Email sent successfully via Resend:', data.id);
        return data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;
