import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MenuItem } from './menu-item.entity';
import { Ingredient } from './ingredient.entity';

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