import { GridGenerator } from './GridGenerator'

// 测试网格生成器
function testGridGenerator() {
  console.group('测试 GridGenerator')
  
  // 测试用例1：6x6网格，4种颜色
  console.log('测试用例1: 6x6网格，4种颜色')
  const generator1 = new GridGenerator(6, 4)
  const grid1 = generator1.createGrid()
  validateTestCase(grid1, generator1.gridSize, generator1.blockTypes)
  
  // 测试用例2：7x7网格（应该会自动调整为6x6），5种颜色
  console.log('\n测试用例2: 7x7网格（应该会自动调整为6x6），5种颜色')
  const generator2 = new GridGenerator(7, 5)
  const grid2 = generator2.createGrid()
  validateTestCase(grid2, generator2.gridSize, generator2.blockTypes)
  
  // 测试用例3：8x8网格，3种颜色
  console.log('\n测试用例3: 8x8网格，3种颜色')
  const generator3 = new GridGenerator(8, 3)
  const grid3 = generator3.createGrid()
  validateTestCase(grid3, generator3.gridSize, generator3.blockTypes)
  
  console.groupEnd()
}

// 验证测试用例
function validateTestCase(grid, gridSize, blockTypes) {
  // 1. 验证网格大小
  console.log(`网格大小: ${gridSize}x${gridSize}`)
  console.log(`总方块数: ${gridSize * gridSize}`)
  
  // 2. 统计每种颜色的数量
  const colorCounts = new Array(blockTypes).fill(0)
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const block = grid[row][col]
      if (block && block.color >= 0 && block.color < blockTypes) {
        colorCounts[block.color]++
      }
    }
  }
  
  // 3. 验证结果
  console.log('每种颜色的数量:')
  let allEven = true
  let totalBlocks = 0
  colorCounts.forEach((count, color) => {
    console.log(`颜色 ${color}: ${count} 个${count % 2 === 0 ? ' ✓' : ' ✗'}`)
    if (count % 2 !== 0) allEven = false
    totalBlocks += count
  })
  
  // 4. 输出总结
  console.log('\n测试结果:')
  console.log(`- 总方块数是偶数: ${totalBlocks % 2 === 0 ? '✓' : '✗'}`)
  console.log(`- 每种颜色都是偶数个: ${allEven ? '✓' : '✗'}`)
  console.log(`- 验证${allEven && totalBlocks % 2 === 0 ? '通过' : '失败'} ✨`)
}

// 运行测试
testGridGenerator() 