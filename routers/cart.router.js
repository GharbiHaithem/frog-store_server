const {addToCart,cart,deleteItemFromCart,deleteCart} =require('../controllers/cartCtrl.js')
const express= require('express')
const router = express.Router()
router.get('/cart/:cartUuid',cart)
router.post('/add-to-cart/:productId',addToCart)

router.delete('/cart/remove/:cartUuid',deleteCart)
router.delete('/cart/:cartId',deleteItemFromCart)
module.exports = router