USE phc_db;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments` (
  `id` VARCHAR(36) PRIMARY KEY,
  `participantId` VARCHAR(36) NOT NULL,
  `doctorId` VARCHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  `time` TIME,
  `status` ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  `notes` TEXT,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`participantId`) REFERENCES `participants`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctorId`) REFERENCES `doctors`(`id`) ON DELETE CASCADE
); 