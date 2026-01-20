import { resendClient, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "../emails/emailTemplates.js";

export const sendWelcomeEmail = async (email,name,clientURL) => {
    const {data,error} = await resendClient.emails.send({
        from:`${sender.name} <${sender.email}>`,
        to:email,
        subject:"Welcome to Chatify!",
        html: createWelcomeEmailTemplate(name,clientURL)
    });

    if(error){
        console.error(`Error sending welcome email to ${email}: ${error.message}`);
        throw new Error('Failed to send welcome email');
    }
    console.log(`Welcome email sent to ${email}: ${data.id}`);
}