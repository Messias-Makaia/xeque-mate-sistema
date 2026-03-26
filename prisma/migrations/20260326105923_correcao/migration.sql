/*
  Warnings:

  - You are about to drop the column `contaPaiCodigo` on the `contas_contabeis` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `contas_contabeis` DROP FOREIGN KEY `contas_contabeis_contaPaiCodigo_fkey`;

-- DropIndex
DROP INDEX `contas_contabeis_contaPaiCodigo_fkey` ON `contas_contabeis`;

-- AlterTable
ALTER TABLE `contas_contabeis` DROP COLUMN `contaPaiCodigo`,
    ADD COLUMN `contaPai` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `contas_contabeis` ADD CONSTRAINT `contas_contabeis_contaPai_fkey` FOREIGN KEY (`contaPai`) REFERENCES `contas_contabeis`(`codigo`) ON DELETE SET NULL ON UPDATE CASCADE;
