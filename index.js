const express = require("express");
const app = express();
const cors = require('cors');
const path = require('path');
const CrudUser = require('./routes/CrudUser')
const CrudGuestBook = require('./routes/CrudGuestBook')


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



app.use("/api/user", CrudUser );
app.use("/api/GuestBook", CrudGuestBook)


app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
