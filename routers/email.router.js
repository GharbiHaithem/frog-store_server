

const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // <-- mot de passe d’application
  },
});

router.post('/send-pdf-email', async (req, res) => {
  const { to, pdfUrl, subject } = req.body;

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html: `
        <p>Bonjour,</p>
        <p>Voici votre facture :</p>
        <a href="${pdfUrl}" target="_blank">${pdfUrl}</a>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur envoi:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
