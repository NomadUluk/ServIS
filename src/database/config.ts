import { DataSource, DataSourceOptions } from 'typeorm';
import {
    User,
    Ingredient,
    MenuItem,
    Order,
    Shift,
    Supplier,
    Delivery,
    MenuIngredient,
    ShiftStaff,
    OrderItem,
    MenuStopList,
    IngredientStopList,
    Payment,
    TwoFactorCode,
    PasswordResetToken
} from './entities';

export const databaseConfig: DataSourceOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '12345',
    database: 'servis',
    synchronize: true,
    dropSchema: false,
    logging: true,
    entities: [
        User,
        Ingredient,
        MenuItem,
        Order,
        Shift,
        Supplier,
        Delivery,
        MenuIngredient,
        ShiftStaff,
        OrderItem,
        MenuStopList,
        IngredientStopList,
        Payment,
        TwoFactorCode,
        PasswordResetToken
    ],
    migrations: ['src/database/migrations/**/*.ts'],
};

export const dataSource = new DataSource(databaseConfig); 