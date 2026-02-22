import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm'

export type OutboxStatus = 'PENDING' | 'PUBLISHED' | 'FAILED'

@Entity('outbox_events')
@Index(['status', 'createdAt'])
export class OutboxEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'aggregate_type' })
  aggregateType!: string // ORDER

  @Column({ name: 'aggregate_id' })
  aggregateId!: string // orderId

  @Column({ name: 'event_type' })
  eventType!: string // OrderCreated...

  @Column({ type: 'jsonb' })
  payload!: any

  @Column({ type: 'varchar', default: 'PENDING' })
  status!: OutboxStatus

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null
}
