-- AlterTable
ALTER TABLE `member` ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `lastCheckIn` DATETIME(3) NULL,
    ADD COLUMN `membershipDuration` INTEGER NULL,
    ADD COLUMN `membershipPlan` VARCHAR(191) NULL,
    ADD COLUMN `membershipPrice` DOUBLE NULL,
    ADD COLUMN `notes` VARCHAR(191) NULL,
    ADD COLUMN `photo` VARCHAR(191) NULL,
    ADD COLUMN `qrCode` VARCHAR(191) NULL,
    ADD COLUMN `startDate` DATETIME(3) NULL,
    ADD COLUMN `status` VARCHAR(191) NULL;
