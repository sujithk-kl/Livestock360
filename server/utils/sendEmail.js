const brevo = require('@getbrevo/brevo');

/**
 * Send email using Brevo (formerly Sendinblue)
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 */
const sendEmail = async (options) => {
    try {
        // Initialize Brevo API client
        const apiInstance = new brevo.TransactionalEmailsApi();

        // Set API key
        apiInstance.setApiKey(
            brevo.TransactionalEmailsApiApiKeys.apiKey,
            process.env.BREVO_API_KEY
        );

        // Prepare email data
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.sender = {
            name: 'Livestock360',
            email: 'cyhawkzy@gmail.com'
        };
        sendSmtpEmail.to = [{ email: options.to }];
        sendSmtpEmail.subject = options.subject;
        sendSmtpEmail.htmlContent = options.html;

        // Send email
        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Email sent successfully via Brevo:', result.messageId);
        return result;
    } catch (error) {
        console.error('Brevo API error:', error);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;
