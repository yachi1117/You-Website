/**
 * 修复论文category字段的错误值
 * 将错误的category值（如 migrationandborderstudies）修正为正确的值（如 migration_and_border）
 */

const API_BASE_URL = process.env.API_URL || 'https://you-website.ychen10001.workers.dev';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'your-secret-token';

// category修正映射
const CATEGORY_FIX_MAP = {
  'migrationandborderstudies': 'migration_and_border',
  'immigrantentrepreneurship': 'immigrant_entrepreneurship',
  'ethnicstudies': 'ethnic_studies',
  'platformstudies': 'platform_studies',
  'other': 'others',
};

async function fixPaperCategories() {
  try {
    console.log('开始修复论文category字段...');
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
    
    // 2. 遍历每篇论文，检查并修复category
    for (const paper of papers) {
      const currentCategory = (paper.category || '').trim().toLowerCase();
      const correctCategory = CATEGORY_FIX_MAP[currentCategory];
      
      if (correctCategory) {
        console.log(`论文 ${paper.id} (${paper.title.substring(0, 50)}...):`);
        console.log(`  当前category: "${paper.category}"`);
        console.log(`  修正为: "${correctCategory}"`);
        
        // 调用更新API
        const updateRes = await fetch(`${API_BASE_URL}/api/admin/papers/${paper.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: correctCategory,
            title: paper.title,
            role: paper.role || null,
            journal: paper.journal || null,
            status: paper.status || 'published',
            issue: paper.issue || null,
            link: paper.link || null,
            year: paper.year || null,
            display_order: paper.display_order || 0,
            tags: Array.isArray(paper.tags) ? paper.tags : [],
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
    console.log(`修复完成！`);
    console.log(`  共检查了 ${papers.length} 篇论文`);
    console.log(`  修复了 ${updatedCount} 篇论文的category字段`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('修复失败:', error);
    process.exit(1);
  }
}

// 运行修复脚本
fixPaperCategories();

