const joi = require("joi");
const { sequelize, DataTypes } = require("../connectionDB/ConnectDb");
const jwt = require("jsonwebtoken");
const { Agence } = require("./Agence.model"); // Assurez-vous que le chemin est correct
require('dotenv').config(); // Charger les variables d'environnement depuis le fichier .env

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
    const token = jwt.sign({ id: this.id_user, role: this.role, }, process.env.JWT_SECRET);
    return token;
}


const validateRegistreUser = (obj) => {
    const schema = joi.object({
        nom: joi.string().max(255).required(),
        prenom: joi.string().max(255).required(),
        email: joi.string().email().required(),
        password: joi.string().required(),
    });
    return schema.validate(obj);
}

const validateAddUser = (obj) => {
    const schema = joi.object({
        nom: joi.string().max(255).required(),
        prenom: joi.string().max(255).required(),
        email: joi.string().email().required(),
        password: joi.string().required(),
        cin: joi.string().max(255),
        date_naissance: joi.date().iso(),
        role: joi.string().valid('user', 'admin').default('user'),

    });
    return schema.validate(obj);
}

const validateLoginUser = (obj) => {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required(),
    });
    return schema.validate(obj);
}
module.exports = { User, validateRegistreUser, validateLoginUser , validateAddUser };


