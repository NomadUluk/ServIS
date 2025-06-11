import { UserRole, OrderStatus, PaymentType } from './enums';

export interface IShift {
    id: number;
    startTime: Date;
    endTime: Date;
}

export interface IMenuItem {
    id: number;
    name: string;
    costPrice: number;
}

export interface IOrderItem {
    id: number;
    quantity: number;
    price: number;
    menuItem: IMenuItem;
}

export interface IOrder {
    id: number;
    status: OrderStatus;
    totalPrice: number;
    paidAt?: Date;
    orderItems: IOrderItem[];
}

export interface IUser {
    id: string;
    fullName: string;
    role: UserRole;
    isActive: boolean;
    shifts: IShift[];
}

export interface IPayment {
    id: number;
    amount: number;
    paymentType: PaymentType;
    paidAt: Date;
} 