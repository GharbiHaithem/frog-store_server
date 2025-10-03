const {createBanner,getBanner} =require('../controllers/bannerCtrl')
const express= require('express')
const router = express.Router()

router.post('/createbanner',createBanner)
router.get('/banner',getBanner)

module.exports = router