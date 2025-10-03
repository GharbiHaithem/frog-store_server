const {createBanner,getBanner} =require('../controllers/bannerCtrl')
const express= require('express')
const router = express.Router()
router.get('/banners',getBanner)
router.post('/createbanner',createBanner)


module.exports = router