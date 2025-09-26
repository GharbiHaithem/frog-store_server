const express = require('express')
const router = express.Router()
const {upload,deleteImages} = require('../controllers/upload')
// const{authMiddleware}   = require('../config/authMiddlware')
router.post('/upload' , upload)
router.delete('/delete-img/:id',deleteImages)


module.exports = router