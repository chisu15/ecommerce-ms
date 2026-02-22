import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('stocks')
export class Stock {
  @PrimaryColumn({ name: 'product_id', type: 'uuid' })
  productId!: string

  @Column({ name: 'qty_available', type: 'int', default: 0 })
  qtyAvailable!: number

  @Column({ name: 'qty_reserved', type: 'int', default: 0 })
  qtyReserved!: number
}
