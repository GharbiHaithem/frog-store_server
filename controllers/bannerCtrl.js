const Banner = require('../models/banner');

const bannerCtrl = {
  // ➕ Créer une bannière
createOrUpdateBanner: async (req, res) => {
  try {
    const { images_banner } = req.body;

    if (!images_banner || images_banner.length === 0) {
      return res.status(400).json({ error: "Le champ 'images_banner' est requis" });
    }

    // Mettre à jour le premier Banner trouvé, sinon en créer un
    const banner = await Banner.findOneAndUpdate(
      {}, // filtre : on prend le premier document
      { $push: { images_banner: { $each: images_banner } } }, 
      { new: true, upsert: true } // new = renvoie la version mise à jour, upsert = crée si n’existe pas
    );

    res.status(200).json(banner);

  } catch (error) {
    console.error("Erreur createOrUpdateBanner:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}
,

  // 📥 Récupérer toutes les bannières
  getBanner: async (req, res) => {
    try {
      const banners = await Banner.find();
      console.log("Bannières récupérées:", banners);
      res.status(200).json(banners);
    } catch (error) {
      console.error("Erreur getBanner:", error);
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  },
  deleteImageFromBanner: async (req, res) => {
  try {
    const { publicId  } = req.body; // l’URL ou le nom de l’image à supprimer

    if (!publicId ) {
       return res.status(400).json({ error: "publicId requis" });
    }

    // On prend le premier Banner (puisque tu n’en veux qu’un seul)
    const banner = await Banner.findOneAndUpdate(
      {},
       { $pull: { images_banner: { publicId: publicId } } },
      { new: true } // retourne le document mis à jour
    );

    if (!banner) {
      return res.status(404).json({ error: "Aucune bannière trouvée" });
    }

    res.status(200).json(banner);

  } catch (error) {
    console.error("Erreur deleteImageFromBanner:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}

};

module.exports = bannerCtrl;
