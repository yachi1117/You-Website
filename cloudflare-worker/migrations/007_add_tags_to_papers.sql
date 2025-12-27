-- 添加 tags 字段到 papers 表
-- tags 存储为 JSON 数组字符串，例如：["tag1", "tag2", "tag3"]

ALTER TABLE papers ADD COLUMN tags TEXT DEFAULT '[]';

-- 更新现有数据，确保所有 papers 都有 tags 字段（空数组）
UPDATE papers SET tags = '[]' WHERE tags IS NULL;

