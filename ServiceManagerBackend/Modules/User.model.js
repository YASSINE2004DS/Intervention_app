const joi = require("joi");
const { sequelize, DataTypes } = require("../connectionDB/ConnectDb");
const jwt = require("jsonwebtoken");
const { Agence } = require("./Agence.model"); // Assurez-vous que le chemin est correct
require('dotenv').config(); // Charger les variables d'environnement depuis le fichier .env

/* Définir le modèle User
   Le modèle User représente la table "users" dans la base de données
   Il contient les champs id_user, nom, prenom, cin, email, password, date_naissance, role et id_agenc// Chaque champ a un type de données et certaines contraintes (comme allowNull, primaryKey, etc.)
   Le champ id_user est la clé primaire et est auto-incrémenté
   Le champ id_agence est une clé étrangère qui référence la table "agences"
   Le modèle est synchronisé avec la base de données pour s'assurer que la table existe
   et est à jour avec la définition du modèle

*/

const User = sequelize.define('User', {
    id_user: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    nom: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    prenom: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    cin: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date_naissance: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    role: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: 'user',
    },
    autorise:{
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
    id_agence: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
            model: 'agences', // Nom exact de la table référencée
            key: 'id_agence',
        },
    },
}, {
    tableName: 'users',
    timestamps: false,
});

// Synchroniser la table User avec la base de données
// (alter: true) pour mettre à jour la table si elle existe déjà
User.sync({ alter: false }).then(() => {
    console.log('La table "User" a été synchronisée avec succès.');
}).catch((error) => {
    console.error('Erreur lors de la synchronisation de la table "User" :', error);
});
User.belongsTo(Agence, {
    foreignKey: 'id_agence',
    as: 'agence',
});

// Définir l'association
User.prototype.generateToken = function () {
    // Créer un token JWT pour l'utilisateur
    // Le token contient l'ID de l'utilisateur et son rôle
    const token = jwt.sign({ id: this.id_user, role: this.role, }, process.env.JWT_SECRET);
    return token;
}

// Middleware pour valider les données d'inscription de l'utilisateur
const validateRegistreUser = (obj) => {
    // Définir le schéma de validation avec Joi
    // Le schéma définit les règles de validation pour chaque champ
    const schema = joi.object({
        nom: joi.string().max(255).required(),
        prenom: joi.string().max(255).required(),
        email: joi.string().email().required(),
        password: joi.string().required(),
    });
    return schema.validate(obj);
}

// Middleware pour valider les données de connexion de l'utilisateur
const validateLoginUser = (obj) => {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required(),
    });
    return schema.validate(obj);
}

// Middleware pour valider les données d'ajout d'utilisateur
const validateAddUser = (obj) => {
    const schema = joi.object({
        nom: joi.string().max(255).required(),
        prenom: joi.string().max(255).required(),
        email: joi.string().email().required(),
        password: joi.string().required(),
        cin: joi.string().max(255).required(),
        date_naissance: joi.date().iso(),
        role: joi.string().valid('user', 'admin').default('user'),
        id_agence: joi.number().integer(), // Assurez-vous que cette valeur est fournie dans la requête
    });
    return schema.validate(obj);
}

// Middleware pour valider les données de mise à jour de l'utilisateur
const validateUpdateUser = (obj) => {
    const schema = joi.object({
        nom: joi.string().max(255),
        prenom: joi.string().max(255),
        email: joi.string().email(),
        password: joi.string(),
        cin: joi.string().max(255),
        date_naissance: joi.date().iso(),
        role: joi.string().valid('user', 'admin').default('user'),
        id_agence: joi.number().integer(), // Assurez-vous que cette valeur est fournie dans la requête
    });
    return schema.validate(obj);
};

// Middleware pour vérifier le token d'authentification
const VerifierToken = (req, res, next) => {
    const token = req.headers.token; // Récupérer le token depuis les headers de la requête
    if (!token) {
        return res.status(401).json({ message: "Autoristion refusée" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Vérifier le token
    if (!decoded) {
        return res.status(401).json({ message: "Autoristion refusée" });
    } else {
        req.user = decoded; // Ajouter les informations de l'utilisateur décodées à la requête
        next(); // Passer au middleware suivant
    }
};

// Middleware pour vérifier si l'utilisateur est connecté ainsi l'autorisation de l'utilisateur
const AuthoriserUserAndAdmin = (req, res, next) => {
    VerifierToken(req, res, () => {
        if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès refusé" }); 
        }
        next(); // Passer au middleware suivant
    });
};

// Middleware pour vérifier si l'utilisateur est un administrateur
const AuthoriserAdmin = (req, res, next) => {
    VerifierToken(req, res, () => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès refusé" });
        }
        next(); // Passer au middleware suivant
    });
}

module.exports = {
    User, validateRegistreUser, validateLoginUser,
    validateAddUser, validateUpdateUser,
    AuthoriserUserAndAdmin, AuthoriserAdmin
};


