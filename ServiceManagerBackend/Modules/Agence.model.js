const joi = require("joi");
const { sequelize, DataTypes } = require("../connectionDB/ConnectDb");


const Agence = sequelize.define('Agence', {
    id_agence: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    Nom: {
        type: DataTypes.STRING(255),
        require: true,
        allowNull: false,
    },
    Adresse: {
        type: DataTypes.STRING,
    },
    Tel: {
        type: DataTypes.STRING,

    },
    Email: {
        type: DataTypes.STRING,

    },
    date_debut: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    date_fin: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
}, {
    tableName: 'agences',
    timestamps: false,
});
module.exports = { Agence };
