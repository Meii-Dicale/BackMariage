const express = require("express");
const app = express();
const cors = require('cors');


// import pour les routes // 
const CrudUser = require('./routes/CrudUser')
const CrudGuestBook = require('./routes/CrudGuestBook')
const CrudPhoto = require('./routes/CrudPhoto')
const CrudCommenaires = require('./routes/CrudCommenaires')
const CrudFavoris = require('./routes/CrudFavoris')

// MIDDLEWARE //
app.use(cors({
  origin: '*', // Autorise uniquement cette origine
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Liste des méthodes autorisées
  allowedHeaders: ['Content-Type', 'Authorization'], // Liste des en-têtes autorisés
}));
app.options('*', cors({ 
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));



app.use(express.json());


// CHEMIN //

app.use("/api/user", CrudUser );
app.use("/api/GuestBook", CrudGuestBook)
app.use("/api/Media", CrudPhoto)
app.use("/api/Commentaire", CrudCommenaires)
app.use("/api/Favoris", CrudFavoris)

// PORT D ECOUTE //
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
