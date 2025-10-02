const  mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
  
      images_banner:[{}]
})

module.exports =mongoose.model('Banner' , bannerSchema )
