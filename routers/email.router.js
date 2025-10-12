const express = require('express');
const router = express.Router();
const Mailjet = require('node-mailjet');
const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET
);

// POST /api/mail/send
router.post('/send', async (req, res) => {
  try {
    const { to, subject, pdfUrl } = req.body;

    if (!pdfUrl || !subject || !to) {
      return res.status(400).json({ message: 'Missing parameters' });
    }
console.log("Sending email with link:", pdfUrl);
const request = mailjet.post('send', { version: 'v3.1' }).request({
  Messages: [
    {
      From: {
        Email: "gharbi.haythem1988@gmail.com",
        Name: "Store Serigraphie"
      },
      To: [
        {
          Email: to,
          Name: "Client"
        }
      ],
      Subject: subject,
      TextPart: `Bonjour, voici votre PDF : ${pdfUrl}`,
      HTMLPart: `
        <div style="font-family:Arial,sans-serif;font-size:16px;color:#333">
          <h3>Bonjour 👋</h3>
          <p>Voici votre document PDF :</p>
          <p>
            <a href="${pdfUrl}" 
               style="color:#007bff;text-decoration:none;font-weight:bold"
               target="_blank">
               📄 Ouvrir le PDF
            </a>
          </p>
          <p>Merci pour votre confiance,<br/>Store Serigraphie</p>
        </div>
      `
    }
  ]
});

    const result = await request;
    res.json({ success: true, result: result.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
