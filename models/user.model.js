const mongoose = require('mongoose')


const bcrypt = require('bcryptjs')

const crypto = require('crypto')
const UserSchema =new mongoose.Schema({
firstname:{
    type:String,
 
},
connected:Boolean,
lastname:{
    type:String,
 
},

entreprise:{
    type:String,
 
},
email:{
    type:String,
   
   
  
},
ville:String,
pays:String,
codepostal:String,
password:{
    type:String,
   
},


adress:[String],
numtel:String,


passwordNotHashed:{
    type:String,
    default: ''
},
gender:{type:String,required:false,default:"Masculin"},
passwordChangedAt:Date,
passwordResetToken:String,
passwordResetExpires:Date,
createdAt: {
    type: Date,
    default: Date.now,
}
 }     
,{
    timestamps:true
})
UserSchema.pre('save',async function(next){
    if(!this.isModified("password")){next()}
const salt = bcrypt.genSaltSync(10)
this.password = await bcrypt.hash(this.password,salt)
})
UserSchema.methods.IsPasswordMatched = async function(entryPassword){
    return await bcrypt.compare(entryPassword,this.password)
}
UserSchema.methods.createPasswordResetToken= async function(){
const resetToken = crypto.randomBytes(32).toString("hex")
this.passwordResetToken=resetToken

this.passwordResetExpires=Date.now() + 30 * 60 * 1000 // 10 minutes
return resetToken
}
module.exports = mongoose.model('User', UserSchema)