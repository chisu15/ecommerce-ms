import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('stock_reservations')
@Index(['orderId'], { unique: true }) // idempotency key
export class StockReservation {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: string

  @Column({ type: 'jsonb' })
  items!: Array<{ productId: string; qty: number }>

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
