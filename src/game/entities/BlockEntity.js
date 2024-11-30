import { Entity } from '../../core/base/Entity'
import { Logger } from '../../utils/Logger'

export class BlockEntity extends Entity {
  constructor(color, row, col) {
    super()
    this.color = color
    this.row = row
    this.col = col
    this.isSelected = false
    this.isMatched = false
    this.logger = new Logger('BlockEntity')
    this.logger.debug(`Created block: color=${color}, position=(${row},${col})`)
  }

  select() {
    this.isSelected = true
    this.logger.debug(`Selected block at (${this.row},${this.col})`)
  }

  deselect() {
    this.isSelected = false
    this.logger.debug(`Deselected block at (${this.row},${this.col})`)
  }

  match() {
    this.isMatched = true
    this.logger.debug(`Matched block at (${this.row},${this.col})`)
  }

  getPosition() {
    return { row: this.row, col: this.col }
  }

  toString() {
    return `Block(${this.row},${this.col},color=${this.color})`
  }
} 