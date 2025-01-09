const express = require('express');
const router = express.Router();
const bdd = require('../config/bdd');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
// PUBLIC MEDIA = 1 >>> Photo uniquement pour les mariés //
// Configuration de Multer pour plusieurs fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../images")); // Chemin du dossier des images
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname).toLowerCase(); // Extension du fichier
        const baseName = path.basename(file.originalname, fileExtension); // Nom sans extension
        const uniqueName = `${baseName}_${Date.now()}_${Math.round(Math.random() * 1e9)}${fileExtension}`;
        cb(null, uniqueName); // Assigne un nom unique
    }
});

const upload = multer({ storage: storage });

// Route pour récupérer les images par leur nom
router.get("/images/:imageName", (req, res) => {
    res.sendFile(path.join(__dirname, "../images/" + req.params.imageName));
});

// Route pour uploader plusieurs photos
router.post('/upload', upload.array("files", 100), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
    }

    // Insérer chaque fichier dans la base de données
    const insertQuery = "INSERT INTO Media (NameMedia, PathMedia, PublicMedia, IdUser) VALUES (?, ?, ?, ?)";
    const userId = req.body.IdUser;

    req.files.forEach((file, index) => {
        const filePath = `/images/${file.filename}`; // Utilise le nom unique généré
        const publicMedia = req.body[`PublicMedia-${index}`] === '1' ? 1 : 0;

        bdd.query(insertQuery, [file.originalname, filePath, publicMedia, userId], (err) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
        });
    });

    res.status(200).json({
        message: "Files uploaded and database updated successfully!",
        files: req.files.map(file => file.filename)
    });
});

// route pour récupérer toutes les photos 


router.get("/PhotoPublique", (req, res) => {
  const getPhotoPublique = "SELECT Media.PathMedia, Media.IdMedia, Media.IdUser, Media.NameMedia ,User.NameUser FROM Media INNER JOIN User ON Media.IdUser = User.IdUser WHERE PublicMedia = 0";
  bdd.query(getPhotoPublique, (err, result) => {
      if(err) throw err;
      res.send(result);
  })
  
});

// Route pour récupérer toutes les photos privées

router.get("/PhotoPrivee", (req, res) => {
  const getPhotoPrivee = "SELECT Media.PathMedia, Media.IdMedia, Media.IdUser, Media.NameMedia ,User.NameUser FROM Media INNER JOIN User ON Media.IdUser = User.IdUser WHERE PublicMedia = 1";
  bdd.query(getPhotoPrivee, (err, result) => {
      if(err) throw err;
      res.send(result);
  })
});

module.exports = router;
