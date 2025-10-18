
const Commande = require('../models/commande.model');

function generateOrderNumber(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}



const commandeCtrl = {
    createCommande: async (req, res, next) => {
        try {
            const commande = await Commande.create({ ...req.body, refCommande: generateOrderNumber(8) })
            await commande.save()
                const io = req.app.get('io');
            io.emit('newCommande', commande);
            res.status(201).json(commande)
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getCommande: async (req, res, next) => {

        try {
            const { userid } = req.params;

            // Trouver la dernière commande où le panier a `ordered` égal à `false`
            const commande = await Commande.findOne({ user: userid })
                .populate('user')
                .populate({
                    path: 'cart',

                    populate: {
                        path: 'items.product',
                        model: 'Product'
                    }
                })
                .sort({ createdAt: -1 }); // Trier par date de création, la plus récente en premier

            // Si aucune commande n'a été trouvée ou le panier est vide, retourner une erreur
            if (!commande || !commande.cart) {
                return res.status(404).json({ message: "Aucune commande avec un panier non ordonné n'a été trouvée." });
            }

            // Mettre à jour `ordered` à `true`
            commande.cart.ordered = true;
            await commande.cart.save(); // Sauvegarder le panier mis à jour

            // Renvoyer la commande mise à jour
            res.status(200).json({ message: 'La commande a été mise à jour.', commande });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }

    },
    getCommandeFromUser: async (req, res, next) => {
        const { userid } = req.params;
        try {
            console.log(userid);
            const cleanUserId = userid.trim();
            // Récupérer toutes les commandes d'un utilisateur et trier par date de création décroissante
            const commandeuser = await Commande.find({ user: cleanUserId }).sort({ createdAt: -1 }).populate({
                path: 'cart',

                populate: {
                    path: 'items.product',
                    model: 'Product'
                }
            }).populate('user')
            console.log(commandeuser);
            res.status(200).json(commandeuser);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    commandeById: async (req, res, next) => {
        const { commandeid } = req.params
        try {
            const commande = await Commande.findById(commandeid).populate('user').populate({
                path: 'cart',

                populate: {
                    path: 'items.product',
                    model: 'Product'
                }
            })
            res.status(200).json(commande);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    gettAllCommande: async (req, res) => {
        try {
            const commande = await Commande.find()
                .populate('user')
                .populate({
                    path: 'cart',
                    populate: {
                        path: 'items.product',
                        model: 'Product'
                    }
                })
                .sort({ createdAt: -1 }); // 🔹 tri décroissant par date
            const io = req.app.get('io');
            io.emit('newCommande', commande);
            res.status(200).json(commande);
        } catch (error) {
            console.error('❌ Erreur gettAllCommande:', error);
            res.status(500).json({ message: 'Erreur serveur', error: error.message });
        }
    }


}










module.exports = commandeCtrl
