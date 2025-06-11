import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ingredients')
export class Ingredient {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    unit: string;

    @Column({ name: 'current_price', type: 'decimal', precision: 10, scale: 2 })
    currentPrice: number;

    @Column({ name: 'in_stock', type: 'decimal', precision: 10, scale: 2 })
    inStock: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
} 