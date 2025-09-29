const express =require('express')
const router = express.Router()
const {createProduct,getproduct,productByParentCategory,getProductById,searchProduct,getProductsByCategory}= require('../controllers/productCtrl')
router.post('/create-product', createProduct);
router.post('/products/by-category/:categoryId', productByParentCategory);

router.get('/products/:catid', getProductsByCategory);
router.get('/search/product', searchProduct);

router.get('/getAllProduct', getproduct);

router.get('/:productId', getProductById);


module.exports = router