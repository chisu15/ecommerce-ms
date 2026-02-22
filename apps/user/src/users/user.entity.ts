import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'full_name' })
  @Index()
  fullName!: string

  @Column({ unique: true })
  @Index({ unique: true })
  phone!: string

  @Column({ nullable: true })
  email?: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
