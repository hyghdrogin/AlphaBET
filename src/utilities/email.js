import sgMail from "@sendgrid/mail";
import config from "../config";

sgMail.setApiKey(config.SENDGRID_API_KEY);

const msg = {
  from: `AlphaBET <${config.SENDGRID_EMAIL}>`,
  mail_settings: { sandbox_mode: { enable: false } }
};

const messages = () => {
  msg.mail_settings.sandbox_mode.enable = true;
};
messages();

const sendEmail = async (email, subject, message) => {
  try {
    msg.to = email;
    msg.subject = subject;
    msg.text = message;
    await sgMail.send(msg);
    console.log("message sent...");
  } catch (err) {
    return err;
  }
};

export default sendEmail;
