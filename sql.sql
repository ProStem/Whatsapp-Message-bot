
CREATE DATABASE IF NOT EXISTS `whatsappbot` ;
USE `whatsappbot`;


CREATE TABLE IF NOT EXISTS `whatsapp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `phonenumber` text DEFAULT NULL,
  `chatid` text DEFAULT NULL,
  `date` text DEFAULT NULL,
  `messages` longtext NOT NULL,
  `resolved` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4;
