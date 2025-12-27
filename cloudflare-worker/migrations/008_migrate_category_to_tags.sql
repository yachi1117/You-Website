-- 将现有论文的 category 添加到 tags 字段
-- category 到 tag 的映射：
-- special_issues -> special issues
-- immigrant_entrepreneurship -> immigrant entrepreneurship
-- migration_and_border -> migration and border studies
-- ethnic_studies -> ethnic studies
-- platform_studies -> platform studies
-- others -> others

UPDATE papers
SET tags = CASE
  WHEN category = 'special_issues' THEN 
    CASE 
      WHEN tags IS NULL OR tags = '' OR tags = '[]' THEN '["special issues"]'
      ELSE json_insert(tags, '$[#]', 'special issues')
    END
  WHEN category = 'immigrant_entrepreneurship' THEN
    CASE 
      WHEN tags IS NULL OR tags = '' OR tags = '[]' THEN '["immigrant entrepreneurship"]'
      ELSE json_insert(tags, '$[#]', 'immigrant entrepreneurship')
    END
  WHEN category = 'migration_and_border' THEN
    CASE 
      WHEN tags IS NULL OR tags = '' OR tags = '[]' THEN '["migration and border studies"]'
      ELSE json_insert(tags, '$[#]', 'migration and border studies')
    END
  WHEN category = 'ethnic_studies' THEN
    CASE 
      WHEN tags IS NULL OR tags = '' OR tags = '[]' THEN '["ethnic studies"]'
      ELSE json_insert(tags, '$[#]', 'ethnic studies')
    END
  WHEN category = 'platform_studies' THEN
    CASE 
      WHEN tags IS NULL OR tags = '' OR tags = '[]' THEN '["platform studies"]'
      ELSE json_insert(tags, '$[#]', 'platform studies')
    END
  WHEN category = 'others' THEN
    CASE 
      WHEN tags IS NULL OR tags = '' OR tags = '[]' THEN '["others"]'
      ELSE json_insert(tags, '$[#]', 'others')
    END
  ELSE tags
END
WHERE category IS NOT NULL;

-- 清理和规范化 tags（去重、排序）
-- 注意：SQLite 的 JSON 函数有限，这里使用一个简单的更新
-- 实际的去重和排序会在 API 层面处理

