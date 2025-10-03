const { generateToken, generateRefreshToken } = require('../config/jwtToken')
const User = require('../models/user.model')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')






const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')



const asyncHandler = require('express-async-handler')
const { connected } = require('process')



const userCtrl = {
    lastUser:async (req, res) => {
        try {
            const lastUser = await User.find().sort({ createdAt: -1 }).limit(1);
            if (lastUser.length === 0) {
                return res.status(404).json({ message: 'No users found' });
            }
            res.json(lastUser[0]);
        } catch (error) {
            console.error('Server Error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    createUser: async (req, res, next) => {

        try {
                    const user  = new User(req.body);
                    await user.save()
                    res.status(200).json({ message: 'user ajouté ',user });
                  } catch (error) {
                    res.status(500).json({ error: error.message });
                  }

    },
  
    login: async (req, res) => {
        const { email, password } = req.body

        const findUser = await User.findOne({ email })
        console.log(findUser)
       if (findUser  && (await findUser.IsPasswordMatched(password))) {
            const refreshToken = generateRefreshToken(findUser?._id)
            const updateUser = await User.findByIdAndUpdate(findUser._id, {
                refreshToken: refreshToken
            }, {
                new: true,
                upsert: true
            })
            res.cookie('token', 'eeee', {
                path: '/', // Assure que le cookie est disponible sur tout le site
                secure: false,
                httpOnly: false,
                maxAge: 24 * 60 * 60 * 1000
                
            });
            
            console.log(findUser)
            res.json({
                _id: findUser._id,
                firstname: findUser.firstname,
                lastname: findUser.lastname,
             
                adress: findUser.adress,
              
                connected:true,
                gender:findUser.gender,
                numtel:findUser.numtel
            })
        }

        else {
            res.status(500).json({ message: 'invalid credentials' })
        }
    },

    updateUsera: async (req, res, next) => {
        const { userid } = req.params;
        const {  adress ,numtel} = req.body;  // adressIndex est l'index de l'élément à modifier
      
        try {
          // Trouver l'utilisateur par son ID, mais sans supprimer les champs non spécifiés dans la mise à jour
        
          if (!mongoose.Types.ObjectId.isValid(userid)) {
            return res.status(400).json({ message: "ID utilisateur invalide" });
          }
          const user = await User.findByIdAndUpdate(
            userid,
            {
              $set: {
              
                adress: newAdressValue,  // met à jour l'élément à l'index donné
                numtel
              },
            },
            { new: true, runValidators: true }
          );
      
          if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
          }
      
          console.log(user);
          console.log(userid);
          console.log(req.body);
          
          res.status(200).json({ message: "Utilisateur mis à jour avec succès", user });
      
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
        }
      },
      
      addnewadress: async (req, res, next) => {
        const { codepostal, ville, pays, newAdress } = req.body;
        const { userid } = req.params;
    
        try {
            // Trouver l'utilisateur par son ID
            const user = await User.findById(userid);
    
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }
    
            // Si l'utilisateur a au moins deux adresses, remplacer la deuxième adresse
            if (user.adress.length >= 2) {
                user.adress[1] = newAdress;  // Écraser la deuxième adresse (index 1)
            } else {
                // Sinon, ajouter la nouvelle adresse à la fin de l'array
                user.adress.push(newAdress);
            }
    
            // Mettre à jour les autres champs comme le code postal, ville, pays
            user.codepostal = codepostal;
            user.ville = ville;
            user.pays = pays;
    
            // Sauvegarder les modifications
            await user.save();
    
            res.status(200).json({ message: "Adresse mise à jour avec succès", user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erreur lors de la mise à jour de l'adresse" });
        }
    },
    
    //get all users
    getAllUsers: async (req, res) => {
        try {

            let users = await User.find({}).populate("client")

          

            const filterUsers =  users.filter((x) => x.role === 'user')
            console.log({dddd:filterUsers})

              // Récupérez les données des clients pour chaque utilisateur
    
           return res.json(filterUsers)


        } catch (err) {
            res.json({ message: err.message })
        }
    },
    getaUser: async (req, res) => {
        try {

             const {id} = req.params

            const user = await User.findById(id).populate("client")

            if (user) {
                res.json(user)
            }
            else {
                res.json({ message: 'user not found' })
            }
        } catch (error) {
            res.json({ message: error.message })
        }
    },
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params
            const user = await User.findByIdAndDelete(id)
            if (user) {
                return res.json({ message: `user ${user.firstname + ' ' + user.lastname} deleted ` })
            } else {
                return res.json({ message: 'this user not exist ' })
            }
        } catch (error) {

        }
    },
    updateUser: async (req, res) => {
        try {
            const { _id } = req.user
            const salt = bcrypt.genSaltSync(10)
          const   hashedpassword = await bcrypt.hash(req.body.password,salt)
            const findUser = await User.findById(_id)
            if (!findUser) return res.json({ message: 'user not found' })
            const userUpdated = await User.findByIdAndUpdate(_id, {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                address: req.body.address,
                password : hashedpassword
            }, { new: true })

            res.json({
                message: `user ${req.body.firstname} updated `,
                userUpdated
            })
        } catch (error) {
            res.json({ message: error.message })
        }
    },
    blockUser: async (req, res) => {
        const { id } = req.params
        try {
            const blocked = await User.findByIdAndUpdate(id, {
                isBlocked: true
            }, { new: true })
            res.json({ message: 'user blocked success' })
        } catch (err) {
            res.json({ message: err.message })
        }
    },
    unblockUser: async (req, res) => {
        const { id } = req.params
        try {
            const user = await User.findById(id)
            if (user.isBlocked === false) return res.json({ message: `${user.firstname} already unblocked` })
            const unblocked = await User.findByIdAndUpdate(id, {
                isBlocked: false
            }, { new: true })


            res.json({ message: 'user unBlocked success' })
        } catch (err) {
            res.json({ message: err.message })
        }
    },
    updatePassword: async (req, res) => {
        const { _id } = req.user
        const { password } = req.body
      
        const user = await User.findById(_id)
        if (password) {
            user.password = password
            const updateUser = await user.save()
            res.json(updateUser)
        } else {
            res.json(user)
        }
    },
    forgotPasswordToken: async (req, res,next) => {
        const { email } = req.body

        const user = await User.findOne({ email })
        if (!user) res.status(500).json({ message: 'user not found with this email' })
        try {
            const token = await user.createPasswordResetToken()
            await user.save()
            const resetURL = `<html><head><style>p {
                font-size: 16px;
                color: gray;
                padding: 5px;
                
            }</style></head><body><p>Hi, Please follow this link to reset your password. This link will expire in 10 minutes from now <a href='http://localhost:3002/resetPassword/${token}'>click here</a></p></body></html>`;
            
            const data = {
                to: email,
                text: "Hey user",
                subject: "forgot password",
                htm: resetURL,
            }
           await sendEmail(data)
            res.json({ token, message: 'a validation link is sent to your email box' })
        } catch (err) {
            res.json(next)
        }
    },
    resetPassword: async (req, res) => {
        const { password } = req.body
        const { token } = req.params
        // const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        })

console.log({existUser:user})       
            if (!user) return res.status(500).json({ message: 'Token, Expired , Please try again later' })
        

        user.password = password
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save()
        res.json({user,message:"password changed successfuly "})

    },

  
 verifyPassword: async (req, res, next) => {
    try {
        const { _id } = req.user;
        const { oldpassword } = req.body;
        console.log(oldpassword);
        const findUser = await User.findOne({ _id }); // Utilisez un objet pour spécifier la recherche
        console.log(findUser?.password);
        
        if (findUser) {
            const verifyPassword = await bcrypt.compare(oldpassword, findUser.password);
            if (verifyPassword) {
                return res.status(200).json({ success: true });
            }
        }
        
        res.status(404).json({ success: false });
    } catch (error) {
        next(error);
    }
},

sendDetails: async (req, res,next) => {
    const { email,password } = req.body

   
    try {
        const user = await User.findOne({email})
        if(user){
            const resetURL = `<html><head><style>p {
                font-size: 16px;
                color: gray;
                padding: 5px;
                
            }</style></head><body><p>Hello ${user?.firstname + " " + user?.lastname} </p><br/>
            Your Email : ${email} <br/>
            Your Password  : ${password}<br/>

            </body></html>`;
            
            const data = {
                to: email,
                text: "Hey user",
                subject: "Send Detais Account",
                htm: resetURL,
            }
           await sendEmail(data).then((result)=>{
            console.log(result)
            if(result){
                user.emailSend = true
                user.isBlocked = false
                 user.save()
                res.json({ message: 'Send Details Success' })

            }
           }).catch((error)=>{
            if(error){
                res.status(500).json({message:"email Invalid"})
            }
           })
            
        }       
        
    } catch (err) {
        res.json(next)
    }
},


searchUsers:async(req,res)=>{

    try{
  
    const searchProduct = await User.find({
        $and: [
            {
                $or: [
                    { firstname: { $regex:  req.query.searchQuery, $options: 'i' } },
                    { lastname: { $regex:  req.query.searchQuery, $options: 'i' } }
                ]
            },
            { role: 'user' } // Filtre par le rôle "user"
        ]
     });

    res.status(200).json(searchProduct);  
    }
    catch(err){
    res.status(404).json({message:'somthing went rong'});
    }
 },



}
module.exports = userCtrl;