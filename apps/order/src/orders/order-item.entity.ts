import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Order } from './order.entity'

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Order, (o) => o.items, { onDelete: 'CASCADE' })
  order!: Order

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string

  @Column({ name: 'product_name_snapshot' })
  productNameSnapshot!: string

  @Column({ name: 'unit_price_snapshot', type: 'numeric' })
  unitPriceSnapshot!: string

  @Column({ type: 'int' })
  qty!: number

  @Column({ name: 'line_total', type: 'numeric' })
  lineTotal!: string
}
