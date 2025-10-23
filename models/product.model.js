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
        color: [String] , // ✅ Couleur associée à la taille
      quantity: { type: Number, default: 0 }
    }
  ],
  selectedColor:String
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
