const {createOrUpdateBanner,getBanner,deleteImageFromBanner} =require('../controllers/bannerCtrl')
const express= require('express')
const router = express.Router()

router.post('/createbanner',createOrUpdateBanner)
router.post('/banner/delete-img',deleteImageFromBanner)
router.get('/banner/get',getBanner)

module.exports = router