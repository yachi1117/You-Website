/**
 * 清理论文中的错误tags脚本
 * 移除没有空格的错误tags: migrationandborderstudies, immigrantentrepreneurship, 
 * ethnicstudies, platformstudies, other
 */

const API_BASE_URL = process.env.API_URL || 'https://you-website.ychen10001.workers.dev';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'your-secret-token';

// 需要移除的错误tags（没有空格的）
const INVALID_TAGS = [
  'migrationandborderstudies',
  'immigrantentrepreneurship',
  'ethnicstudies',
  'platformstudies',
  'other'
];

// 正确的tags映射（如果需要替换，可以在这里定义）
const CORRECT_TAG_MAP = {
  'migrationandborderstudies': 'migration and border studies',
  'immigrantentrepreneurship': 'immigrant entrepreneurship',
  'ethnicstudies': 'ethnic studies',
  'platformstudies': 'platform studies',
  'other': 'others',
};

async function cleanPaperTags() {
  try {
    console.log('开始清理论文tags...');
    
    // 1. 获取所有论文
    const listRes = await fetch(`${API_BASE_URL}/api/admin/papers`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
      },
    });
    
    if (!listRes.ok) {
      throw new Error(`获取论文列表失败: ${listRes.status}`);
    }
    
    const papers = await listRes.json();
    console.log(`找到 ${papers.length} 篇论文`);
    
    let updatedCount = 0;
    
    // 2. 遍历每篇论文，检查并清理tags
    for (const paper of papers) {
      let tags = paper.tags || [];
      
      // 确保tags是数组
      if (typeof tags === 'string') {
        try {
          tags = JSON.parse(tags);
        } catch (e) {
          console.warn(`论文 ${paper.id} tags解析失败，跳过`);
          continue;
        }
      }
      
      if (!Array.isArray(tags)) {
        tags = [];
      }
      
      // 检查是否有需要清理的tags
      const originalLength = tags.length;
      tags = tags.filter(tag => {
        const normalizedTag = String(tag).trim().toLowerCase();
        // 移除错误的tags（没有空格的）
        if (INVALID_TAGS.includes(normalizedTag)) {
          console.log(`  论文 ${paper.id}: 移除错误tag "${tag}"`);
          return false;
        }
        return true;
      });
      
      // 如果有变化，更新论文
      if (tags.length !== originalLength) {
        console.log(`论文 ${paper.id} (${paper.title}): 清理了 ${originalLength - tags.length} 个错误tags`);
        
        // 调用更新API
        const updateRes = await fetch(`${API_BASE_URL}/api/admin/papers/${paper.id}`, {
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
          const errorText = await updateRes.text();
          console.error(`  更新失败: ${updateRes.status} ${errorText}`);
          continue;
        }
        
        updatedCount++;
        console.log(`  ✓ 成功更新论文 ${paper.id}`);
      }
    }
    
    console.log(`\n清理完成！共更新了 ${updatedCount} 篇论文`);
    
  } catch (error) {
    console.error('清理失败:', error);
    process.exit(1);
  }
}

// 运行清理脚本
cleanPaperTags();

