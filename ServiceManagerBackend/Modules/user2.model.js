const joi = require("joi");
const { sequelize, DataTypes } = require("../connectionDB/ConnectDb");

const Author = sequelize.define('Author', {
  Nom: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      len: [5, 20],
    },
  },
  Prenom: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      len: [5, 20],
    },
  },
  Date_NS: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  Cin: {
    type: DataTypes.STRING(8),
    allowNull: false,
    validate: {
      len: [7, 8],
    },
  },
}, {
  timestamps: true,
});
const validateDataBody = (obj) => {
  const schema = joi.object({
    nom: joi.string().min(5).max(11).required(),
    prenom: joi.string().min(5).max(11).required(),
    date_NS: joi.string().pattern(new RegExp('^(19|20)[0-9]{2}-(0?[1-9]|1[012])-([1-9]|1[0-9]|2[0-9]|30|31)$')),
    Cin: joi.string().alphanum().min(7).max(8).required(),

  });
  return schema.validate(obj);
}

module.exports = { Author, validateDataBody };
