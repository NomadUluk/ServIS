import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { OrderStatus } from '../enums';
import { Shift } from '.';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'table_number' })
    tableNumber: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'waiter_id' })
    waiter: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'cashier_id' })
    cashier?: User;

    @ManyToOne(() => Shift)
    @JoinColumn({ name: 'shift_id' })
    shift: Shift;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.OPEN })
    status: OrderStatus;

    @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
    totalPrice: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
    paidAt?: Date;

    @OneToMany(() => OrderItem, orderItem => orderItem.order)
    orderItems: OrderItem[];
} 