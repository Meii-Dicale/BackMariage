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

// Route pour ajouter un commentaire

router.post("/AddComment", authenticateToken, (req, res) => {
    const createComment = "INSERT INTO Commentaires (TextCommentaire, IdUser, IdMedia) VALUES (?,?,?)"
    bdd.query(createComment, [req.body.TextCommentaire, req.body.IdUser, req.body.IdMedia], (err, result) => {
        if(err) throw err;  
        res.send(result);
    })
});

// récupérer les commentaires d'une photo avec le nom de l'utilisateur 

router.get("/GetComment/:IdMedia", (req, res) => {
    const getComment = "SELECT Commentaires.IdCommentaire, Commentaires.TextCommentaire, User.IdUser, User.NameUser, User.RelationUser FROM Commentaires INNER JOIN User ON Commentaires.IdUser = User.IdUser WHERE Commentaires.IdMedia=?"
    bdd.query(getComment, [req.params.IdMedia], (err, result) => {
        if(err) throw err;  
        res.send(result);
    })
});

// supprimer un commentaire

router.delete("/DeleteComment/:IdCommentaire", authenticateToken, (req, res) => {
    const deleteComment = "DELETE FROM Commentaires WHERE IdCommentaire=?"
    bdd.query(deleteComment, [req.params.IdCommentaire], (err, result) => {
        if(err) throw err;  
        res.status(200).json({ message: "Commentaire supprimé avec succès"});
    })
});

module.exports = router;