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
            // Création de la commande
            const commande = await Commande.create({
                ...req.body,
                refCommande: generateOrderNumber(8),
            });

            // Peupler la commande avant l’envoi socket
            const populatedCommande = await Commande.findById(commande._id)
                .populate('user')
                .populate({
                    path: 'cart',
                    populate: {
                        path: 'items.product',
                        model: 'Product',
                    },
                });

            // 🔥 Émission Socket.io vers tous les clients connectés
            const io = req.app.get('io');
            if (io) {
                io.emit('newCommande', populatedCommande);
                console.log('✅ Nouvelle commande envoyée via Socket.io');
            } else {
                console.warn('⚠️ io non trouvé sur req.app');
            }

            res.status(201).json(populatedCommande);
        } catch (error) {
            console.error('❌ Erreur création commande :', error);
            res.status(500).json({ error: error.message });
        }
    },

    getCommande: async (req, res, next) => {
        try {
            const { userid } = req.params;

            const commande = await Commande.findOne({ user: userid })
                .populate('user')
                .populate({
                    path: 'cart',
                    populate: {
                        path: 'items.product',
                        model: 'Product',
                    },
                })
                .sort({ createdAt: -1 });

            if (!commande || !commande.cart) {
                return res.status(404).json({ message: "Aucune commande avec un panier non ordonné n'a été trouvée." });
            }

            commande.cart.ordered = true;
            await commande.cart.save();

            res.status(200).json({ message: 'Commande mise à jour.', commande });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getCommandeFromUser: async (req, res, next) => {
        const { userid } = req.params;
        try {
            const cleanUserId = userid.trim();

            const commandeuser = await Commande.find({ user: cleanUserId })
                .sort({ createdAt: -1 })
                .populate({
                    path: 'cart',
                    populate: {
                        path: 'items.product',
                        model: 'Product',
                    },
                })
                .populate('user');

            res.status(200).json(commandeuser);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    commandeById: async (req, res, next) => {
        const { commandeid } = req.params;
        try {
            const commande = await Commande.findById(commandeid)
                .populate('user')
                .populate({
                    path: 'cart',
                    populate: {
                        path: 'items.product',
                        model: 'Product',
                    },
                });
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
                        model: 'Product',
                    },
                })
                .sort({ createdAt: -1 });
                  const io = req.app.get('io');
         
            res.status(200).json(commande);

        } catch (error) {
            console.error('❌ Erreur gettAllCommande:', error);
            res.status(500).json({ message: 'Erreur serveur', error: error.message });
        }
    },
};

module.exports = commandeCtrl;
