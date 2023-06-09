import config from '../config/index.js';
import twilio from "twilio";


const twilioSMS = async (option) => {
    const client = twilio(config.ACCOUNT_SID, config.AUTH_TOKEN);
    await client.messages.create({
        body: option.body,
        from: "+14066167224",
        to: option.to
    })
}

export default twilioSMS
