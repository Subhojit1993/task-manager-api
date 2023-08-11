const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData);
const client = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY });

const sendMail = async (messageData) => {
    try {
        const response = await client.messages.create(process.env.DOMAIN, messageData);
        return response;
    } catch (error) {
        console.error("error", error);
    }
}

module.exports = { sendMail };