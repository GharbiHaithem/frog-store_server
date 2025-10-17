const {createCommande,getCommande,getCommandeFromUser,commandeById,gettAllCommande} =require('../controllers/commandeCtrlr')
const express= require('express')
const router = express.Router()

router.post('/create-commande',createCommande)


router.get('/comande/all',gettAllCommande)
router.get('/getcommande/:commandeid',commandeById)

router.get('/commande/user/:userid',getCommandeFromUser)
router.get('/commande/:userid',getCommande)

module.exports = router