-- AlterTable
ALTER TABLE `lancamentos_contabeis` MODIFY `tipoLancamento` ENUM('NORMAL', 'ESTORNO', 'ENCERRAMENTO', 'AJUSTE', 'APURAMENTO', 'DISTRIBUICAO') NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE `periodos_contabeis` ADD COLUMN `atualizadoporId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `periodos_contabeis` ADD CONSTRAINT `periodos_contabeis_atualizadoporId_fkey` FOREIGN KEY (`atualizadoporId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
