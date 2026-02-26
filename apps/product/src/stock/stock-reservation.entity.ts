import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm'

type ReservationItem = { productId: string; qty: number }
type ReservationStatus = 'RESERVED'

@Entity('stock_reservations')
@Index(['orderId'], { unique: true })
export class StockReservation {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'uuid' })
  orderId!: string

  @Column({ type: 'jsonb' })
  items!: ReservationItem[]

  @Column({ type: 'varchar', default: 'RESERVED' })
  status!: ReservationStatus

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date
}
