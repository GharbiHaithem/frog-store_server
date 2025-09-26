const  mongoose = require('mongoose')
const cartItemSchema = new mongoose.Schema({
      product:{type: mongoose.Schema.Types.ObjectId,ref:'Product'},
      quantity:{type: Number, default:1},
      size:String
})
const cartSchema = new mongoose.Schema({
      items:[cartItemSchema],
      ordered:{type: Boolean,
            default:false
      },
      uuid: {
            type: String, // UUID stocké sous forme de chaîne de caractères
            required: true, // Le champ doit être requis
            unique: true, // Chaque UUID doit être unique pour éviter les doublons
          },
})

module.exports =mongoose.model('Cart' , cartSchema )
