const Banner = require('../models/banner')
const bannerCtrl= {
        createBanner: async (req, res, next) => {
          try {
      
            const {  images_banner} = req.body
      
            if (!images_banner) {
              return res.status(400).json({ error: "Le champ 'titre' est requis" });
            }
      
            const banner = new Banner({ images_banner })
            const bann = await banner.save()
            res.status(201).json(bann)
      
          } catch (error) {
            next(error)
          }
        },
 getBanner: async (req, res, next) => {
  try {
    const banners = await Banner.find();
    console.log(banners)
     return res.status(200).json(banners);
  } catch (error) {
    next(error)
  }
}

}

module.exports=bannerCtrl