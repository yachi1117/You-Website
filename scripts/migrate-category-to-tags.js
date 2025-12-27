/**
 * 迁移脚本：将现有论文的 category 添加到 tags 字段
 * 
 * 使用方法：
 * export API_URL=https://you-website.ychen10001.workers.dev
 * export ADMIN_TOKEN=your-token
 * node scripts/migrate-category-to-tags.js
 */

const API_URL = process.env.API_URL || 'https://you-website.ychen10001.workers.dev';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

if (!ADMIN_TOKEN) {
  console.error('❌ 请设置 ADMIN_TOKEN 环境变量');
  process.exit(1);
}

// category 到 tag 的映射
const categoryToTag = (category) => {
  if (!category) return null;
  const cat = category.trim().toLowerCase();
  const mapping = {
    'special_issues': 'special issues',
    'immigrant_entrepreneurship': 'immigrant entrepreneurship',
    'migration_and_border': 'migration and border studies',
    'ethnic_studies': 'ethnic studies',
    'platform_studies': 'platform studies',
    'others': 'others',
  };
  if (mapping[cat]) return mapping[cat];
  const normalized = cat.replace(/[-_]/g, '_');
  if (mapping[normalized]) return mapping[normalized];
  return cat;
};

async function migrate() {
  try {
    console.log('📥 获取所有论文...');
    const res = await fetch(`${API_URL}/api/admin/papers`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`获取论文失败: ${res.status} ${text}`);
    }

    const papers = await res.json();
    console.log(`✅ 找到 ${papers.length} 篇论文`);

    let updated = 0;
    let skipped = 0;

    for (const paper of papers) {
      const categoryTag = categoryToTag(paper.category);
      if (!categoryTag) {
        skipped++;
        continue;
      }

      // 获取当前 tags
      let tags = [];
      try {
        tags = Array.isArray(paper.tags) ? paper.tags : (paper.tags ? JSON.parse(paper.tags) : []);
      } catch (e) {
        tags = [];
      }

      // 如果 tags 中还没有 category 对应的 tag，则添加
      if (!tags.includes(categoryTag)) {
        tags.push(categoryTag);
        tags.sort(); // 按字母顺序排序

        // 更新论文
        const updateRes = await fetch(`${API_URL}/api/admin/papers/${paper.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...paper,
            tags: tags,
          }),
        });

        if (!updateRes.ok) {
          const text = await updateRes.text();
          console.error(`❌ 更新论文 ${paper.id} 失败: ${text}`);
          continue;
        }

        updated++;
        console.log(`✅ 更新论文 ${paper.id}: 添加标签 "${categoryTag}"`);
      } else {
        skipped++;
      }
    }

    console.log(`\n✅ 迁移完成！`);
    console.log(`   - 更新: ${updated} 篇论文`);
    console.log(`   - 跳过: ${skipped} 篇论文（已有对应标签）`);
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    process.exit(1);
  }
}

migrate();

