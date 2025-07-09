app.get('/cv.pdf', (req, res) => {
  res.setHeader('Content-Disposition', 'inline');  // 强制在线查看
  res.setHeader('Content-Type', 'application/pdf');
  // 添加其他安全头
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  // 发送文件
  res.sendFile(path.join(__dirname, 'public', 'cv.pdf'));
}); 