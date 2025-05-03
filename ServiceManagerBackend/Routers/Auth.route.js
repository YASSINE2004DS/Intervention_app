const express = require('express');
const router = express.Router();
const { User, validateRegistreUser, validateLoginUser } = require('../Modules/User.model'); // Assurez-vous que le chemin est correct
const { Agence } = require('../Modules/Agence.model'); // Assurez-vous que le chemin est correct
const bcrypt = require('bcrypt'); // Pour le hachage des mots de passe
router.use(express.json());


router.post('/Register', async (req, res) => {
    try {
        // Validation des données d'entrée
        const { error } = validateRegistreUser(req.body);
        if (error) {
            return res.status(400).json({ message: "Erreur : " + error.details[0].message });
        }
        // Vérification de l'existence de l'utilisateur
        const userexiste = await User.findOne({ where: { email: req.body.email } });
        if (userexiste) {
            return res.status(400).json({ message: "Erreur : Ce compte existe déjà" });
        }
        // Création de l'utilisateur avec des valeurs par défaut pour les champs non fournis
        const salt = await bcrypt.genSalt(10); // Génération d'un sel pour le hachage
        const hashedPassword = await bcrypt.hash(req.body.password, salt); // Hachage du mot de passe
        const user = await User.create({
            nom: req.body.nom,
            prenom: req.body.prenom,
            email: req.body.email,
            password: hashedPassword,

        });
        const token = user.generateToken(); // Génération du token JWT
        //   res.header('x-auth-token', token); // Envoi du token dans l'en-tête de la réponse
        //  res.status(201).json({ user, token }); // Envoi de l'utilisateur et du token en réponse
        return  res.status(201).json({ token: token });
    } catch (error) {
        console.error('Erreur lors de la création de Compte :', error);
        return res.status(500).json({ message: 'Erreur lors de la création de Compte' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { error } = validateLoginUser(req.body);
        if (error) {
            return res.status(400).json({ message: "Erreur : " + error.details[0].message });
        }
        const userexiste = await User.findOne({ where: { email: req.body.email }, include: [{ model: Agence, as: "agence", }] }); // Vérification de l'existence de l'utilisateur
        if (!userexiste)
          return   res.status(400).json({ message: "Erreur : Mot  de passe ou email invalid" });

        const validatePassword = await bcrypt.compare(req.body.password, userexiste.password); // Vérification du mot de passe
        if (!validatePassword) {
            return res.status(400).json({ message:"Erreur : Mot  de passe ou email invalid"  });
        }
        const token = userexiste.generateToken(); // Génération du token JWT
        // res.header('x-auth-token', token); // Envoi du token dans l'en-tête de la réponse
        const { password, ...other } = userexiste.dataValues; // Exclusion du mot de passe des données renvoyées
        // res.status(200).json({ ...other, token }); // Envoi de l'utilisateur et du token en réponse
        return  res.status(201).json({ token: token });
    } catch (error) {
        console.error('Erreur lors de la connexion de l\'utilisateur :', error);
       return res.status(500).json({ message: 'Erreur lors de la connexion de l\'utilisateur' });

    }

});


module.exports = router;

