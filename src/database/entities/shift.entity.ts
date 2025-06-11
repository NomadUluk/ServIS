import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

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