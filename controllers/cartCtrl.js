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
    const { productId } = req.body;

    // 🔹 1. Charger le panier
    const cart = await Cart.findById(cartId).populate('items.product');
    if (!cart) return res.status(404).json({ error: 'Panier non trouvé' });

    // 🔹 2. Trouver l'item correspondant dans le panier
    const itemIndex = cart.items.findIndex(
      (it) => it.product._id.toString() === productId
    );
    if (itemIndex === -1)
      return res.status(404).json({ error: 'Produit non trouvé dans le panier' });

    const removedItem = cart.items[itemIndex];
    const { size: itemSize, color: itemColor, quantity: qtyToRestore } = removedItem;

    // 🔹 3. Restaurer la quantité dans le produit
    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ error: 'Produit introuvable pour restauration' });

    // Trouver la taille concernée
    const sizeObj = product.sizes.find(
      (s) => s.size.toUpperCase() === itemSize.toUpperCase()
    );
    if (sizeObj) {
      // 🔸 Restaurer la quantité globale de la taille
      sizeObj.quantity += qtyToRestore;

      // 🔸 Trouver la couleur correspondante et la restaurer
      const colorObj = sizeObj.colors.find(
        (c) => c.color.toUpperCase() === itemColor.toUpperCase()
      );
      if (colorObj) {
        colorObj.quantity += qtyToRestore;
      } else {
        console.warn(
          `⚠️ Couleur ${itemColor} non trouvée dans la taille ${itemSize} du produit ${productId}`
        );
      }

      await product.save();
    } else {
      console.warn(
        `⚠️ Taille ${itemSize} non trouvée pour le produit ${productId}`
      );
    }

    // 🔹 4. Supprimer l'article du panier
    cart.items.splice(itemIndex, 1);
    await cart.save();

    // 🔹 5. Retourner la réponse
    return res.status(200).json({
      message: 'Produit supprimé du panier et stock restauré (taille + couleur)',
      removedItem,
      updatedProduct: product,
      updatedCart: cart,
    });
  } catch (error) {
    console.error('Erreur deleteItemFromCart:', error);
    return res.status(500).json({ error: error.message });
  }
}

,

}

module.exports=cartCtrl
