const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const bdd = require('../config/bdd');
    const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config(); 
const SECRET_KEY = process.env.SECRET_KEY ;
const nodemailer = require("nodemailer");
const MAILMDP = process.env.MAILMDP

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
router.get("/GetUser/:IdUser",(req, res) => {
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

// Envoie un mail de récupération de mdp

router.post("/SendMail", async (req, res) => {
    const queryUser = "SELECT * FROM User WHERE MailUser =?";
    bdd.query(queryUser, [req.body.MailUser], async (err, resultUser) => {
        if (err) throw err;
        if (resultUser.length === 0) {
            return res.status(401).json({ message: "Utilisateur non trouvé." });
        }
        
        const IdUser = resultUser[0].IdUser; // Récupération de l'ID utilisateur
        const token = jwt.sign({ IdUser }, SECRET_KEY, { expiresIn: '1h' }); // Génération du token sécurisé
        
        const resetLink = `http://${process.env.IP}/reset-password/${token}`; // URL contenant le token
        
        const transporter = nodemailer.createTransport({
            host: "ssl0.ovh.net",
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL,
                pass: process.env.MAILMDP
            }
        });
        
        async function main() {
            const info = await transporter.sendMail({
                from: process.env.MAIL,
                to: req.body.MailUser,
                subject: "Récupération de votre mot de passe",
                text: `Bonjour,\n\nVoici le lien pour réinitialiser votre mot de passe : ${resetLink}\n\nCe lien est valable pendant 1 heure.\n\nCordialement,\nL'équipe.`
            });
            
            console.log("Message sent: %s", info.messageId, resetLink);
            if (info.messageId) {
                return res.status(200).json({ message: "Mail envoyé" });
            }
        }
        
        main().catch(console.error);
    });
});

// changer le mot de passe 

router.put("/ResetPassword/:token", async (req, res) => {
    const IdUser = jwt.verify(req.params.token, SECRET_KEY).IdUser; 
   console.log(req.body)
   console.log(req.params.token)
    console.log(IdUser)
    const securedPassword = await bcrypt.hash(req.body.PasswordUser, 10); 
    
    const updatePassword = "UPDATE User SET PasswordUser=? WHERE IdUser=?"; 
    bdd.query(updatePassword, [securedPassword, IdUser], (err, result) => {
        if (err) throw err;
        res.send({ message: "Mot de passe changé avec succès" });
    });
});

module.exports = router