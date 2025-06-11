import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { UserRole } from '../enums';
import { Shift } from './shift.entity';

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