import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Order } from './order.entity'

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Order, (o) => o.items, { onDelete: 'CASCADE' })
  order!: Order

  @Column({ type: 'uuid' })
  productId!: string

  @Column({ type: 'varchar' })
  productNameSnapshot!: string

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  unitPriceSnapshot!: string

  @Column({ type: 'int' })
  qty!: number

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  lineTotal!: string
}
