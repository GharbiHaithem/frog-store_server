const  mongoose = require('mongoose')

const commandeSchema = new mongoose.Schema({
      user:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
      cart:{type:mongoose.Schema.Types.ObjectId,ref:'Cart'},
      adress:String,
      ville:String,
      pays:String,
      payementMethode:String,
      codepostal:String,
      refCommande:String,
      size:String
      
},{
      timestamps:true
  })

module.exports =mongoose.model('Commande' , commandeSchema )
