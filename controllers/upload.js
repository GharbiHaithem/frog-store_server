const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: "dblkrot85",
    api_key: "786779564615498",
    api_secret: "0wDogjHc7uDzx7Rg847GEeC2Xu0"
})
const {cloudinarDeleteImg}= require('../util/cloudinary')
const uploadCtrl={
//  upload: async(req, res) => {
//     // Utilisez cloudinary.uploader.upload_stream pour télécharger l'image
//     const streamUpload = (fileBuffer) => {
//         return new Promise((resolve, reject) => {
//             const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
//                 if (error) {
//                     reject(error);
//                 } else {
//                     resolve({
//                         url:result.secure_url,
//                         asset_id:result.asset_id,
//                         public_id:result.public_id
//                     }) 
//                 }
//             });
//             stream.end(fileBuffer);
//         });
//     };

//     streamUpload(req.file.buffer)
//         .then(result => {
//             // Renvoyez l'URL de l'image téléchargée
//             console.log(result)
//             res.json({ url: result.url,public_id:result.public_id });
//         })
//         .catch(error => {
//             console.error('Erreur lors du téléchargement de l\'image sur Cloudinary :', error);
//             res.status(500).send('Erreur lors du téléchargement de l\'image sur Cloudinary.');
//         });
// }

upload: async (req, res) => {
    // Utilisez Promise.all() pour télécharger toutes les images en parallèle
    const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        url: result.secure_url,
                        assetId: result.asset_id,
                        publicId: result.public_id
                    });
                }
            });
            stream.end(file.buffer);
        });
    });

    try {
        const uploadResults = await Promise.all(uploadPromises);
        // Renvoyez les URLs des images téléchargées
        res.json(uploadResults);
    } catch (error) {
        console.error('Erreur lors du téléchargement de l\'image sur Cloudinary :', error);
        res.status(500).send('Erreur lors du téléchargement de l\'image sur Cloudinary.');
    }
},
deleteImages:async(req,res)=>{
    const { id } = req.params
    try {
     const deletedImg = cloudinarDeleteImg(id,"images") 
     res.json({message:"deleted success",id})
    } catch (error) {
      res.json({message:error.message})
    }
  }
}
module.exports = uploadCtrl