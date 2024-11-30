export function generateHintIcon() {
  // 生成一个简单的提示图标
  const canvas = wx.createOffscreenCanvas({ width: 32, height: 32 })
  const ctx = canvas.getContext('2d')
  
  // 绘制问号图标
  ctx.fillStyle = '#333'
  ctx.font = 'bold 24px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('?', 16, 16)
  
  // 转换为图片
  const tempFilePath = canvas.toTempFilePathSync({
    destWidth: 32,
    destHeight: 32
  })
  
  return tempFilePath
} 