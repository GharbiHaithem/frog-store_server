const {createBanner} =require('../controllers/bannerCtrl')
const express= require('express')
const router = express.Router()

router.post('/createbanner',createBanner)


module.exports = router