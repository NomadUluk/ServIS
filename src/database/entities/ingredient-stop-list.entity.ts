import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Ingredient } from './ingredient.entity';
import { Shift } from './shift.entity';

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