const nodemailer = require('nodemailer')
const sendEmail = (data) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
});

    transporter.sendMail({
      from: '"Hey !" <foo@example.com>',
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html,
    })
    .then((info) => {
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      resolve(info); // Résoudre la promesse avec les informations de réussite
    })
    .catch((error) => {
      console.error("Error sending email:", error);
      reject(error); // Rejeter la promesse en cas d'erreur
    });
  });
};

module.exports = sendEmail;