const formData = require('form-data');
const Mailgun = require('mailgun.js');

const API_KEY = "bc6fb7c7d17a8897836056594a29bec1-28e9457d-6dadf78f";
const DOMAIN = 'sandbox818164891cf148a7b6058caf1a6bd7be.mailgun.org';

const mailgun = new Mailgun(formData);
const client = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY });

const sendMail = async (messageData) => {
    console.log("medd", messageData);
    try {
        const response = await client.messages.create(DOMAIN, messageData);
        return response;
    } catch (error) {
        console.log("error", error);
    }
}

module.exports = { sendMail };