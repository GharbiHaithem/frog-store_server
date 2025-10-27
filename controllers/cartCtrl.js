const Product = require('../models/product.model')
const Cart = require('../models/cart');
const { v4: uuidv4 } = require('uuid');


const addToCart = async (cartUuid, productId, quantity, size, color) => {
  let cart;

  // 🛒 Charger ou créer le panier
  if (cartUuid) {
    cart = await Cart.findOne({ uuid: cartUuid }).populate("items.product");
  }
  if (!cart) {
    cart = new Cart({ uuid: uuidv4(), items: [] });
  }

  // 🔎 Vérifier le produit
  const product = await Product.findById(productId);
  if (!product) throw new Error("Produit introuvable");

  // 🔹 Trouver la taille
  const sizeObj = product.sizes.find(
    (s) => s.size.toUpperCase() === size.toUpperCase()
  );
  if (!sizeObj) throw new Error(`Taille ${size} non disponible`);

  // 🔹 Trouver la couleur dans cette taille
  const colorObj = sizeObj.colors.find(
    (c) => c.color.toUpperCase() === color.toUpperCase()
  );
  if (!colorObj) throw new Error(`Couleur ${color} non disponible pour la taille ${size}`);

  // 🔹 Vérifier le stock pour cette couleur
  if (quantity > colorObj.quantity) {
    throw new Error(
      `Stock insuffisant pour ${color} (${size}) — disponible: ${colorObj.quantity}`
    );
  }

  // 🔹 Vérifier si l’article existe déjà dans le panier
  const existingItem = cart.items.find(
    (item) =>
      item.product._id.toString() === productId &&
      item.size?.toUpperCase() === size.toUpperCase() &&
      item.color?.toUpperCase() === color.toUpperCase()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity, size, color });
  }

  // 🔹 Réduire le stock de cette couleur
  colorObj.quantity -= quantity;

  // 🔹 Mettre à jour la quantité totale de la taille (optionnel)
  sizeObj.quantity = sizeObj.colors.reduce((sum, c) => sum + c.quantity, 0);

  await product.save();
  await cart.save();

  return cart.uuid;
};


const cartCtrl={
  deleteCart:async(req,res,next)=>{
    const{cartUuid} = req.params
    try {
      const deleteCart= await Cart.findOneAndDelete({uuid:cartUuid})
      console.log("carte deleted" , deleteCart)
      res.status(201).json(deleteCart)
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  cart:  async (req, res, next) => {
    const { cartUuid } = req.params;
    try {
      console.log('Démarrage de la récupération du panier...',cartUuid);
      console.log('Démarrage de la récupération du panier pour UUID:', cartUuid);
      const panier = await Cart.findOne({ uuid: cartUuid}).populate('items.product');
      console.log('Panier récupéré:', panier);
      return res.status(200).json(panier);
    } catch (error) {
      console.error('Erreur lors de la récupération du panier:', error);
      res.status(500).json({ error: error.message });
    }
  },
addToCart: async (req, res) => {
const { quantity, cartUuid, size, color } = req.body;
  const { productId } = req.params;

  try {
    const newCartUuid = await addToCart(cartUuid, productId, quantity, size, color);

    // Envoi socket (si activé)
    const io = req.app.get("io");
    if (io) {
      io.emit("addcart", newCartUuid);
      console.log("✅ Nouvelle commande envoyée via Socket.io");
    }

    res.status(200).json({
      message: "Produit ajouté au panier",
      cartUuid: newCartUuid
    });
  } catch (error) {
    console.error("❌ Erreur addToCart:", error.message);
    res.status(500).json({ error: error.message });
  }
},


deleteItemFromCart: async (req, res, next) => {
  try {
    const { cartId } = req.params;
    const { productId } = req.body; // plus besoin de size venant du front

    // Récupérer le panier (populé pour lire la quantité)
    const updateCart = await Cart.findById(cartId).populate('items.product');
    if (!updateCart) {
      return res.status(404).json({ error: 'Panier non trouvé' });
    }

    // Trouver l'item correspondant produit (peu importe la taille)
    const itemIndex = updateCart.items.findIndex(
      (it) => it.product._id.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Produit non trouvé dans le panier' });
    }

    const removedItem = updateCart.items[itemIndex];
    const quantityToRestore = Number(removedItem.quantity) || 0;
    const itemSize = removedItem.size; // taille récupérée directement du panier

    // Restaurer la quantité pour la taille spécifique
    if (quantityToRestore > 0) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, "sizes.size": itemSize },
        { $inc: { "sizes.$.quantity": quantityToRestore } },
        { new: true }
      );

      if (!updatedProduct) {
        console.warn('Produit introuvable ou taille invalide pour restauration du stock:', productId, itemSize);
      }
    }

    // Supprimer l'item du panier et sauvegarder
    updateCart.items.splice(itemIndex, 1);
    await updateCart.save();

    return res.status(200).json({
      message: 'Produit supprimé du panier et stock réajusté pour la taille',
      removedItem,
      cart: updateCart,
    });
  } catch (error) {
    console.error('Erreur deleteItemFromCart:', error);
    return res.status(500).json({ error: error.message });
  }
}


}

module.exports=cartCtrl
