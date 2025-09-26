const express =require('express')
const router = express.Router()
const {createProduct,getproduct,productByParentCategory,getProductById,searchProduct}= require('../controllers/productCtrl')
router.post('/create-product', createProduct);
router.post('/products/by-category/:categoryId', productByParentCategory);
router.get('/search/product', searchProduct);

router.get('/getAllProduct', getproduct);

router.get('/:productId', getProductById);


module.exports = router