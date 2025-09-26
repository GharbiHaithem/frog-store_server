const {addBrand,getAllBrands} =require('../controllers/brandCtr')
const express= require('express')
const router = express.Router()

router.post('/add-brand',addBrand)
router.get('/brands/get',getAllBrands)

module.exports = router