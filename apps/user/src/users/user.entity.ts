import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
export type UserRole = 'USER' | 'ADMIN'
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20 })
  phone!: string

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string

  @Column({
    type: 'varchar',
    default: 'USER',
  })
  role!: UserRole

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
