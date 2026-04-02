-- wordmaster_database_init.sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS wordmaster DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wordmaster;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(100) NOT NULL COMMENT '密码（BCrypt加密）',
  `nickname` VARCHAR(50) COMMENT '昵称',
  `avatar` VARCHAR(200) COMMENT '头像URL',
  `created_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标志（0-未删除，1-已删除）',
  `version` INT DEFAULT 1 COMMENT '版本号（用于乐观锁）',
  INDEX `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 词库表
CREATE TABLE IF NOT EXISTS `dictionary` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT '词库名称',
  `description` TEXT COMMENT '词库描述',
  `category` VARCHAR(50) COMMENT '分类',
  `total_words` INT DEFAULT 0 COMMENT '总单词数',
  `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标志',
  `version` INT DEFAULT 1 COMMENT '版本号',
  INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='词库表';

-- 单词表
CREATE TABLE IF NOT EXISTS `word` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `word` VARCHAR(100) NOT NULL UNIQUE COMMENT '单词',
  `phonetic` VARCHAR(100) COMMENT '音标',
  `definition` TEXT COMMENT '释义',
  `example` TEXT COMMENT '例句',
  `difficulty` TINYINT DEFAULT 3 COMMENT '难度等级（1-5）',
  `dictionary_id` INT COMMENT '所属词库ID',
  `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标志',
  `version` INT DEFAULT 1 COMMENT '版本号',
  INDEX `idx_word` (`word`),
  INDEX `idx_dictionary` (`dictionary_id`),
  INDEX `idx_difficulty` (`difficulty`),
  FOREIGN KEY (`dictionary_id`) REFERENCES `dictionary`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='单词表';

