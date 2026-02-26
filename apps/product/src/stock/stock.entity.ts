import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('stocks')
@Index(['productId'], { unique: true })
export class Stock {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'uuid' })
  productId!: string

  @Column({ type: 'int', default: 0 })
  availableQty!: number

  @Column({ type: 'int', default: 0 })
  reservedQty!: number

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt!: Date
}
