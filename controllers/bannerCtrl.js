const Banner = require('../models/banner')
const bannerCtrl= {
getBanner: async (req, res, next) => {
  try {
    const banners = await Banner.find();
    console.log('Bannières récupérées :', banners);

    if (!banners || banners.length === 0) {
      return res.status(404).json({ message: 'Aucune bannière trouvée' });
    }

    res.status(200).json(banners);
  } catch (error) {
    console.error('Erreur getBanner:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}
,

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


}

module.exports=bannerCtrl