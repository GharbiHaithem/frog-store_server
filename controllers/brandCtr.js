
const Brand = require('../models/brand');


const brandCtrl={
 
      addBrand:async (req, res) => {
            const { titre ,images_brand} = req.body; 
        
          
            try {
              const brand  = new Brand(req.body);
              await brand.save()
              res.status(200).json({ message: 'brand ajouté ',brand });
            } catch (error) {
              res.status(500).json({ error: error.message });
            }
},

getAllBrands: async (req, res, next) => {
  try {
    console.log('Fetching all brands...');
    const brands = await Brand.find({});
    console.log('Brands fetched:', brands);
    res.status(200).json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: error.message });
  }
}



}

module.exports=brandCtrl
