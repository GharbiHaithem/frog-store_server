const express = require('express')
const morgan = require('morgan')
const app = express()
const dotenv = require('dotenv').config()
const PORT = process.env.PORT || 5000;
const cors = require('cors');
const uploadRoute = require('./routers/upload.route')
const productRoute = require('./routers/product.route')
const cartRoute = require('./routers/cart.router')
const authRoute = require('./routers/userRouter')
const brandRoute = require('./routers/brandRouter')
const commandeRoute = require('./routers/commande.route')
const bannerRoute = require('./routers/bannerRouter')
const { errorHandler, notFound } = require('./middlware/errorHandler')
const mongoose = require('mongoose');
const categoryRoute = require('./routers/categoryRouter')
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const cron = require('node-cron');
const axios = require('axios')
const fs  = require('fs')
const twilio = require('twilio');
const session = require('express-session');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);
const cookieParser = require('cookie-parser');
const path = require('path');
const emailRoute = require('./routers/email.router');
app.use(morgan("dev"))
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
mongoose.connect(
  process.env.MONGO_URI,
  {
    UseNewUrlParser: true,
    useUnifiedTopology: true,

  }

)
  .then(() => {
    // Supprimez l'index unique sur le champ 'email'

    console.log(`database connected succseffuly`)
  })

  .catch((err) => {
    console.log(`error connexion in database ${err}`)
  })
app.use(errorHandler)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// app.get('/api/message', (req, res) => {
//   res.json({ message: 'Hello from Node.js server!' });
// });
// cron.schedule('* * * * *', async () => {
//   try {
//     // Envoyer une requête HTTP GET à l'API React
//     await axios.get('http:/localhost:5000/api/message');
//     console.log('Requête envoyée chaque minute');
//   } catch (error) {
//     console.error('Erreur lors de l\'envoi de la requête:', error);
//   }
// });
// Configuration de Multer pour le stockage temporaire
// Configuration de multer pour un stockage temporaire local
const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    // Créer le répertoire 'uploads' s'il n'existe pas
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath); // Répertoire temporaire pour les fichiers
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Préserver le nom du fichier avec un timestamp
  }
});

const upload1 = multer({ storage: storage1 });

// Route pour uploader et envoyer le fichier à Cloudinary
app.post('/upload', upload1.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier téléchargé' });
  }

  console.log('Fichier reçu:', req.file);

  // Téléchargement du fichier vers Cloudinary
  cloudinary.uploader.upload(req.file.path, { resource_type: 'auto' }, (err, result) => {
    // Suppression du fichier temporaire après l'upload vers Cloudinary
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Erreur lors de la suppression du fichier temporaire:', unlinkErr);
        } else {
          console.log('Fichier temporaire supprimé avec succès');
        }
      });
    }

    if (err) {
      console.error('Erreur lors de l\'upload sur Cloudinary:', err);
      return res.status(500).json({ error: 'Erreur lors de l\'upload sur Cloudinary', details: err.message });
    }

    // Envoyer l'URL de l'image uploadée à Cloudinary au client
    res.json({ url: result.secure_url });
  });
});
app.use('/api', bannerRoute)
app.use('/api', cartRoute)
app.use('/api', categoryRoute)
app.use('/api', upload.array('images', 11), uploadRoute)
app.use('/api', productRoute)
app.use('/api', cartRoute)
app.use('/api', authRoute)
app.use('/api', commandeRoute)
app.use('/api', brandRoute)

app.post('/send-whatssap',(req,res)=>{
  const{phoneNumber,urlToSend} = req.body
  if(!phoneNumber || !urlToSend){
    return res.status(400).json("url ou numero manquant")
  }
  const whatsappLink = `https://api.whatsapp.com/send?phone=21622013583&text=Voici%20le%20lien%20:%20${encodeURIComponent(
    urlToSend
  )}`;
return res.json({ whatsappLink });
})
app.post('/send-whatsapp', (req, res) => {
  const { pdfUrl } = req.body;

  // Remplace ici par ton propre numéro WhatsApp, avec l'indicatif international
  const yourMobileNumber = 'whatsapp:+21622013583'; // Ton numéro de téléphone

  client.messages
    .create({
      body: `Here is your PDF: ${pdfUrl}`,
      from: 'whatsapp:+14155238886', // Twilio sandbox number
      to: yourMobileNumber, // Numéro de téléphone défini directement ici
    })
    .then((message) => res.json({ message: 'Message sent!', sid: message.sid }))
    .catch((error) => res.status(500).send('Error sending message'));
});
const sendMessage = async () => {
  try {
    const message = await client.messages.create({
      from: 'whatsapp:+14155238886',
      to: 'whatsapp:+21622013583',
      body: 'join flag-depend',
    });
    console.log('Message envoyé avec succès :', message.sid);
  } catch (error) {
    console.error('Erreur lors de l’envoi :', error.message);
  }
};
cron.schedule('38 22 * * *', () => {
  console.log('Envoi du message...');
  sendMessage();
});

app.use('/api', emailRoute);
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server is running at PORT 5000');
});

