const { sendMail } = require('./common');

const sendWelcomeEmail = async (email, name) => {
    let messageData = {
        from: "Mailgun Sandbox <postmaster@sandbox818164891cf148a7b6058caf1a6bd7be.mailgun.org>",
        to: [email],
        subject: "Thanks for joining in!",
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
    };

    await sendMail(messageData);
}

const cancelledMail = async (email, name) => {
    let messageData = {
        from: "Mailgun Sandbox <postmaster@sandbox818164891cf148a7b6058caf1a6bd7be.mailgun.org>",
        to: [email],
        subject: `Goodbye ${name}!`,
        text: `Is there anything we have done to kept you onboard?`,
    };

    await sendMail(messageData);
}

module.exports = {
    sendWelcomeEmail,
    cancelledMail
};
