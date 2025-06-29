CREATE TABLE `usuariostokens` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`usuarioId` INT(11) NOT NULL,
	`codigoToken` VARCHAR(36) NOT NULL COLLATE 'latin1_general_ci',
	`validadeToken` DATETIME NOT NULL,
	`usado` TINYINT(4) NOT NULL DEFAULT '0',
	`tipo` TINYINT(4) NOT NULL DEFAULT '0',
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `usuarioId` (`usuarioId`) USING BTREE,
	INDEX `codigoToken` (`codigoToken`) USING BTREE,
	CONSTRAINT `usuariostokens_ibfk_1` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE
)
COLLATE='latin1_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=17
;
