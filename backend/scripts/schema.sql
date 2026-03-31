-- 第六师兵团库房管理系统 - 数据库初始化脚本
-- 该脚本由Django migrations自动执行，此处仅作为备份参考

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `warehouse_db` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `warehouse_db`;

SET FOREIGN_KEY_CHECKS = 1;
