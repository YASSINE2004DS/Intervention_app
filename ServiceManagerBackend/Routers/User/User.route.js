const express = require('express');
const UserRouter = express.Router();
const { User, validateAddUser, validateUpdateUser, AuthoriserAdmin, AuthoriserUserAndAdmin } = require('../../Modules/User.model'); // Assurez-vous que le chemin est correct
const { Agence } = require('../../Modules/Agence.model'); // Assurez-vous que le chemin est correct
const bcrypt = require('bcrypt'); // Pour le hachage des mots de passe
UserRouter.use(express.json());


/**
   * @method POST
   * @description Ajouter un utilisateur
   * @param {string} nom - Nom de l'utilisateur
   * @param {string} prenom - Prénom de l'utilisateur
   *  @param {string} email - Email de l'utilisateur
   *  @param {string} password - Mot de passe de l'utilisateur
   *  @param {string} role - Rôle de l'utilisateur
   * @param {string} cin - CIN de l'utilisateur
   * @param {string} date_naissance - Date de naissance de l'utilisateur
   * @param {number} id_agence - ID de l'agence de l'utilisateur
   * @returns {object} - L'utilisateur créé
   * @throws {Error} - Erreur si l'utilisateur existe déjà ou si une erreur se produit lors de la création de l'utilisateur
   * @route /api/user
   * @access Public
 */
UserRouter.post("/", AuthoriserAdmin, async (req, res) => {
    try {
        const { error } = validateAddUser(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const VerifierUserExistant = await User.findOne({ where: { email: req.body.email } });
        if (VerifierUserExistant) {
            return res.status(400).json({ error: "Cet utilisateur existe déjà" });
        }
        // const AddAgence = await Agence.findOne({ where: { id_agence: req.body.id_agence } });
        const salt = await bcrypt.genSalt(10); // Génération d'un sel pour le hachage
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const user = await User.create({
            nom: req.body.nom,
            prenom: req.body.prenom,
            email: req.body.email,
            password: hashedPassword,
            id_agence: req.body.id_agence, // Assurez-vous que cette valeur est fournie dans la requête         
            role: req.body.role,
            cin: req.body.cin,
            date_naissance: req.body.date_naissance,
        });
        return res.status(201).json({ message: 'Utilisateur créé avec succès', user });

    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur :', error);
        return res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
    }

});

/**
   * @method GET
   * @description Récupérer tous les utilisateurs
   * @returns {object} - Liste des utilisateurs
   * @throws {Error} - Erreur si une erreur se produit lors de la récupération des utilisateursss
   * @route /api/user/all
   * @access Public
 */
UserRouter.get("/all", AuthoriserAdmin , async (req, res) => {
    try {
        const users = await User.findAll({ include: [{ model: Agence, as: "agence" }] });
        return res.status(200).json(users);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
        return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
    }

});

/**
    * @method GET
    * @description Récupérer un utilisateur par ID
    * @param {number} id - ID de l'utilisateur
    * @returns {object} - L'utilisateur trouvé
    * @throws {Error} - Erreur si l'utilisateur n'est pas trouvé ou si une erreur se produit lors de la récupération de l'utilisateur
    * @route /api/user/:id
    * @access Public
 */
UserRouter.get("/:id", AuthoriserUserAndAdmin, async (req, res) => {
    try {
        const user = await User.findOne({ where: { id_user: req.params.id }, include: [{ model: Agence, as: "agence" }] });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur :', error);
        return res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
    }
});

/**
    * @method PUT
    * @description Mettre à jour un utilisateur par ID
    * @param {number} id - ID de l'utilisateur
    * @param {string} nom - Nom de l'utilisateur
    * @param {string} prenom - Prénom de l'utilisateur
    * @param {string} email - Email de l'utilisateur
    * @param {string} password - Mot de passe de l'utilisateur
    * @param {string} role - Rôle de l'utilisateur
    * @param {string} cin - CIN de l'utilisateur
    * @param {string} date_naissance - Date de naissance de l'utilisateur
    * @param {number} id_agence - ID de l'agence de l'utilisateur 
    * @returns {object} - L'utilisateur mis à jour
    * @throws {Error} - Erreur si l'utilisateur n'est pas trouvé ou si une erreur se produit lors de la mise à jour de l'utilisateur
    * @route /api/user/:id
    * @access Public
 */
UserRouter.put("/:id", AuthoriserUserAndAdmin , async (req, res) => {
    try {
        const { error } = validateUpdateUser(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const user = await User.findOne({ where: { id_user: req.params.id } });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        if (req.body.email) {
            const VerifierExisteEmail = await User.findOne({ where: { email: req.body.email } });
            if (VerifierExisteEmail && VerifierExisteEmail.id_user !== user.id_user) {
                return res.status(400).json({ error: "Cet email est déjà utilisé par un autre utilisateur" });
            }
        }

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10); // Génération d'un sel pour le hachage
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }

        await User.update({
            nom: req.body.nom,
            prenom: req.body.prenom,
            email: req.body.email,
            password: req.body.password,
            id_agence: req.body.id_agence,
            role: req.body.role,
            cin: req.body.cin,
            date_naissance: req.body.date_naissance,

        }, { where: { id_user: req.params.id } });
        const updatedUser = await User.findOne({ where: { id_user: req.params.id } });
        return res.status(200).json({ message: 'Utilisateur mis à jour avec succès', updatedUser });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
        return res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
    }
});

/**
    * @method DELETE
    * @description Supprimer un utilisateur par ID
    * @param {number} id - ID de l'utilisateur
    * @returns {object} - Message de succès
    * @throws {Error} - Erreur si l'utilisateur n'est pas trouvé ou si une erreur se produit lors de la suppression de l'utilisateur
    * @route /api/user/:id
    * @access Public
 */
UserRouter.delete("/:id", AuthoriserAdmin, async (req, res) => {
    try {
        const user = await User.findOne({ where: { id_user: req.params.id } });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        await User.destroy({ where: { id_user: req.params.id } });
        return res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
    } catch (err) {
        console.error('Erreur lors de la suppression de l\'utilisateur :', err);
        return res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
    }
});
module.exports = UserRouter;