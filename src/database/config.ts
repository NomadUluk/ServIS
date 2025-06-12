import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from '../config';
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
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    synchronize: config.server.nodeEnv === 'development',
    dropSchema: false,
    logging: config.server.nodeEnv === 'development',
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