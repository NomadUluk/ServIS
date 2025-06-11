import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

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