const {createCommande,getCommande,getCommandeFromUser,commandeById,gettAllCommande,updateStatusCommande,deleteCommandeById} =require('../controllers/commandeCtrlr')
const express= require('express')
const router = express.Router()

router.post('/create-commande',createCommande)
router.put('/edit/status/:id',updateStatusCommande)

router.get('/comande/all',gettAllCommande)
router.get('/getcommande/:commandeid',commandeById)

router.get('/commande/user/:userid',getCommandeFromUser)
router.get('/commande/:userid',getCommande)
router.delete('/commande/:id',deleteCommandeById)
module.exports = router