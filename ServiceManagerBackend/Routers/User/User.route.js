const express = require('express');
const router = express.Router();
const { User, validateAddUser } = require('../Modules/User.model'); // Assurez-vous que le chemin est correct
const { Agence } = require('../Modules/Agence.model'); // Assurez-vous que le chemin est correct
const bcrypt = require('bcrypt'); // Pour le hachage des mots de passe
const { validateAddUser } = require('../../Modules/User.model');
router.use(express.json());


/**
 * 
 */
router.post("/AddUser", async (req, res) => {
    try {
        const { error } = validateAddUser(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const VerifierUserExistant = await User.findOne({ where: { email: req.body.email } });
        if (VerifierUserExistant) {
            return res.status(400).json({ error: "Cet utilisateur existe déjà" });
        }
        const AddAgence = await Agence.findOne({ where: { id_agence: req.body.id_agence } });
        const salt = await bcrypt.genSalt(10); // Génération d'un sel pour le hachage
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const user = await User.create({
            nom: req.body.nom,
            prenom: req.body.prenom,
            email: req.body.email,
            password: hashedPassword,
            id_agence: req.body.id_agence, // Assurez-vous que cette valeur est fournie dans la requête                                                                                                                                                                                                                                                                                         
        });

    } catch (error) {

    }

});

/**
 * 
 */
router.get("/GetAllUsers", async (req, res) => {
    try {
        const users = await User.findAll({ include: [{ model: Agence, as: "agence" }] });
        return res.status(200).json(users);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
        return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }

});
/**
 * 
 */
router.get("/GetUserById/:id", async (req, res) => {
    try {
        const user = await User.findOne({ where: { id_user: req.params.id }, include: [{ model: Agence, as: "agence" }] });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur :', error);
        return res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
    }
});
/**
 * 
 */ // tester sur email
router.put("/UpdateUser/:id", async (req, res) => {
    try {
        const { error } = validateAddUser(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const user = await User.findOne({ where: { id_user: req.params.id } });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        let hashedPassword;
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10); // Génération d'un sel pour le hachage
            hashedPassword = await bcrypt.hash(req.body.password, salt);
        }
        else {
            hashedPassword = user.password; // Conserver l'ancien mot de passe si aucun nouveau mot de passe n'est fourni
        }
        await User.update({
            nom: req.body.nom,
            prenom: req.body.prenom,
            email: req.body.email,
            password: hashedPassword,
            id_agence: req.body.id_agence,
            role: req.body.role,
            cin: req.body.cin,
            date_naissance: req.body.date_naissance,

        }, { where: { id_user: req.params.id } });
        return res.status(200).json({ message: 'Utilisateur mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
        return res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
    }
});
/**
 * 
 */
router.delete("/DeleteUser/:id", async (req, res) => {
    try {
        const user = await User.findOne({ where: { id_user: req.params.id } });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        await User.destroy({ where: { id_user: req.params.id } });
        return res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur :', error);
        return res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
    }
});