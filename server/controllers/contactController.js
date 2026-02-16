const sendEmail = require('../utils/sendEmail');

// @desc    Handle contact form submission
// @route   POST /api/contact
// @access  Public
exports.submitContactForm = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        // Basic validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Email content
        const emailContent = `
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `;

        // Send email to site owner
        await sendEmail({
            to: 'cyhawkzy@gmail.com',
            subject: `Livestock360 Contact: ${subject}`,
            html: emailContent
        });

        res.status(200).json({
            success: true,
            message: 'Email sent successfully'
        });
    } catch (err) {
        console.error('Contact form error:', err);
        return res.status(500).json({
            success: false,
            message: 'Email could not be sent. Please try again later.'
        });
    }
};
