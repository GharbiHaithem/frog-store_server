const cloudinary = require('cloudinary').v2;
const cloudinarDeleteImg = async(public_id)=>{
    return new Promise((resolve,reject)=>{
        cloudinary.uploader.destroy(public_id,(error,result)=>{
            if(error){
                reject(error)
            }else{
                resolve({
                    url:result.secure_url,
                    asset_id:result.asset_id,
                    public_id:result.public_id
                },{
                    resource_type:"auto"
                }) 
            }
           
        })
    })
}
module.exports = {cloudinarDeleteImg}