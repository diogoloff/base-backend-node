CREATE TABLE `usuariostokenssessao` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`usuarioId` INT(11) NOT NULL,
	`token` TEXT NOT NULL COLLATE 'latin1_general_ci',
	`jti` VARCHAR(255) NULL DEFAULT NULL COLLATE 'latin1_general_ci',
	`criadoEm` DATETIME NOT NULL,
	`expiraEm` DATETIME NOT NULL,
	`revogado` TINYINT(1) NULL DEFAULT '0',
	`ipOrigem` VARCHAR(45) NULL DEFAULT NULL COLLATE 'latin1_general_ci',
	`userAgent` TEXT NULL DEFAULT NULL COLLATE 'latin1_general_ci',
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `usuarioId` (`usuarioId`) USING BTREE,
	CONSTRAINT `usuariostokenssessao_ibfk_1` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE
)
COLLATE='latin1_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=4
;