-- 学习记录表
CREATE TABLE IF NOT EXISTS `study_record` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `word_id` INT NOT NULL COMMENT '单词ID',
  `mastery_level` TINYINT DEFAULT 1 COMMENT '掌握程度（1-5）',
  `last_review_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上次复习时间',
  `next_review_time` DATETIME COMMENT '下次复习时间',
  `review_count` INT DEFAULT 0 COMMENT '复习次数',
  `created_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标志',
  `version` INT DEFAULT 1 COMMENT '版本号',
  UNIQUE KEY `uk_user_word` (`user_id`, `word_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_word` (`word_id`),
  INDEX `idx_next_review` (`next_review_time`),
  INDEX `idx_user_review` (`user_id`, `next_review_time`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`word_id`) REFERENCES `word`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学习记录表';

-- 统计记录表
CREATE TABLE IF NOT EXISTS `stat_record` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `stat_date` DATE NOT NULL COMMENT '统计日期',
  `learned_count` INT DEFAULT 0 COMMENT '学习单词数',
  `reviewed_count` INT DEFAULT 0 COMMENT '复习单词数',
  `total_time` INT DEFAULT 0 COMMENT '总学习时间（分钟）',
  `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标志',
  `version` INT DEFAULT 1 COMMENT '版本号',
  UNIQUE KEY `uk_user_date` (`user_id`, `stat_date`),
  INDEX `idx_user_date` (`user_id`, `stat_date`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='统计记录表';

-- 插入初始词库数据
INSERT INTO `dictionary` (`name`, `description`, `category`, `total_words`) VALUES
('四级核心词汇', '大学英语四级考试核心词汇', 'CET4', 3000),
('六级核心词汇', '大学英语六级考试核心词汇', 'CET6', 3500),
('考研英语词汇', '研究生入学考试英语词汇', 'POSTGRADUATE', 5500),
('托福核心词汇', 'TOEFL考试核心词汇', 'TOEFL', 4000),
('雅思核心词汇', 'IELTS考试核心词汇', 'IELTS', 4500),
('商务英语词汇', '商务场景常用英语词汇', 'BUSINESS', 2000),
('日常口语词汇', '日常生活口语常用词汇', 'DAILY', 1500);

-- 插入示例单词数据
INSERT INTO `word` (`word`, `phonetic`, `definition`, `example`, `difficulty`, `dictionary_id`) VALUES
('abandon', '/əˈbændən/', 'v. 放弃，抛弃', 'He abandoned his car and continued on foot.', 3, 1),
('ability', '/əˈbɪləti/', 'n. 能力，才能', 'She has the ability to speak four languages.', 2, 1),
('abroad', '/əˈbrɔːd/', 'adv. 在国外，到国外', 'He studied abroad for two years.', 2, 1),
('absence', '/ˈæbsəns/', 'n. 缺席，不在', 'His absence from the meeting was noticed.', 3, 1),
('absolute', '/ˈæbsəluːt/', 'adj. 绝对的，完全的', 'I have absolute confidence in her.', 4, 1),
('absorb', '/əbˈzɔːrb/', 'v. 吸收，吸引', 'Plants absorb carbon dioxide.', 3, 1),
('abstract', '/ˈæbstrækt/', 'adj. 抽象的', 'Abstract ideas can be difficult to understand.', 4, 1),
('abundant', '/əˈbʌndənt/', 'adj. 丰富的，充裕的', 'The region has abundant natural resources.', 3, 1),
('academic', '/ˌækəˈdemɪk/', 'adj. 学术的，学院的', 'She has an academic background in physics.', 3, 1),
('accelerate', '/əkˈseləreɪt/', 'v. 加速，促进', 'The car accelerated quickly.', 4, 1),
('accept', '/əkˈsept/', 'v. 接受，认可', 'I accept your apology.', 1, 1),
('access', '/ˈækses/', 'n. 入口，通道；v. 访问', 'The building has wheelchair access.', 3, 1),
('accident', '/ˈæksɪdənt/', 'n. 事故，意外', 'He was injured in a car accident.', 2, 1),
('accommodate', '/əˈkɒmədeɪt/', 'v. 容纳，提供住宿', 'The hotel can accommodate 500 guests.', 4, 1),
('accompany', '/əˈkʌmpəni/', 'v. 陪伴，伴随', 'She accompanied me to the airport.', 3, 1),
('accomplish', '/əˈkʌmplɪʃ/', 'v. 完成，实现', 'We accomplished our mission successfully.', 3, 1),
('account', '/əˈkaʊnt/', 'n. 账户，描述；v. 解释', 'I need to check my bank account.', 3, 1),
('accumulate', '/əˈkjuːmjəleɪt/', 'v. 积累，积聚', 'Dust had accumulated on the furniture.', 4, 1),
('accurate', '/ˈækjərət/', 'adj. 准确的，精确的', 'The measurements must be accurate.', 3, 1),
('accuse', '/əˈkjuːz/', 'v. 指责，控告', 'He was accused of stealing the money.', 3, 1);

-- 创建测试用户（密码：test123）
INSERT INTO `user` (`username`, `password`, `nickname`) VALUES
('testuser', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTV5UiC', '测试用户'),
('student', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTV5UiC', '学生用户'),
('teacher', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTV5UiC', '教师用户');

-- 创建学习记录示例
INSERT INTO `study_record` (`user_id`, `word_id`, `mastery_level`, `last_review_time`, `next_review_time`, `review_count`) VALUES
(1, 1, 3, NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR), 2),
(1, 2, 4, NOW(), DATE_ADD(NOW(), INTERVAL 72 HOUR), 1),
(1, 3, 2, NOW(), DATE_ADD(NOW(), INTERVAL 6 HOUR), 3),
(1, 4, 5, NOW(), DATE_ADD(NOW(), INTERVAL 168 HOUR), 1),
(2, 1, 3, NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR), 1),
(2, 5, 2, NOW(), DATE_ADD(NOW(), INTERVAL 6 HOUR), 2);

-- 创建统计记录示例
INSERT INTO `stat_record` (`user_id`, `stat_date`, `learned_count`, `reviewed_count`, `total_time`) VALUES
(1, CURDATE(), 10, 15, 45),
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 8, 12, 40),
(1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 12, 18, 55),
(1, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 6, 10, 30),
(1, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 15, 20, 60),
(2, CURDATE(), 5, 8, 25),
(2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 7, 10, 35);

-- 创建索引以提高查询性能
CREATE INDEX idx_word_difficulty ON word(difficulty);
CREATE INDEX idx_study_user_time ON study_record(user_id, last_review_time);
CREATE INDEX idx_stat_user ON stat_record(user_id);