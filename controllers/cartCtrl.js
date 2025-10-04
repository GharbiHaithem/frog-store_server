const Product = require('../models/product.model')
const Cart = require('../models/cart');
const { v4: uuidv4 } = require('uuid');

const addToCart = async (cartUuid, productId, quantity, size) => {
  try {
    let cart;

    if (cartUuid) {
      cart = await Cart.findOne({ uuid: cartUuid }).populate("items.product");
    }

    if (!cart) {
      cart = new Cart({ uuid: uuidv4(), items: [] });
    }

    // Vérifier si le produit existe
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Produit introuvable");
    }

    // Vérifier le stock disponible
    if (product.quantityStq < quantity) {
      throw new Error("Stock insuffisant");
    }

    // Vérifier si le même produit avec la même taille existe déjà dans le panier
    const productIndex = cart.items.findIndex(
      (item) =>
        item.product._id.toString() === productId &&
        item.size === size
    );

    if (productIndex > -1) {
      cart.items[productIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, size });
    }

    // Diminuer le stock du produit
    product.quantityStq -= quantity;
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

deleteItemFromCart: async (req, res, next) => {
  try {
    const { cartId } = req.params;
    const { productId } = req.body;
  console.log(productId)
    // Rechercher le panier par son ID
    const updateCart = await Cart.findById(cartId).populate('items.product');

    if (!updateCart) {
      return res.status(404).json({ error: 'Panier non trouvé' });
    }

    // Trouver l'index de l'item à supprimer
    const itemIndex = updateCart.items.findIndex(
      (it) => it.product._id.toString() === productId
    );

    if (itemIndex > -1) {
      // Récupérer le produit à supprimer
      const removedItem = updateCart.items[itemIndex];
      
      // Supprimer l'item du tableau `items`
      updateCart.items.splice(itemIndex, 1);
    
      // Sauvegarder les modifications
      await updateCart.save();

      // Retourner le produit supprimé avec le panier mis à jour
      res.status(200).json({ 
        message: 'Produit supprimé du panier', 
        removedItem: removedItem, 
        cart: updateCart 
      });
    } else {
      res.status(404).json({ error: 'Produit non trouvé dans le panier' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



}

module.exports=cartCtrl
