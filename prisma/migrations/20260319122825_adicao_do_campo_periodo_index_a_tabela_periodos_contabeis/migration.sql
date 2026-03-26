-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `criadoPor` VARCHAR(191) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `roles_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `recurso` VARCHAR(191) NOT NULL,
    `acao` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `permissions_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `user_roles_userId_roleId_key`(`userId`, `roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `id` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `permissionId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `role_permissions_roleId_permissionId_key`(`roleId`, `permissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contas` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` VARCHAR(191) NULL,
    `access_token` VARCHAR(191) NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` VARCHAR(191) NULL,
    `session_state` VARCHAR(191) NULL,

    UNIQUE INDEX `contas_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessoes` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sessoes_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tokens_verificacao` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tokens_verificacao_token_key`(`token`),
    UNIQUE INDEX `tokens_verificacao_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actorId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `beforeJson` JSON NULL,
    `afterJson` JSON NULL,
    `ip` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,

    INDEX `audit_logs_entity_entityId_idx`(`entity`, `entityId`),
    INDEX `audit_logs_actorId_idx`(`actorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contas_contabeis` (
    `id` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `natureza` VARCHAR(191) NOT NULL,
    `naturezaResultado` BOOLEAN NOT NULL DEFAULT false,
    `nivel` INTEGER NOT NULL,
    `contaPaiId` VARCHAR(191) NULL,
    `aceitaLancamento` BOOLEAN NOT NULL DEFAULT true,
    `ativa` BOOLEAN NOT NULL DEFAULT true,
    `criadaEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadaEm` DATETIME(3) NOT NULL,
    `criadoporId` VARCHAR(191) NOT NULL,
    `atualizadoporId` VARCHAR(191) NULL,
    `canceladoporId` VARCHAR(191) NULL,

    UNIQUE INDEX `contas_contabeis_codigo_key`(`codigo`),
    INDEX `contas_contabeis_codigo_idx`(`codigo`),
    INDEX `contas_contabeis_tipo_idx`(`tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `periodos_contabeis` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'MES',
    `dataInicio` DATETIME(3) NOT NULL,
    `dataFim` DATETIME(3) NOT NULL,
    `periodoIndex` INTEGER NOT NULL,
    `fechado` BOOLEAN NOT NULL DEFAULT false,
    `bloqueado` BOOLEAN NOT NULL DEFAULT false,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `exercicioId` VARCHAR(191) NULL,
    `criadoporId` VARCHAR(191) NOT NULL,
    `atualizadoporId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lancamentos_contabeis` (
    `id` VARCHAR(191) NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `documento` VARCHAR(191) NULL,
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'NORMAL',
    `totalDebito` DECIMAL(15, 2) NOT NULL,
    `totalCredito` DECIMAL(15, 2) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ATIVO',
    `observacoes` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `criadoporId` VARCHAR(191) NOT NULL,
    `periodoId` VARCHAR(191) NOT NULL,
    `lancamentoOriginalId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_lancamento` (
    `id` VARCHAR(191) NOT NULL,
    `lancamentoId` VARCHAR(191) NOT NULL,
    `contaContabilId` VARCHAR(191) NOT NULL,
    `codigoConta` VARCHAR(191) NOT NULL,
    `nomeConta` VARCHAR(191) NOT NULL,
    `debito` DECIMAL(15, 2) NOT NULL,
    `credito` DECIMAL(15, 2) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_criadoPor_fkey` FOREIGN KEY (`criadoPor`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contas` ADD CONSTRAINT `contas_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessoes` ADD CONSTRAINT `sessoes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contas_contabeis` ADD CONSTRAINT `contas_contabeis_contaPaiId_fkey` FOREIGN KEY (`contaPaiId`) REFERENCES `contas_contabeis`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contas_contabeis` ADD CONSTRAINT `contas_contabeis_criadoporId_fkey` FOREIGN KEY (`criadoporId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contas_contabeis` ADD CONSTRAINT `contas_contabeis_atualizadoporId_fkey` FOREIGN KEY (`atualizadoporId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contas_contabeis` ADD CONSTRAINT `contas_contabeis_canceladoporId_fkey` FOREIGN KEY (`canceladoporId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `periodos_contabeis` ADD CONSTRAINT `periodos_contabeis_exercicioId_fkey` FOREIGN KEY (`exercicioId`) REFERENCES `periodos_contabeis`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `periodos_contabeis` ADD CONSTRAINT `periodos_contabeis_criadoporId_fkey` FOREIGN KEY (`criadoporId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `periodos_contabeis` ADD CONSTRAINT `periodos_contabeis_atualizadoporId_fkey` FOREIGN KEY (`atualizadoporId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lancamentos_contabeis` ADD CONSTRAINT `lancamentos_contabeis_periodoId_fkey` FOREIGN KEY (`periodoId`) REFERENCES `periodos_contabeis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lancamentos_contabeis` ADD CONSTRAINT `lancamentos_contabeis_criadoporId_fkey` FOREIGN KEY (`criadoporId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lancamentos_contabeis` ADD CONSTRAINT `lancamentos_contabeis_lancamentoOriginalId_fkey` FOREIGN KEY (`lancamentoOriginalId`) REFERENCES `lancamentos_contabeis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_lancamento` ADD CONSTRAINT `itens_lancamento_lancamentoId_fkey` FOREIGN KEY (`lancamentoId`) REFERENCES `lancamentos_contabeis`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_lancamento` ADD CONSTRAINT `itens_lancamento_contaContabilId_fkey` FOREIGN KEY (`contaContabilId`) REFERENCES `contas_contabeis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
