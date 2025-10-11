// backend/routes/email.route.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'noreply.frogstore@gmail.com', // compte dédié
    pass: 'fgwrxppsrthxllxs',            // mot de passe d’application
  },
});
router.post('/send-pdf-email', async (req, res) => {
  const { to, pdfUrl, subject } = req.body;

  try {
    await transporter.sendMail({
      from: 'noreply.frogstore@gmail.com',
      to,
      subject,
      html: `<p>Bonjour,</p><p>Voici votre facture :</p><a href="${pdfUrl}">${pdfUrl}</a>`,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur envoi:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
module.exports = router;
