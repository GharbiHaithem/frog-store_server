const  mongoose = require('mongoose')

const brandSchema = new mongoose.Schema({
   titre:{type:String, required:true},
      images_brand:[{}]
})

module.exports =mongoose.model('Brand' , brandSchema )
