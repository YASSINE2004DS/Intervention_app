const express = require('express');
const app = express();
require('dotenv').config(); // Pour charger les variables d'environnement depuis le fichier .env
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3000' })); // Autoriser les requêtes depuis le frontend
app.use(express.json()); // Pour parser les requêtes JSON
const UserRoute = require('../Routers/User/User.route');
const AuthentificationRoute = require('../Routers/Auth.route');



// Vos routes ici
app.use("/api/user", UserRoute); // Route pour les utilisateurs
app.use("/auth", AuthentificationRoute);// Route pour l'authentification


app.listen(process.env.PORT, () => {
  console.log('Serveur démarré sur le port ', process.env.PORT);
});