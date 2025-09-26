const {createUser,lastUser,login,updateUsera,addnewadress} =require('../controllers/user.ctrl')
const express= require('express')
const router = express.Router()

router.post('/signup',createUser)
router.put('/update/user/:userid',updateUsera)
 router.put('/add/adress/:userid',addnewadress)


router.post('/login',login)
router.get('/lastuser/get',lastUser)


module.exports = router