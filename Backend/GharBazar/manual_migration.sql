USE ghar_bazar;

ALTER TABLE `users` ADD `email_otp` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;

ALTER TABLE `users` ADD `email_otp_expiry` datetime(6) NULL;

ALTER TABLE `users` ADD `is_email_verified` tinyint(1) NOT NULL DEFAULT FALSE;

-- Also mark the old duplicate migration as 'done' so it stops failing
INSERT IGNORE INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`) VALUES ('20260320031218_AddLatLngToProperties', '8.0.0');

-- Mark the new migration as 'done'
INSERT IGNORE INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`) VALUES ('20260322055316_AddEmailVerification', '8.0.0');
