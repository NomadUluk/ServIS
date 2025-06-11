import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Order } from './order.entity';
import { User } from './user.entity';
import { PaymentType } from '../enums';

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Order)
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ name: 'payment_type', type: 'enum', enum: PaymentType })
    paymentType: PaymentType;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'paid_by_id' })
    paidBy: User;

    @CreateDateColumn({ name: 'paid_at' })
    paidAt: Date;
} 