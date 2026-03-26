-- AlterTable
ALTER TABLE `users` ADD COLUMN `atualizadopor` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_atualizadopor_fkey` FOREIGN KEY (`atualizadopor`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
