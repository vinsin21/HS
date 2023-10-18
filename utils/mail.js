const Mailgen = require('mailgen');
const nodemailer = require("nodemailer");
const ApiError = require('./apiError');


const sendMail = async (options) => {

    // Configure mailgen by setting a theme and your product info
    const mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            // Appears in header & footer of e-mails
            name: 'Mailgen',
            link: 'https://mailgen.js/'
            // Optional product logo
            // logo: 'https://mailgen.js/img/logo.png'
        }
    });

    // Generate an HTML email with the provided contents
    const emailBody = mailGenerator.generate(options.mailgenContent);
    // Generate the plaintext version of the e-mail (for clients that do not support HTML)
    const emailText = mailGenerator.generatePlaintext(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.BREVO_SMTP_HOST,
        port: process.env.BREVO_SMTP_PORT,
        secure: false,         // if you make it true then also make port to 465
        auth: {
            user: process.env.BREVO_SMTP_USER,
            pass: process.env.BREVO_SMTP_PASS,
        },
    });

    const mail = {
        from: 'vineetsinghjrj@gmail.com', // sender address
        to: options.email, // list of receivers
        subject: options.subject, // Subject line
        text: emailText, // plain text body
        html: emailBody, // html body
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.log(`something went wrong while sending email`)
    }

}

const emailVerificationMailgenContent = (username, verificationLink) => {
    return {
        body: {
            name: username,
            intro: 'Welcome to HS We\'re very excited to have you on board.',
            action: {
                instructions: 'To get started with HS, please verify account:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'Verify your account',
                    link: verificationLink
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}


const forgotPasswordMailgenContent = (username, resetPasswordLink) => {
    return {
        body: {
            name: username,
            intro: 'Welcome to HS We\'re very excited to have you on board.',
            action: {
                instructions: 'To reset you passowrd of HS account click verify:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'reset your pssword',
                    link: resetPasswordLink
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }

}

module.exports = {
    sendMail,
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent
}