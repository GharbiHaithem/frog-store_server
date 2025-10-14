const express =require('express')
const router = express.Router()
const {createProduct,getproduct,productByParentCategory,getProductById,searchProduct,getProductsByCategory,deleteProductImage,updateProduct,filterProduct,deleteProduct}= require('../controllers/productCtrl')
router.post('/create-product', createProduct);
router.post('/products/by-category/:categoryId', productByParentCategory);
router.get('/filter/product', filterProduct);
router.get('/products/:catid', getProductsByCategory);
router.get('/search/product', searchProduct);

router.get('/getAllProduct', getproduct);

router.get('/:productId', getProductById);
router.delete('/:id', deleteProduct);
router.delete('/img/:id', deleteProductImage);

router.put('/:id', updateProduct);

module.exports = router