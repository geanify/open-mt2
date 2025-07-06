import { Database } from "bun:sqlite";

export default class SqliteConnection {
    static db: Database;

    static getConnection() {
        if (!SqliteConnection.db) {
            SqliteConnection.db = new Database("mt2.db");
        }
        return SqliteConnection.db;
    }
} 