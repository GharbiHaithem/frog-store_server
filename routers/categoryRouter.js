const express =require('express')
const router = express.Router()
const {createCategory,getCategory,addSousCategory,deleteCat,recupererCategoryParent}= require('../controllers/categoryCtrl')
router.post(`/create-category`,createCategory)
router.post('/categories/:catId/subcategories',addSousCategory)
router.delete('/category/:catId' ,deleteCat)
router.get(`/categories`,getCategory)
router.get(`/recuperer-cat-parent/:subcatid`,recupererCategoryParent)
module.exports = router