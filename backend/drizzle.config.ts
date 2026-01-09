import type { Config } from 'drizzle-kit';
import "dotenv/config";


export default {
    schema: './src/db/schemas/**.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        host: process.env.PG_HOST as string,
        port: Number(process.env.PG_PORT),
        user: process.env.PG_USER as string,
        password: process.env.PG_PASSWORD as string,
        database: process.env.PG_DB as string,
        ssl: false,
    },
    verbose: true,
    strict: true,
} satisfies Config;