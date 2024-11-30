import { GridGenerator } from '../../src/utils/GridGenerator'

Page({
  data: {
    testResults: ''
  },

  onLoad() {
    this.runTests()
  },

  runTests() {
    wx.showLoading({ title: '正在测试...' })
    let allResults = ''
    
    try {
      // 测试用例1：6x6网格，4种颜色
      allResults += this.runTestCase(6, 4, '测试用例1: 6x6网格，4种颜色')
      
      // 测试用例2：7x7网格（应该会自动调整为6x6），5种颜色
      allResults += this.runTestCase(7, 5, '测试用例2: 7x7网格（应该会自动调整为6x6），5种颜色')
      
      // 测试用例3：8x8网格，3种颜色
      allResults += this.runTestCase(8, 3, '测试用例3: 8x8网格，3种颜色')
      
      this.setData({
        testResults: allResults
      })
    } catch (error) {
      console.error('测试过程中出现错误:', error)
      this.setData({
        testResults: '测试过程中出现错误: ' + error.message
      })
    } finally {
      wx.hideLoading()
    }
  },

  runTestCase(size, types, title) {
    let result = `\n${title}\n${'='.repeat(30)}\n`
    
    const generator = new GridGenerator(size, types)
    const grid = generator.createGrid()
    
    // 添加网格可视化
    result += '\n网格预览：\n'
    for (let row = 0; row < generator.gridSize; row++) {
      let rowStr = ''
      for (let col = 0; col < generator.gridSize; col++) {
        rowStr += ` ${grid[row][col].color} `
      }
      result += rowStr + '\n'
    }
    
    // 统计颜色
    const colorCounts = new Array(types).fill(0)
    for (let row = 0; row < generator.gridSize; row++) {
      for (let col = 0; col < generator.gridSize; col++) {
        const block = grid[row][col]
        if (block && block.color >= 0 && block.color < types) {
          colorCounts[block.color]++
        }
      }
    }
    
    // 验证结果
    result += '\n颜色统计：\n'
    let allEven = true
    let totalBlocks = 0
    colorCounts.forEach((count, color) => {
      result += `颜色 ${color}: ${count} 个 ${count % 2 === 0 ? '✓' : '✗'}\n`
      if (count % 2 !== 0) allEven = false
      totalBlocks += count
    })
    
    result += '\n验证结果：\n'
    result += `- 实际网格大小: ${generator.gridSize}x${generator.gridSize}\n`
    result += `- 总方块数: ${totalBlocks} ${totalBlocks % 2 === 0 ? '✓' : '✗'}\n`
    result += `- 所有颜色成对: ${allEven ? '✓' : '✗'}\n`
    result += `- 最终结果: ${allEven && totalBlocks % 2 === 0 ? '通过' : '失败'}\n`
    result += '\n'
    
    return result
  }
})
