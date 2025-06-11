import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { MenuItem } from './menu-item.entity';

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @ManyToOne(() => Order)
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @ManyToOne(() => MenuItem)
    @JoinColumn({ name: 'menu_item_id' })
    menuItem: MenuItem;
} 