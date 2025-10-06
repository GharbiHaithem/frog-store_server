const Product = require('../models/product.model')
const Cart = require('../models/cart');
const { v4: uuidv4 } = require('uuid');

const addToCart = async (cartUuid, productId, quantity, size) => {
  try {
    let cart;

    // Récupérer le panier existant
    if (cartUuid) {
      cart = await Cart.findOne({ uuid: cartUuid }).populate("items.product");
    }

    // Si aucun panier trouvé → créer un nouveau
    if (!cart) {
      cart = new Cart({ uuid: uuidv4(), items: [] });
    }

    // Vérifier que le produit existe
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Produit introuvable");
    }

    // Vérifier que la taille demandée existe
    const sizeIndex = product.sizes.findIndex(
      (s) => s.size.toUpperCase() === size.toUpperCase()
    );
    if (sizeIndex === -1) {
      throw new Error(`Taille ${size} non disponible`);
    }

    // Vérifier le stock disponible pour cette taille
    const availableStock = product.sizes[sizeIndex].quantity;
    if (availableStock < quantity) {
      throw new Error(`Stock insuffisant pour la taille ${size}`);
    }

    // Vérifier si le même produit + même taille est déjà dans le panier
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product._id.toString() === productId &&
        item.size.toUpperCase() === size.toUpperCase()
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, size });
    }

    // Diminuer le stock UNIQUEMENT pour la taille correspondante
    product.sizes[sizeIndex].quantity -= quantity;

    // Sauvegarder les modifications
    await product.save();
    await cart.save();

    return cart.uuid;
  } catch (error) {
    console.error("Erreur lors de l'ajout au panier:", error.message);
    throw error;
  }
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
  const { quantity, cartUuid, size } = req.body; // récupérer size aussi
  const { productId } = req.params;

  try {
    const newCartUuid = await addToCart(cartUuid, productId, quantity, size);

    res.status(200).json({ 
      message: 'Produit ajouté au panier', 
      cartUuid: newCartUuid 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},



 deleteItemFromCart : async (req, res) => {
  const session = await Cart.startSession();
  session.startTransaction();
  try {
    const { cartId } = req.params;
    const { productId, size } = req.body;

    // Récupérer le panier avec les produits
    const cart = await Cart.findById(cartId).populate('items.product').session(session);
    if (!cart) return res.status(404).json({ error: 'Panier non trouvé' });

    // Trouver l'item correspondant produit + taille
    const itemIndex = cart.items.findIndex(
      (it) => it.product._id.toString() === productId && it.size === size
    );
    if (itemIndex === -1) return res.status(404).json({ error: 'Produit non trouvé dans le panier pour cette taille' });

    const removedItem = cart.items[itemIndex];
    const quantityToRestore = Number(removedItem.quantity) || 0;

    if (quantityToRestore > 0) {
      // Restaurer la quantité pour la taille spécifique
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, "sizes.size": size },
        { $inc: { "sizes.$.quantity": quantityToRestore } },
        { new: true, session }
      );

      if (!updatedProduct) {
        console.warn('Produit introuvable ou taille invalide pour restauration du stock:', productId, size);
      }
    }

    // Supprimer l'item du panier
    cart.items.splice(itemIndex, 1);
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: 'Produit supprimé du panier et stock réajusté pour la taille',
      removedItem,
      cart
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Erreur deleteItemFromCart:', error);
    return res.status(500).json({ error: error.message });
  }
}




}

module.exports=cartCtrl
