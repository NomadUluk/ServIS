import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('menu_items')
export class MenuItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ name: 'cost_price', type: 'decimal', precision: 10, scale: 2 })
    costPrice: number;

    @Column({ name: 'image_url', type: 'text', nullable: true })
    imageUrl?: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    createdBy: User;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
} 