const express = require('express');
const router = express.Router();
const { Author, validateDataBody } = require('../Modules/user2.model'); // Assurez-vous que le chemin est correct

router.post('/Add_Author', async (req, res) => {
  try {
    const { error } = validateDataBody(req.body);

    if (error) {
      return res.status(400).json("Erreur :" + error.details[0].message);
      res.send(error);

    }
    try {
      await Author.sync(); // Crée la table si elle n'existe pas
      console.log('La table "Author" a été synchronisée avec succès.');
    } catch (error) {
      console.error('Erreur lors de la synchronisation de la table "Author" :', error);
    }
    const author = await Author.create({
      Nom: req.body.nom,
      Prenom: req.body.prenom,
      Date_NS: req.body.date_NS,
      Cin: req.body.Cin
    });
    res.status(201).json(author);
  } catch (error) {
    console.error('Erreur lors de la création de l\'auteur :', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'auteur' });
  }
});

router.get('/Get_Authors', async (req, res) => {
  try {
    const authors = await Author.findAll() ;// Récupère tous les auteurs depuis la base de données
    res.status(200).json(authors); // Envoie la liste des auteurs en réponse
  } catch (error) {
    console.error('Erreur lors de la récupération des auteurs :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des auteurs' });
  }
});

router.get('/Get_Author/:id', async (req, res) => {
  try {
    const author = await Author.findByPk(req.params.id); // Recherche de l'auteur par clé primaire
    if (author) {
      res.status(200).json(author); // Envoie l'auteur trouvé en réponse
    } else {
      res.status(404).json({ message: 'Auteur non trouvé' }); // Auteur non trouvé
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'auteur :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'auteur' });
  }
});


router.put('/Put_Author/:id', async (req, res) => {
  try {
    const [updatedRows] = await Author.update({
      Nom: req.body.nom,
      Prenom: req.body.prenom,
      Date_NS: req.body.date_NS,
      Cin: req.body.Cin
    }, {
      where: { id: req.params.id },
    });

    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Auteur non trouvé' });
    }

    // Récupérer l'auteur mis à jour
    const updatedAuthor = await Author.findByPk(req.params.id);
    res.status(200).json(updatedAuthor);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'auteur :', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'auteur' });
  }
});

router.delete('/Delete_Author/:id', async (req, res) => {
  try {
    const deletedRows = await Author.destroy({
      where: { Nom: req.params.id },
    });

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Auteur non trouvé' });
    }

    res.status(200).json({ message: 'Auteur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'auteur :', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'auteur' });
  }
});

router.get('/u', (req, res) => {
    res.send("hello");
})


module.exports = router;
