const Category = require('../models/category.model')
const categoryCtrl = {
      createCategory:async(req,res,next)=>{
            try {
               
               const {name} = req.body
               console.log(name)
               if (!name) {
                return res.status(400).json({ error: "Le champ 'name' est requis" });
              }
               console.log(name)
                const cat = new Category({name})
                const category = await cat.save()
                res.status(201).json(category)  
          
            } catch (error) {
                next(error)
            }
        },
        getCategory: async(req,res,next)=>{
            try {
               const  category = await Category.find({}).populate('subCategories', 'name') 
               res.status(200).json(category)  
            } catch (error) {
                  next(error)
            }
        },
        addSousCategory:async(req,res,next)=>{
            const { name } = req.body;
            const { catId } = req.params;
          
            try {
              // Créer une nouvelle sous-catégorie
              const newSubCategory = new Category({ name });
              await newSubCategory.save();
          
              // Trouver la catégorie parente et y ajouter la sous-catégorie
              const category = await Category.findById(catId);
              if (!category) {
                return res.status(404).json({ error: 'Category not found' });
              }
          
              category.subCategories.push(newSubCategory._id);
              await category.save();
          
              res.status(201).json(category);
            } catch (err) {
              res.status(500).json({ error: err.message });
            }
        },

        deleteCat:async(req,res,next)=>{
          const{catId} = req.params
          try {
            const category = await Category.findByIdAndDelete(catId)
            res.status(201).json(category)
          } catch (err) {
            res.status(500).json({ error: err.message });
          }
        },
        recupererCategoryParent: async(req,res,next)=>{
          try {
            const {subcatid} =  req.params
            const parentCat = await Category.findOne({subCategories:subcatid}).populate('subCategories')
            res.status(201).json(parentCat)
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
        }
}
module.exports = categoryCtrl