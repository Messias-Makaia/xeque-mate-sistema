/*
  Warnings:

  - You are about to drop the column `contaPaiId` on the `contas_contabeis` table. All the data in the column will be lost.
  - You are about to drop the column `naturezaResultado` on the `contas_contabeis` table. All the data in the column will be lost.
  - You are about to drop the column `atualizadoEm` on the `periodos_contabeis` table. All the data in the column will be lost.
  - You are about to drop the column `atualizadoporId` on the `periodos_contabeis` table. All the data in the column will be lost.
  - You are about to drop the column `criadoporId` on the `periodos_contabeis` table. All the data in the column will be lost.
  - You are about to drop the column `fechado` on the `periodos_contabeis` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `periodos_contabeis` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lancamentoId,contaContabilId]` on the table `itens_lancamento` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `exercicioId` to the `contas_contabeis` table without a default value. This is not possible if the table is not empty.
  - Made the column `exercicioId` on table `periodos_contabeis` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `contas_contabeis` DROP FOREIGN KEY `contas_contabeis_contaPaiId_fkey`;

-- DropForeignKey
ALTER TABLE `periodos_contabeis` DROP FOREIGN KEY `periodos_contabeis_atualizadoporId_fkey`;

-- DropForeignKey
ALTER TABLE `periodos_contabeis` DROP FOREIGN KEY `periodos_contabeis_criadoporId_fkey`;

-- DropForeignKey
ALTER TABLE `periodos_contabeis` DROP FOREIGN KEY `periodos_contabeis_exercicioId_fkey`;

-- DropIndex
DROP INDEX `contas_contabeis_contaPaiId_fkey` ON `contas_contabeis`;

-- DropIndex
DROP INDEX `periodos_contabeis_atualizadoporId_fkey` ON `periodos_contabeis`;

-- DropIndex
DROP INDEX `periodos_contabeis_criadoporId_fkey` ON `periodos_contabeis`;

-- DropIndex
DROP INDEX `periodos_contabeis_exercicioId_fkey` ON `periodos_contabeis`;

-- AlterTable
ALTER TABLE `contas_contabeis` DROP COLUMN `contaPaiId`,
    DROP COLUMN `naturezaResultado`,
    ADD COLUMN `contaPaiCodigo` VARCHAR(191) NULL,
    ADD COLUMN `exercicioId` VARCHAR(191) NOT NULL,
    ADD COLUMN `saldoAtual` DECIMAL(65, 30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `lancamentos_contabeis` ADD COLUMN `exercicioId` VARCHAR(191) NULL,
    ADD COLUMN `isSystemGenerated` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `moeda` VARCHAR(191) NOT NULL DEFAULT 'AOA',
    ADD COLUMN `tipoLancamento` ENUM('NORMAL', 'ESTORNO', 'ENCERRAMENTO', 'AJUSTE') NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE `periodos_contabeis` DROP COLUMN `atualizadoEm`,
    DROP COLUMN `atualizadoporId`,
    DROP COLUMN `criadoporId`,
    DROP COLUMN `fechado`,
    DROP COLUMN `tipo`,
    ADD COLUMN `status` ENUM('ABERTO', 'FECHADO', 'AGUARDANDO', 'REVISAO') NOT NULL DEFAULT 'AGUARDANDO',
    MODIFY `exercicioId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `roles` ADD COLUMN `atualizadoporId` VARCHAR(191) NULL,
    ADD COLUMN `criadoporId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `exercicios_fiscais` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `dataInicio` DATETIME(3) NOT NULL,
    `dataFim` DATETIME(3) NOT NULL,
    `fechado` BOOLEAN NOT NULL DEFAULT false,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `criadoporId` VARCHAR(191) NOT NULL,
    `atualizadoporId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saldos_historicos` (
    `id` VARCHAR(191) NOT NULL,
    `contaId` VARCHAR(191) NOT NULL,
    `periodoId` VARCHAR(191) NOT NULL,
    `saldoDebito` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `saldoCredito` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `saldoLiquido` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `saldos_historicos_contaId_periodoId_key`(`contaId`, `periodoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `demonstracoes_financeiras` (
    `id` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `periodoId` VARCHAR(191) NOT NULL,
    `dados` JSON NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `criadoporId` VARCHAR(191) NOT NULL,
    `periodoContabilId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `regras_encerramento` (
    `id` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `contaOrigem` VARCHAR(191) NOT NULL,
    `contaDestino` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoporId` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `contas_contabeis_exercicioId_tipo_idx` ON `contas_contabeis`(`exercicioId`, `tipo`);

-- CreateIndex
CREATE INDEX `itens_lancamento_contaContabilId_lancamentoId_idx` ON `itens_lancamento`(`contaContabilId`, `lancamentoId`);

-- CreateIndex
CREATE UNIQUE INDEX `itens_lancamento_lancamentoId_contaContabilId_key` ON `itens_lancamento`(`lancamentoId`, `contaContabilId`);

-- CreateIndex
CREATE INDEX `lancamentos_contabeis_data_periodoId_idx` ON `lancamentos_contabeis`(`data`, `periodoId`);

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `roles_criadoporId_fkey` FOREIGN KEY (`criadoporId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `roles_atualizadoporId_fkey` FOREIGN KEY (`atualizadoporId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contas_contabeis` ADD CONSTRAINT `contas_contabeis_contaPaiCodigo_fkey` FOREIGN KEY (`contaPaiCodigo`) REFERENCES `contas_contabeis`(`codigo`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contas_contabeis` ADD CONSTRAINT `contas_contabeis_exercicioId_fkey` FOREIGN KEY (`exercicioId`) REFERENCES `exercicios_fiscais`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercicios_fiscais` ADD CONSTRAINT `exercicios_fiscais_criadoporId_fkey` FOREIGN KEY (`criadoporId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercicios_fiscais` ADD CONSTRAINT `exercicios_fiscais_atualizadoporId_fkey` FOREIGN KEY (`atualizadoporId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `periodos_contabeis` ADD CONSTRAINT `periodos_contabeis_exercicioId_fkey` FOREIGN KEY (`exercicioId`) REFERENCES `exercicios_fiscais`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lancamentos_contabeis` ADD CONSTRAINT `lancamentos_contabeis_exercicioId_fkey` FOREIGN KEY (`exercicioId`) REFERENCES `exercicios_fiscais`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saldos_historicos` ADD CONSTRAINT `saldos_historicos_contaId_fkey` FOREIGN KEY (`contaId`) REFERENCES `contas_contabeis`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saldos_historicos` ADD CONSTRAINT `saldos_historicos_periodoId_fkey` FOREIGN KEY (`periodoId`) REFERENCES `exercicios_fiscais`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `demonstracoes_financeiras` ADD CONSTRAINT `demonstracoes_financeiras_periodoId_fkey` FOREIGN KEY (`periodoId`) REFERENCES `exercicios_fiscais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `demonstracoes_financeiras` ADD CONSTRAINT `demonstracoes_financeiras_criadoporId_fkey` FOREIGN KEY (`criadoporId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `demonstracoes_financeiras` ADD CONSTRAINT `demonstracoes_financeiras_periodoContabilId_fkey` FOREIGN KEY (`periodoContabilId`) REFERENCES `periodos_contabeis`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `regras_encerramento` ADD CONSTRAINT `regras_encerramento_criadoporId_fkey` FOREIGN KEY (`criadoporId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `lancamentos_contabeis` RENAME INDEX `lancamentos_contabeis_criadoporId_fkey` TO `lancamentos_contabeis_criadoporId_idx`;
