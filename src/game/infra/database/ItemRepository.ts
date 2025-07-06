import ItemState from '@/core/domain/entities/state/item/ItemState';
import DatabaseManager from '@/core/infra/database/DatabaseManager';
import { ResultSetHeader } from 'mysql2';
import { IItemRepository } from '../../../core/domain/repository/IItemRepository';

export default class ItemRepository implements IItemRepository {
    private readonly databaseManager: DatabaseManager;

    constructor({ databaseManager }) {
        this.databaseManager = databaseManager;
    }

    async delete(item: ItemState) {
        const conn = this.databaseManager.getConnection();
        if (this.databaseManager.isSqlite) {
            const stmt = conn.prepare('DELETE FROM item WHERE id = ? AND ownerId = ?');
            stmt.run(item.id, item.ownerId);
        } else {
            await conn.query('delete from game.item where id = ? and ownerId = ? ', [item.id, item.ownerId]);
        }
    }

    async updatePosition(item: ItemState) {
        const conn = this.databaseManager.getConnection();
        if (this.databaseManager.isSqlite) {
            const stmt = conn.prepare('UPDATE item SET position = ? WHERE id = ? AND ownerId = ?');
            stmt.run(item.position, item.id, item.ownerId);
        } else {
            return conn.query('update game.item set position = ? where id = ? and ownerId = ? ', [
                item.position,
                item.id,
                item.ownerId,
            ]);
        }
    }

    async update(item: ItemState) {
        const conn = this.databaseManager.getConnection();
        if (this.databaseManager.isSqlite) {
            const stmt = conn.prepare(`
                UPDATE item SET 
                    ownerId = ?, window = ?, position = ?, count = ?, protoId = ?, socket0 = ?, socket1 = ?, socket2 = ?, attributeType0 = ?, attributeValue0 = ?, attributeType1 = ?, attributeValue1 = ?, attributeType2 = ?, attributeValue2 = ?, attributeType3 = ?, attributeValue3 = ?, attributeType4 = ?, attributeValue4 = ?, attributeType5 = ?, attributeValue5 = ?, attributeType6 = ?, attributeValue6 = ?
                WHERE id = ?
            `);
            stmt.run(
                item.ownerId,
                item.window,
                item.position,
                item.count,
                item.protoId,
                item.socket0,
                item.socket1,
                item.socket2,
                item.attributeType0,
                item.attributeValue0,
                item.attributeType1,
                item.attributeValue1,
                item.attributeType2,
                item.attributeValue2,
                item.attributeType3,
                item.attributeValue3,
                item.attributeType4,
                item.attributeValue4,
                item.attributeType5,
                item.attributeValue5,
                item.attributeType6,
                item.attributeValue6,
                item.id
            );
        } else {
            await conn.query(
                `
                update 
                    item 
                set 
                    ownerId = ?,
                    window = ?,
                    position = ?,
                    count = ?,
                    protoId = ?,
                    socket0 = ?,
                    socket1 = ?,
                    socket2 = ?,
                    attributeType0 = ?,
                    attributeValue0 = ?,
                    attributeType1 = ?,
                    attributeValue1 = ?,
                    attributeType2 = ?,
                    attributeValue2 = ?,
                    attributeType3 = ?,
                    attributeValue3 = ?,
                    attributeType4 = ?,
                    attributeValue4 = ?,
                    attributeType5 = ?,
                    attributeValue5 = ?,
                    attributeType6 = ?,
                    attributeValue6 = ?
                where 
                    id = ?;
                `,
                [
                    item.ownerId,
                    item.window,
                    item.position,
                    item.count,
                    item.protoId,
                    item.socket0,
                    item.socket1,
                    item.socket2,
                    item.attributeType0,
                    item.attributeValue0,
                    item.attributeType1,
                    item.attributeValue1,
                    item.attributeType2,
                    item.attributeValue2,
                    item.attributeType3,
                    item.attributeValue3,
                    item.attributeType4,
                    item.attributeValue4,
                    item.attributeType5,
                    item.attributeValue5,
                    item.attributeType6,
                    item.attributeValue6,
                    item.id,
                ],
            );
        }
    }

    async create(item: ItemState) {
        const conn = this.databaseManager.getConnection();
        if (this.databaseManager.isSqlite) {
            const stmt = conn.prepare(`
                INSERT INTO item (
                    ownerId, window, position, count, protoId, socket0, socket1, socket2, attributeType0, attributeValue0, attributeType1, attributeValue1, attributeType2, attributeValue2, attributeType3, attributeValue3, attributeType4, attributeValue4, attributeType5, attributeValue5, attributeType6, attributeValue6
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            `);
            stmt.run(
                item.ownerId,
                item.window,
                item.position,
                item.count,
                item.protoId,
                item.socket0,
                item.socket1,
                item.socket2,
                item.attributeType0,
                item.attributeValue0,
                item.attributeType1,
                item.attributeValue1,
                item.attributeType2,
                item.attributeValue2,
                item.attributeType3,
                item.attributeValue3,
                item.attributeType4,
                item.attributeValue4,
                item.attributeType5,
                item.attributeValue5,
                item.attributeType6,
                item.attributeValue6
            );
            return conn.query('SELECT last_insert_rowid() as id').get().id;
        } else {
            const [result] = await conn.execute<ResultSetHeader>(
                `
            insert into game.item (
                ownerId, 
                window, 
                position, 
                count, 
                protoId, 
                socket0, 
                socket1, 
                socket2, 
                attributeType0, 
                attributeValue0, 
                attributeType1, 
                attributeValue1, 
                attributeType2, 
                attributeValue2, 
                attributeType3, 
                attributeValue3, 
                attributeType4, 
                attributeValue4, 
                attributeType5, 
                attributeValue5, 
                attributeType6, 
                attributeValue6
            )
                values
            (
                ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
            );
            `,
                [
                    item.ownerId,
                    item.window,
                    item.position,
                    item.count,
                    item.protoId,
                    item.socket0,
                    item.socket1,
                    item.socket2,
                    item.attributeType0,
                    item.attributeValue0,
                    item.attributeType1,
                    item.attributeValue1,
                    item.attributeType2,
                    item.attributeValue2,
                    item.attributeType3,
                    item.attributeValue3,
                    item.attributeType4,
                    item.attributeValue4,
                    item.attributeType5,
                    item.attributeValue5,
                    item.attributeType6,
                    item.attributeValue6,
                ],
            );
            return result.insertId;
        }
    }

    async getByOwner(ownerId: number) {
        const conn = this.databaseManager.getConnection();
        if (this.databaseManager.isSqlite) {
            const rows = conn.query('SELECT * FROM item WHERE ownerId = ?').all(ownerId);
            return rows as Array<ItemState>;
        } else {
            const [items] = await conn.query('select * from game.item where ownerId = ?', [ownerId]);
            return items as Array<ItemState>;
        }
    }
}
