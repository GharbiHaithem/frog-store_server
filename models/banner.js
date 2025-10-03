const  mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
  images_banner: [{ type: String }]
});


module.exports =mongoose.model('Banner' , bannerSchema )
