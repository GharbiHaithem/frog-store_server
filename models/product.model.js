const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, required: true },
  images_product: [{}],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  prix: { type: Number, required: true },
  promotion: { type: Number, default: 0 },

  sizes: [
    {
      size: { type: String, required: true },
      quantity: { type: Number, default: 0 }, // quantité totale de la taille
      colors: [
        {
          color: { type: String, required: true },
          quantity: { type: Number, default: 0 } // quantité pour cette couleur
        }
      ]
    }
  ],

  selectedColor: String
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
