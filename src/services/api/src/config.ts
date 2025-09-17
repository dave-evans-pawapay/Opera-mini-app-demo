import 'dotenv/config';
export const PORT = Number(process.env.PORT ?? 8080);
export const NODE_ENV = process.env.NODE_ENV ?? 'development';
export const DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/minipay';