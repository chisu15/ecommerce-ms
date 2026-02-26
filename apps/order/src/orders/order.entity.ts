import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { OrderItem } from './order-item.entity'

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

@Entity('orders')
@Index(['customerPhone'])
@Index(['customerName'])
@Index(['status', 'createdAt'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'uuid' })
  customerId!: string

  @Column({ type: 'varchar' })
  customerName!: string

  @Column({ type: 'varchar' })
  customerPhone!: string

  @Column({ type: 'varchar', default: 'PENDING' })
  status!: OrderStatus

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  totalAmount!: string

  @OneToMany(() => OrderItem, (i) => i.order, { cascade: true })
  items!: OrderItem[]

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt!: Date
}
