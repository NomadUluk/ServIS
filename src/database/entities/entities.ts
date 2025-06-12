import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { UserRole, OrderStatus, PaymentType } from '../enums/index';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'full_name' })
    fullName: string;

    @Column({ unique: true })
    username: string;

    @Column({ name: 'password_hash' })
    passwordHash: string;

    @Column({ type: 'enum', enum: UserRole })
    role: UserRole;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @OneToMany(() => Shift, shift => shift.user)
    shifts: Shift[];
}

@Entity('shifts')
export class Shift {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'start_time', type: 'timestamp' })
    startTime: Date;

    @Column({ name: 'end_time', type: 'timestamp' })
    endTime: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}

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

@Entity('password_reset_tokens')
export class PasswordResetToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    token: string;

    @Column()
    userId: string;

    @ManyToOne(() => User)
    user: User;

    @Column({ default: false })
    used: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    expiresAt: Date;
}

@Entity('two_factor_codes')
export class TwoFactorCode {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ length: 6 })
    code: string;

    @Column({ name: 'expires_at' })
    expiresAt: Date;

    @Column({ name: 'is_used', default: false })
    isUsed: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

@Entity('suppliers')
export class Supplier {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    phone: string;
}

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

@Entity('ingredient_stop_list')
export class IngredientStopList {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Ingredient)
    @JoinColumn({ name: 'ingredient_id' })
    ingredient: Ingredient;

    @ManyToOne(() => Shift)
    @JoinColumn({ name: 'shift_id' })
    shift: Shift;
}

@Entity('shift_staff')
export class ShiftStaff {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Shift)
    @JoinColumn({ name: 'shift_id' })
    shift: Shift;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}

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

@Entity('menu_stop_list')
export class MenuStopList {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => MenuItem)
    @JoinColumn({ name: 'menu_item_id' })
    menuItem: MenuItem;

    @ManyToOne(() => Shift)
    @JoinColumn({ name: 'shift_id' })
    shift: Shift;
}

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

@Entity('menu_ingredients')
export class MenuIngredient {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => MenuItem)
    @JoinColumn({ name: 'menu_item_id' })
    menuItem: MenuItem;

    @ManyToOne(() => Ingredient)
    @JoinColumn({ name: 'ingredient_id' })
    ingredient: Ingredient;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    quantity: number;
} 