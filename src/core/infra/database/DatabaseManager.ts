import { Pool } from 'mysql2/promise';
import MySqlConnection from './connection/MySqlConnection';
import SqliteConnection from './connection/SqliteConnection';
import loadScript from './scripts/loadScript';
import Logger from '@/core/infra/logger/Logger';
import { Config } from '@/core/infra/config/Config';

export default class DatabaseManager {
    private connection: any;
    private logger: Logger;
    private config: Config;
    public isSqlite: boolean;

    constructor({ config, logger }) {
        this.logger = logger;
        this.config = config;
        this.isSqlite = process.env.SQLITE_ENABLE === 'true';
    }

    getConnection() {
        if (this.connection) {
            return this.connection;
        }
        if (this.isSqlite) {
            this.connection = SqliteConnection.getConnection();
        } else {
            this.connection = MySqlConnection.getConnection({
                dbHost: this.config.DB_HOST,
                dbName: this.config.DB_DATABASE_NAME,
                dbPass: this.config.DB_ROOT_PASSWORD,
                dbUser: this.config.DB_USER,
                dbPort: this.config.DB_PORT,
            });
        }
        return this.connection;
    }

    async executeScripts() {
        const scripts = await loadScript(this.isSqlite);
        this.logger.info(`[DBMANAGER] Executing database scripts...`);
        const connection = this.getConnection();
        for await (const script of scripts) {
            this.logger.debug(`[DBMANAGER] Executing command: ${script}`);
            if (this.isSqlite) {
                connection.exec(script);
            } else {
                await connection.execute(script);
            }
        }
    }

    async init() {
        this.logger.info('[DBMANAGER] Connecting');
        this.getConnection();
        this.logger.info('[DBMANAGER] Connected');
    }

    async close() {
        this.logger.info('[DBMANAGER] Closing connection');
        if (!this.isSqlite) {
            await this.connection?.end();
        }
        this.logger.info('[DBMANAGER] Connection closed');
    }
}
