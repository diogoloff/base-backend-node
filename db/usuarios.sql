CREATE TABLE `usuarios` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`nome` VARCHAR(30) NOT NULL COLLATE 'latin1_general_ci',
	`sobreNome` VARCHAR(30) NOT NULL COLLATE 'latin1_general_ci',
	`senhaHash` VARCHAR(100) NOT NULL COLLATE 'latin1_general_ci',
	`usuarioAdmin` TINYINT(4) NOT NULL DEFAULT '0',
	`email` VARCHAR(100) NOT NULL COLLATE 'latin1_general_ci',
	`dataCadastro` DATETIME NOT NULL,
	`ultimoAcesso` DATETIME NULL DEFAULT NULL,
	`ultimaAlteracao` DATETIME NULL DEFAULT NULL,
	`ativo` TINYINT(4) NOT NULL DEFAULT '1',
	`tema` VARCHAR(10) NULL DEFAULT NULL COLLATE 'latin1_general_ci',
	`avatar` BLOB NULL DEFAULT NULL,
	`banido` TINYINT(4) NOT NULL DEFAULT '0',
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `email` (`email`) USING BTREE
)
COLLATE='latin1_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=41
;
