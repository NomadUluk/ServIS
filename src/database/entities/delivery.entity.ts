import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Supplier } from './supplier.entity';
import { Ingredient } from './ingredient.entity';

@Entity('deliveries')
export class Delivery {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Ingredient)
    @JoinColumn({ name: 'ingredient_id' })
    ingredient: Ingredient;

    @ManyToOne(() => Supplier)
    @JoinColumn({ name: 'supplier_id' })
    supplier: Supplier;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    quantity: number;

    @Column({ name: 'price_per_unit', type: 'decimal', precision: 10, scale: 2 })
    pricePerUnit: number;

    @Column({ name: 'delivery_date', type: 'date' })
    deliveryDate: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    createdBy: User;
} 