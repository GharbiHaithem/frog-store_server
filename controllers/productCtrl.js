const Product = require('../models/product.model');
const Category = require('../models/category.model');


// Fonction récursive pour récupérer toutes les sous-catégories
const getAllSubCategories = async (categoryId) => {
  const category = await Category.findById(categoryId).populate('subCategories');
  let subCategoryIds = category.subCategories.map((sub) => sub._id);

  for (let subCategory of category.subCategories) {
    const subSubCategories = await getAllSubCategories(subCategory._id);
    subCategoryIds = subCategoryIds.concat(subSubCategories);
  }

  return subCategoryIds;
};

// Fonction pour récupérer tous les produits d'une catégorie parente
const getProductsByParentCategory = async (parentCategoryId, page,limit,sort) => {
  try {
    // Récupérer toutes les sous-catégories
    const allCategoryIds = await getAllSubCategories(parentCategoryId);
    allCategoryIds.push(parentCategoryId); // Inclure la catégorie parente elle-même

    console.log(limit)
    const skip = (page - 1) * limit
    let sortOption = { titre: 1 }; // Tri par défaut
  if (sort) {
    // Vérifie si sort est une valeur valide
    if (sort === 'titre_asc') {
      sortOption = { titre: 1 };
    } else if (sort === 'titre_desc') {
      sortOption = { titre: -1 };
    } else if (sort === 'prix_asc') {
      sortOption = { prix: 1 };
    } else if (sort === 'prix_desc') {
      sortOption = { prix: -1 };
    } else {
      return res.status(400).json({ error: 'Critère de tri invalide' });
    }
  }
    // Récupérer les produits associés à ces catégories
    const products = await Product.find({ category: { $in: allCategoryIds } }).populate('category')
      .skip(skip)
      .limit(limit)
      .sort(sortOption)
    return products;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    throw error;
  }
};
const getAllProductsByParentCategory = async (parentCategoryId) => {
  try {
    // Récupérer toutes les sous-catégories
    const allCategoryIds = await getAllSubCategories(parentCategoryId);
    allCategoryIds.push(parentCategoryId); // Inclure la catégorie parente elle-même


    // Récupérer les produits associés à ces catégories
    const products = await Product.find({ category: { $in: allCategoryIds } }).populate('category')
    return products;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    throw error;
  }
};
const productCtrl = {
  createProduct: async (req, res, next) => {
    try {

      const { titre, description, images_product, category, prix, promotion, quantityStq ,sizes} = req.body

      if (!titre) {
        return res.status(400).json({ error: "Le champ 'titre' est requis" });
      }

      const product = new Product({ titre, description, category, images_product, prix, promotion, quantityStq,sizes })
      const prod = await product.save()
      res.status(201).json(prod)

    } catch (error) {
      next(error)
    }
  },
  getproduct: async (req, res, next) => {
    try {
      const product = await Product.find({}).populate('category', 'name')
      res.status(200).json(product)
    } catch (error) {
      next(error)
    }
  },
  productByParentCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const{titre,limit,sort} =req.body;
      console.log(titre)
      const page = req.query.page && !isNaN(req.query.page) ? parseInt(req.query.page) : 1;
      const limits = req.query.limit && !isNaN(req.query.limit) ? parseInt(req.query.limit) : 6;
      console.log({ sort })
      const products = await getProductsByParentCategory(categoryId, page,limit,sort);
      const totalproducts = await getAllProductsByParentCategory(categoryId);
      const totalProduct = totalproducts.length
      res.json({ products, totalProducts: Math.ceil(totalProduct / limits), currentPage: page,titre });
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },
  getProductById: async (req, res, next) => {
    try {
      const { productId } = req.params;

      // Find the product by its ID and populate the 'category' field
      const product = await Product.findOne({ _id: productId }).populate("category");
      console.log({ product })
      if (!product) {
        return res.status(404).json({ message: 'Produit non trouvé' });
      }

      // Return the found product with a 200 OK status
      res.status(200).json(product);
    } catch (error) {
      // Handle server errors with a 500 status
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },
  searchProduct: async (req, res, next) => {
    const { titre } = req.query;
    try {
      const produits = await Product.find({ titre: new RegExp(titre, 'i') }); // Recherche insensible à la casse
      res.json(produits);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  //   deleteCat:async(req,res,next)=>{
  //     const{catId} = req.params
  //     try {
  //       const category = await Category.findByIdAndDelete(catId)
  //       res.status(201).json(category)
  //     } catch (err) {
  //       res.status(500).json({ error: err.message });
  //     }
  //   }
}
module.exports = productCtrl