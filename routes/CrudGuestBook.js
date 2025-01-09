const express = require('express');
const router = express.Router();
const bdd = require('../config/bdd');
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config(); 
const SECRET_KEY = process.env.SECRET_KEY ;

// Ajouter un message au livre d'or


router.post("/AddMessage", (req, res) => {
    const createMessage = "INSERT INTO GuestBook (TextGuestBook, IdUser) VALUES (?,?)"
    bdd.query(createMessage, [req.body.TextGuestBook, req.body.IdUser], (err, result) => {
        console.log(req.body.TextGuestBook, req.body.IdUser)
        if(err) throw err;
        res.send({ message: "Message ajouté avec succès"});
    })

})

// récupérer tout les messages du Livre d'or
router.get("/GetMessages", (req, res) => {
const getMessages = "SELECT Guestbook.IdGuestbook, Guestbook.TextGuestBook, User.IdUser, User.NameUser, User.RelationUser FROM GuestBook INNER JOIN User ON GuestBook.IdUser = User.IdUser"
bdd.query(getMessages, (err, result) => {
    if(err) throw err;
    res.send(result);
})

})

// Modifier un message du Livre d'or
router.put("/ModifyMessage/:IdGuestbook", (req, res) => {
const modifyMessage = "UPDATE GuestBook SET TextGuestBook=? WHERE IdGuestbook=?"
bdd.query(modifyMessage, [req.body.TextGuestBook, req.params.IdGuestbook], (err, result) => {
    if(err) throw err;
    res.send({ message: "Message modifié avec succès"});
})

})

// Supprimer un message du Livre d'or
router.delete("/DeleteMessage/:IdGuestbook", (req, res) => {
const deleteMessage = "DELETE FROM GuestBook WHERE IdGuestbook=?"
bdd.query(deleteMessage, [req.params.IdGuestbook], (err, result) => {
    if(err) throw err;
    res.send({ message: "Message supprimé avec succès"});
})

})

module.exports = router