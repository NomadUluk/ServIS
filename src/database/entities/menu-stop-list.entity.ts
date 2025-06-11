import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MenuItem } from './menu-item.entity';
import { Shift } from './shift.entity';

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