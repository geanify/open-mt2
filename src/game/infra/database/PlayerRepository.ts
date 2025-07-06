import DatabaseManager from '@/core/infra/database/DatabaseManager';
import { ResultSetHeader } from 'mysql2';
import PlayerState from '@/core/domain/entities/state/player/PlayerState';
import { IPlayerRepository } from '@/core/domain/repository/IPlayerRepository';

export default class PlayerRepository implements IPlayerRepository {
    private readonly databaseManager: DatabaseManager;

    constructor({ databaseManager }) {
        this.databaseManager = databaseManager;
    }

    async create(player: PlayerState) {
        const conn = this.databaseManager.getConnection();
        if (this.databaseManager.isSqlite) {
            try {
                const sql = `
                    INSERT INTO player (
                        accountId, createdAt, updatedAt, empire, playerClass, skillGroup, playTime, level, experience, gold, st, ht, dx, iq, positionX, positionY, health, mana, stamina, bodyPart, hairPart, name, givenStatusPoints, availableStatusPoints, slot
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                const values = [
                    player.accountId,
                    player.createdAt instanceof Date ? player.createdAt.toISOString() : player.createdAt,
                    player.updatedAt instanceof Date ? player.updatedAt.toISOString() : player.updatedAt,
                    player.empire,
                    player.playerClass,
                    player.skillGroup,
                    player.playTime,
                    player.level,
                    player.experience,
                    player.gold,
                    player.st,
                    player.ht,
                    player.dx,
                    player.iq,
                    player.positionX,
                    player.positionY,
                    player.health,
                    player.mana,
                    player.stamina,
                    player.bodyPart,
                    player.hairPart,
                    player.name,
                    player.givenStatusPoints,
                    player.availableStatusPoints,
                    player.slot
                ];
                console.log('SQL:', sql, 'VALUES:', values, 'COUNT:', values.length);
                const stmt = conn.prepare(sql);
                stmt.run(...values);
                return conn.query('SELECT last_insert_rowid() as id').get().id;
            } catch (err) {
                console.error('[PlayerRepository][SQLite] Error inserting player:', err, player);
                throw err;
            }
        } else {
            const [result] = await conn.execute<ResultSetHeader>(
                `
            insert into game.player (
                accountId, 
                createdAt, 
                updatedAt, 
                empire, 
                playerClass, 
                skillGroup, 
                playTime, 
                level, 
                experience, 
                gold, 
                st, 
                ht, 
                dx, 
                iq, 
                positionX, 
                positionY, 
                health, 
                mana, 
                stamina, 
                bodyPart, 
                hairPart, 
                name, 
                givenStatusPoints, 
                availableStatusPoints,
                slot
            )
                values
            (
                ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
            );
            `,
                [
                    player.accountId,
                    player.createdAt,
                    player.updatedAt,
                    player.empire,
                    player.playerClass,
                    player.skillGroup,
                    player.playTime,
                    player.level,
                    player.experience,
                    player.gold,
                    player.st,
                    player.ht,
                    player.dx,
                    player.iq,
                    player.positionX,
                    player.positionY,
                    player.health,
                    player.mana,
                    player.stamina,
                    player.bodyPart,
                    player.hairPart,
                    player.name,
                    player.givenStatusPoints,
                    player.availableStatusPoints,
                    player.slot,
                ],
            );
            return result.insertId;
        }
    }

    async nameAlreadyExists(name: string) {
        const conn = this.databaseManager.getConnection();
        if (this.databaseManager.isSqlite) {
            const rows = conn.query('SELECT * FROM player WHERE name = ?').all(name);
            return !!rows[0];
        } else {
            const [players] = await conn.query(
                `
            SELECT * FROM game.player WHERE name = ?;
            `,
                [name],
            );
            return !!players[0];
        }
    }

    async update(player: PlayerState) {
        const conn = this.databaseManager.getConnection();
        if (this.databaseManager.isSqlite) {
            const stmt = conn.prepare(`
                UPDATE player SET 
                    accountId = ?, createdAt = ?, updatedAt = ?, empire = ?, playerClass = ?, skillGroup = ?, playTime = ?, level = ?, experience = ?, gold = ?, st = ?, ht = ?, dx = ?, iq = ?, positionX = ?, positionY = ?, health = ?, mana = ?, stamina = ?, bodyPart = ?, hairPart = ?, name = ?, givenStatusPoints = ?, availableStatusPoints = ?, slot = ?
                WHERE id = ?
            `);
            stmt.run(
                player.accountId,
                player.createdAt instanceof Date ? player.createdAt.toISOString() : player.createdAt,
                player.updatedAt instanceof Date ? player.updatedAt.toISOString() : player.updatedAt,
                player.empire,
                player.playerClass,
                player.skillGroup,
                player.playTime,
                player.level,
                player.experience,
                player.gold,
                player.st,
                player.ht,
                player.dx,
                player.iq,
                player.positionX,
                player.positionY,
                player.health,
                player.mana,
                player.stamina,
                player.bodyPart,
                player.hairPart,
                player.name,
                player.givenStatusPoints,
                player.availableStatusPoints,
                player.slot,
                player.id
            );
        } else {
            await conn.query(
                `
            UPDATE game.player SET 
                accountId = ?, 
                createdAt = ?, 
                updatedAt = ?, 
                empire = ?, 
                playerClass = ?, 
                skillGroup = ?, 
                playTime = ?, 
                level = ?, 
                experience = ?, 
                gold = ?, 
                st = ?, 
                ht = ?, 
                dx = ?, 
                iq = ?, 
                positionX = ?, 
                positionY = ?, 
                health = ?, 
                mana = ?, 
                stamina = ?, 
                bodyPart = ?, 
                hairPart = ?, 
                name = ?, 
                givenStatusPoints = ?, 
                availableStatusPoints = ?,
                slot = ?
            WHERE id = ?;
            `,
                [
                    player.accountId,
                    player.createdAt,
                    player.updatedAt,
                    player.empire,
                    player.playerClass,
                    player.skillGroup,
                    player.playTime,
                    player.level,
                    player.experience,
                    player.gold,
                    player.st,
                    player.ht,
                    player.dx,
                    player.iq,
                    player.positionX,
                    player.positionY,
                    player.health,
                    player.mana,
                    player.stamina,
                    player.bodyPart,
                    player.hairPart,
                    player.name,
                    player.givenStatusPoints,
                    player.availableStatusPoints,
                    player.slot,
                    player.id,
                ],
            );
        }
    }

    async getById(id: number) {
        const conn = this.databaseManager.getConnection();
        if (this.databaseManager.isSqlite) {
            const row = conn.query('SELECT * FROM player WHERE id = ?').get(id);
            return this.mapToEntity(row);
        } else {
            const [players] = await conn.query(
                `
            SELECT * FROM game.player WHERE id = ?;
            `,
                [id],
            );
            return this.mapToEntity(players[0]);
        }
    }

    async getByAccountId(accountId: number) {
        const conn = this.databaseManager.getConnection();
        if (this.databaseManager.isSqlite) {
            const rows = conn.query('SELECT * FROM player WHERE accountId = ?').all(accountId);
            return rows.map((p) => this.mapToEntity(p));
        } else {
            const [players] = await conn.query(
                `
            SELECT * FROM game.player WHERE accountId = ?;
            `,
                [accountId],
            );
            return (players as Array<PlayerState>).map((p) => this.mapToEntity(p));
        }
    }

    async getByAccountIdAndSlot(accountId: number, slot: number) {
        const conn = this.databaseManager.getConnection();
        if (this.databaseManager.isSqlite) {
            const row = conn.query('SELECT * FROM player WHERE accountId = ? and slot = ?').get(accountId, slot);
            return this.mapToEntity(row);
        } else {
            const [players] = await conn.query(
                `
            SELECT * FROM game.player WHERE accountId = ? and slot = ?;
            `,
                [accountId, slot],
            );
            return this.mapToEntity(players[0]);
        }
    }

    private mapToEntity(player: PlayerState) {
        if (!player) return;

        const {
            id,
            accountId,
            createdAt,
            updatedAt,
            empire,
            playerClass,
            skillGroup,
            playTime,
            level,
            experience,
            gold,
            st,
            ht,
            dx,
            iq,
            positionX,
            positionY,
            health,
            mana,
            stamina,
            bodyPart,
            hairPart,
            name,
            givenStatusPoints,
            availableStatusPoints,
            slot,
        } = player;

        return new PlayerState({
            id,
            accountId,
            createdAt,
            updatedAt,
            empire,
            playerClass,
            skillGroup,
            playTime,
            level,
            experience,
            gold,
            st,
            ht,
            dx,
            iq,
            positionX,
            positionY,
            health,
            mana,
            stamina,
            bodyPart,
            hairPart,
            name,
            givenStatusPoints,
            availableStatusPoints,
            slot,
        });
    }
}
