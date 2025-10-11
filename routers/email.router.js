const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gharbi.haythem1988@gmail.com',
    pass: 'fgwrxppsrthxllxs',
  },
});

router.post('/send-pdf-email', async (req, res) => {
  const { to, pdfUrl, subject } = req.body;

  try {
    await transporter.sendMail({
      from: 'gharbi.haythem1988@gmail.com',
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

module.exports = router;
