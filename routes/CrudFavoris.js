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

// Ajouter une photo en favoris

router.post("/AddFavorite", (req, res) => {
    const checkFavorite = "SELECT IdFavoris FROM Favoris WHERE IdUser = ? AND IdMedia = ?";
    const createFavorite = "INSERT INTO Favoris (IdUser, IdMedia) VALUES (?, ?)";
    const deleteFavorite = "DELETE FROM Favoris WHERE IdFavoris = ?";

    bdd.query(checkFavorite, [req.body.IdUser, req.body.IdMedia], (err, result) => {
        if (err) {
            console.error("Erreur lors de la vérification des favoris :", err);
            return res.status(500).json({ message: "Erreur interne du serveur" });
        }

        // Vérification si la photo est déjà dans les favoris
        if (result.length > 0) {
            // Suppression de la photo des favoris
            bdd.query(deleteFavorite, [result[0].IdFavoris], (err) => {
                if (err) {
                    console.error("Erreur lors de la suppression des favoris :", err);
                    return res.status(500).json({ message: "Erreur interne du serveur" });
                }
                return res.status(200).json({ message: "Photo supprimée des favoris avec succès!" });
            });
        } else {
            // Ajout dans les favoris
            bdd.query(createFavorite, [req.body.IdUser, req.body.IdMedia], (err) => {
                if (err) {
                    console.error("Erreur lors de l'ajout aux favoris :", err);
                    return res.status(500).json({ message: "Erreur interne du serveur" });
                }
                return res.status(201).json({ message: "Photo ajoutée aux favoris avec succès !" });
            });
        }
    });
});



// Récupérer les photos en favoris d'un utilisateur

router.get("/GetUserFavorite/:IdUser", (req, res) => {
    const getUserFavorite = "SELECT Favoris.IdFavoris, Media.PathMedia, Media.IdMedia, Media.IdUser, Media.NameMedia ,User.NameUser, User.RoleUser FROM Media INNER JOIN User ON Media.IdUser = User.IdUser INNER JOIN Favoris ON Media.IdMedia = Favoris.IdMedia WHERE User.IdUser=? AND Favoris.IdUser =?"
    bdd.query(getUserFavorite, [req.params.IdUser, req.params.IdUser], (err, result) => {
        if(err) throw err;  
        res.send(result);
    })
});

// Enlever de ses favoris 

router.delete("/DeleteFavorite/:IdFavoris", authenticateToken, (req, res) => {
    const deleteFavorite = "DELETE FROM Favoris WHERE IdFavoris = ?"
    bdd.query(deleteFavorite, [req.params.IdFavoris], (err, result) => {
        if(err) throw err;  
        res.send(result);
    })
});

// chercher si la photo est en favoris 

router.get("/CheckFavorite/:IdUser/:IdMedia", (req, res) => {
    const checkFavorite = "SELECT * FROM Favoris WHERE IdUser =? AND IdMedia =?"
    bdd.query(checkFavorite, [req.params.IdUser, req.params.IdMedia], (err, result) => {
        if(err) throw err;  
        res.send(result);
    })
});


module.exports = router;