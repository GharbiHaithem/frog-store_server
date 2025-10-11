// backend/routes/email.route.js
const express = require('express');
const router = express.Router();
const sendEmail = require('../util/sendEmail'); // ton fichier nodemailer

// POST /api/send-pdf-email
router.post('/send-pdf-email', async (req, res) => {
  const { to, pdfUrl, subject } = req.body;

  if (!to || !pdfUrl) {
    return res.status(400).json({ error: 'Destinataire et URL du PDF requis' });
  }

  try {
    const htmlContent = `
      <h3>Voici votre facture</h3>
      <p>Vous pouvez télécharger votre facture en cliquant sur le lien ci-dessous :</p>
      <a href="${pdfUrl}" target="_blank">Télécharger le PDF</a>
    `;

    const info = await sendEmail({
      to,
      subject: subject || 'Votre facture',
      text: `Téléchargez votre facture ici : ${pdfUrl}`,
      html: htmlContent,
    });

    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
