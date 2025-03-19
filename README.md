create database revivremonmariage;
use revivremonmariage;
create table User (IdUser INT PRIMARY KEY AUTO_INCREMENT, NameUser varchar(50) NOT
NULL, TelUser BIGINT NULL, MailUser varchar(100) NOT NULL, RoleUser BOOLEAN NOT NULL,
RelationUser varchar(50) NOT NULL, PasswordUser varchar(255) NOT NULL);
create table Media (IdMedia INT PRIMARY KEY AUTO_INCREMENT, NameMedia varchar(250)
NOT NULL, PathMedia varchar(250) NOT NULL, PublicMedia BOOLEAN NOT NULL, IdUser INT);
ALTER TABLE Media
ADD CONSTRAINT FK_IdUser
FOREIGN KEY (IdUser)
REFERENCES User(IdUser)
ON DELETE CASCADE
ON UPDATE CASCADE;
create table GuestBook (IdGuestBook INT PRIMARY KEY AUTO_INCREMENT, TextGuestBook
text not null, IdUser int);
ALTER TABLE GuestBook
ADD CONSTRAINT FK_IdUser_GuestBook
FOREIGN KEY (IdUser)
REFERENCES User(IdUser)
ON DELETE CASCADE
ON UPDATE CASCADE;
Create table Commentaires( IdCommentaire INT PRIMARY KEY AUTO_INCREMENT,
TextCommentaire varchar(250) NOT NULL, IdUser INT);
Alter TABLE Commentaires ADD CONSTRAINT FK_IdUser_Commentaires FOREIGN KEY (IdUser)
REFERENCES User(IdUser)
ON DELETE CASCADE
ON UPDATE CASCADE;
ALTER TABLE Commentaires add column IdMedia INT;
Alter TABLE Commentaires ADD CONSTRAINT FK_IdMedia_Commentaires FOREIGN KEY
(IdMedia)
REFERENCES Media(IdMedia)
ON DELETE CASCADE
ON UPDATE CASCADE;
CREATE TABLE Favoris (
IdFavoris INT AUTO_INCREMENT PRIMARY KEY,
IdUser INT NOT NULL,
IdMedia INT NOT NULL,
FOREIGN KEY (IdUser) REFERENCES User(IdUser),
FOREIGN KEY (IdMedia) REFERENCES Media(IdMedia)
);
