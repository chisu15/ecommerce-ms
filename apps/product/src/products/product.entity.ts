import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  @Index()
  name!: string

  @Column({ unique: true })
  @Index({ unique: true })
  sku!: string

  @Column({ type: 'numeric' })
  price!: string

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date
}
