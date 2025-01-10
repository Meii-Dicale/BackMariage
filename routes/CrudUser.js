const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const bdd = require('../config/bdd');
    const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config(); 
const SECRET_KEY = process.env.SECRET_KEY ;

////////////////////////////////////////////////////////////////////////
// L'authentication//
////////////////////////////////////////////////////////////////////////

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    console.log('token' + token);
    if (!token) return res.status(401).json({ error: 'Token manquant' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Stocke les données du token dans req.user
        next();
    } catch (err) {
        res.status(403).json({ error: 'Token invalide' });
        console.error(err);
    }
};

////////////////////////////////////////////////////////////////////////


// Creation d'un invité, par défaut le RoleUser est sur 0 = invité , admin = 1
 // on vérifi d'abord si le mail existe déjà 


router.post("/CreateUser", async (req, res) => {
    const securedPassword = await bcrypt.hash(req.body.PasswordUser, 10)
    const queryExisteMail = "SELECT * FROM User WHERE MailUser =?";
    bdd.query(queryExisteMail, [req.body.MailUser], (err, resultExisteMail) => {
        if (err) throw err;
        if (resultExisteMail.length > 0) {
            return res.status(400).json({ message: "Cet email existe déjà." });
            
        } else {
const createUser = "INSERT INTO User (NameUser, TelUser, MailUser, RoleUser, RelationUser, PasswordUser) VALUES (?,?,?,0,?,?)"
bdd.query(createUser, [req.body.NameUser, req.body.TelUser, req.body.MailUser, req.body.RelationUser, securedPassword], (err, result) => {
    if(err) throw err;
    res.send({ message: "User créé avec succès"});
})

}})})

// Modifier les informations d'un utilisateur (Pour le moment obligé de remettre toutes les informations)
router.put("/ModifyUser/:IdUser",authenticateToken, (req, res) => {
const modifyUser = "UPDATE User SET NameUser=?, TelUser=?, MailUser=?, RelationUser=? WHERE IdUser=?"
bdd.query(modifyUser, [req.body.NameUser, req.body.TelUser, req.body.MailUser, req.body.RelationUser, req.params.IdUser], (err, result) => {
    if(err) throw err;
    res.send({ message: "User modifié avec succès"});
})

})

// Supprimer un utilisateur (on récupère l'id quand on est connecté)
router.delete("/DeleteUser/:IdUser", authenticateToken,(req, res) => {
const deleteUser = "DELETE FROM User WHERE IdUser=?"
bdd.query(deleteUser, [req.params.IdUser], (err, result) => {
    if(err) throw err;
    res.send({ message: "User supprimé avec succès"});
})

})

// Récupérer les informations d'un utilisateur par son IdUser
router.get("/GetUser/:IdUser", authenticateToken,(req, res) => {
const getUser = "SELECT * FROM User WHERE IdUser=?"
bdd.query(getUser, [req.params.IdUser], (err, result) => {
    if(err) throw err;
    res.send(result);
})

})

// connecter les informations d'un utilisateur


router.post("/Login", async (req, res) => {
    const queryUser = "SELECT * FROM User WHERE MailUser =?";
    console.log(req.body.MailUser)
    console.log(req.body.PasswordUser)
    bdd.query(queryUser, [req.body.MailUser], async (err, resultUser) => {
        if (err) throw err;
        if (resultUser.length === 0) {
            return res.status(401).json({ message: "Utilisateur non trouvé." });
        }
        const match = await bcrypt.compare(req.body.PasswordUser, resultUser[0].PasswordUser);
        if (!match) {
            return res.status(401).json({ message: "Mot de passe incorrect." });
        }
        const token = jwt.sign({ 
            
            IdUser: resultUser[0].IdUser,
            NameUser: resultUser[0].NameUser,
            RoleUser: resultUser[0].RoleUser,
            RelationUser: resultUser[0].RelationUser,
            MailUser: resultUser[0].MailUser,
            TelUser: resultUser[0].TelUser

        }, SECRET_KEY, { expiresIn: '2h' });
        res.json({
            message: "Connexion réussie",
            token: token
        });
    });
});

module.exports = router