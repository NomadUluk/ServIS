import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Shift } from './shift.entity';

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