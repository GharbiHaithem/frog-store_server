const Category = require('../models/category.model');
const Product = require('../models/product.model');

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
 const getProductsByParentCategory = async (parentCategoryId) => {
  try {
    // Récupérer toutes les sous-catégories
    const allCategoryIds = await getAllSubCategories(parentCategoryId);
    allCategoryIds.push(parentCategoryId); // Inclure la catégorie parente elle-même

    // Récupérer les produits associés à ces catégories
    const products = await Product.find({ category: { $in: allCategoryIds } });

    return products;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    throw error;
  }
};

// // Exemple d'utilisation
// const categoryId = 'ID_DE_LA_CATEGORIE_GAMING'; // Remplace par l'ID de la catégorie parente
// getProductsByParentCategory(categoryId)
//   .then((products) => console.log(products))
//   .catch((error) => console.error(error));
module.exports = getProductsByParentCategory