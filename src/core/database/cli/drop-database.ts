import 'reflect-metadata';
import { config } from 'dotenv';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

async function bootstrap() {
  const logger = new Logger('DropDatabaseCLI');

  // Load environment variables từ file .env
  config({ path: path.resolve(process.cwd(), '.env') });

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10) || 3306,
    user: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || '',
    charset: process.env.DB_CHARSET || 'utf8mb4',
    timezone: process.env.DB_TIMEZONE || '+07:00',
  };

  const databaseName = dbConfig.database;

  // Create a connection without specifying the database to connect to MySQL server
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
  });

  try {
    logger.log(`Connected to MySQL server at ${dbConfig.host}:${dbConfig.port}`);

    // Check if database exists
    const [rows] = await connection.execute(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [databaseName]
    );

    const dbExists = Array.isArray(rows) && rows.length > 0;

    if (dbExists) {
      // Drop database
      await connection.execute(`DROP DATABASE \`${databaseName}\``);
      logger.log(`✅ Database '${databaseName}' dropped successfully.`);
    } else {
      logger.log(`Database '${databaseName}' does not exist. Skipping drop.`);
    }

    await connection.end();
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Failed to drop database '${databaseName}':`, error);
    await connection.end();
    process.exit(1);
  }
}

bootstrap();



