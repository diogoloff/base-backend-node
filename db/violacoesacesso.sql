CREATE TABLE `violacoesacesso` (
	`id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	`ip` VARCHAR(45) NULL DEFAULT NULL COLLATE 'latin1_general_ci',
	`userAgent` TEXT NULL DEFAULT NULL COLLATE 'latin1_general_ci',
	`rota` TEXT NULL DEFAULT NULL COLLATE 'latin1_general_ci',
	`metodo` VARCHAR(10) NULL DEFAULT NULL COLLATE 'latin1_general_ci',
	`motivo` TEXT NULL DEFAULT NULL COLLATE 'latin1_general_ci',
	`data` DATETIME NOT NULL,
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='latin1_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=5
;
