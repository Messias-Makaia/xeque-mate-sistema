/*
  Warnings:

  - You are about to drop the column `exercicioId` on the `contas_contabeis` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `contas_contabeis` DROP FOREIGN KEY `contas_contabeis_exercicioId_fkey`;

-- DropIndex
DROP INDEX `contas_contabeis_exercicioId_tipo_idx` ON `contas_contabeis`;

-- AlterTable
ALTER TABLE `contas_contabeis` DROP COLUMN `exercicioId`;

-- AlterTable
ALTER TABLE `periodos_contabeis` MODIFY `status` ENUM('ABERTO', 'FECHADO', 'AGUARDANDO', 'REVISAO', 'REPROCESSAMENTO') NOT NULL DEFAULT 'AGUARDANDO';
