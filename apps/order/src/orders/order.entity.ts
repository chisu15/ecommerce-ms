import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { OrderItem } from './order-item.entity'

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

@Entity('orders')
@Index(['customerPhone', 'createdAt'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string

  @Column({ name: 'customer_name' })
  @Index()
  customerName!: string

  @Column({ name: 'customer_phone' })
  @Index()
  customerPhone!: string

  @Column({ type: 'varchar', default: 'PENDING' })
  status!: OrderStatus

  @Column({ name: 'total_amount', type: 'numeric', default: 0 })
  totalAmount!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @OneToMany(() => OrderItem, (i: OrderItem) => i.order, { cascade: true })
  items!: OrderItem[]
}
