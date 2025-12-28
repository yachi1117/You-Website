/**
 * 强制清理论文中的错误tags脚本（更彻底）
 * 移除没有空格的错误tags: migrationandborderstudies, immigrantentrepreneurship, 
 * ethnicstudies, platformstudies, other
 * 
 * 这个脚本会：
 * 1. 从所有论文的tags中移除这些错误的tags
 * 2. 确保即使category对应的tag是这些错误的tags，也会被移除
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

async function cleanPaperTagsForce() {
  try {
    console.log('开始强制清理论文tags...');
    console.log('将删除以下错误的tags:', INVALID_TAGS.join(', '));
    console.log('');
    
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
    console.log('');
    
    let updatedCount = 0;
    let totalRemoved = 0;
    
    // 2. 遍历每篇论文，强制清理tags
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
      
      // 记录原始tags
      const originalTags = [...tags];
      
      // 强制过滤掉所有错误的tags（不区分大小写）
      tags = tags.filter(tag => {
        const normalizedTag = String(tag).trim().toLowerCase();
        const shouldRemove = INVALID_TAGS.includes(normalizedTag);
        if (shouldRemove) {
          console.log(`  论文 ${paper.id}: 移除错误tag "${tag}"`);
          totalRemoved++;
        }
        return !shouldRemove;
      });
      
      // 如果有变化，更新论文
      if (tags.length !== originalTags.length) {
        console.log(`论文 ${paper.id} (${paper.title.substring(0, 50)}...): 清理了 ${originalTags.length - tags.length} 个错误tags`);
        console.log(`  原始tags: [${originalTags.join(', ')}]`);
        console.log(`  清理后tags: [${tags.join(', ')}]`);
        
        // 调用更新API，只更新tags字段（不再传递category字段）
        const updateRes = await fetch(`${API_BASE_URL}/api/admin/papers/${paper.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: paper.title,
            role: paper.role || null,
            journal: paper.journal || null,
            status: paper.status || 'published',
            issue: paper.issue || null,
            link: paper.link || null,
            year: paper.year || null,
            display_order: paper.display_order || 0,
            tags: tags, // 只传递清理后的tags
          }),
        });
        
        if (!updateRes.ok) {
          const errorText = await updateRes.text();
          console.error(`  更新失败: ${updateRes.status} ${errorText}`);
          continue;
        }
        
        updatedCount++;
        console.log(`  ✓ 成功更新论文 ${paper.id}`);
        console.log('');
      }
    }
    
    console.log('='.repeat(60));
    console.log(`清理完成！`);
    console.log(`  共检查了 ${papers.length} 篇论文`);
    console.log(`  更新了 ${updatedCount} 篇论文`);
    console.log(`  移除了 ${totalRemoved} 个错误的tags`);
    console.log('='.repeat(60));
    
    // 3. 验证清理结果
    console.log('');
    console.log('验证清理结果...');
    const verifyRes = await fetch(`${API_BASE_URL}/api/papers/tags`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
      },
    });
    
    if (verifyRes.ok) {
      const allTags = await verifyRes.json();
      const invalidTagsFound = allTags.filter(tag => 
        INVALID_TAGS.includes(tag.toLowerCase())
      );
      
      if (invalidTagsFound.length > 0) {
        console.warn(`⚠️  警告：仍然发现 ${invalidTagsFound.length} 个错误的tags:`, invalidTagsFound);
      } else {
        console.log('✅ 验证通过：所有错误的tags已被完全移除');
      }
    }
    
  } catch (error) {
    console.error('清理失败:', error);
    process.exit(1);
  }
}

// 运行清理脚本
cleanPaperTagsForce();

