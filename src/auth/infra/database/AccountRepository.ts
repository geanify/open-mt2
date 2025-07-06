import DatabaseManager from '@/core/infra/database/DatabaseManager';
import Account from '../../../core/domain/entities/state/account/Account';
import AccountStatus from '../../../core/domain/entities/state/account/AccountStatus';
import { IAccountRepository } from '@/core/domain/repository/IAccountRepository';

export default class AccountRepository implements IAccountRepository {
    private readonly databaseManager: DatabaseManager;

    constructor({ databaseManager }) {
        this.databaseManager = databaseManager;
    }

    async findByUsername(username: string) {
        const conn = this.databaseManager.getConnection();
        let accountRow;
        if (this.databaseManager.isSqlite) {
            const rows = conn.query(`
                SELECT
                    account.*,
                    account_status.createdAt as accountStatusCreatedAt,
                    account_status.updatedAt as accountStatusUpdatedAt,
                    account_status.id as accountStatusId,
                    account_status.allowLogin,
                    account_status.description,
                    account_status.clientStatus
                FROM account
                    JOIN account_status ON account.accountStatusId = account_status.id
                WHERE
                    account.username = ?;
            `).all(username);
            accountRow = rows[0];
        } else {
            const [accounts] = await conn.query(
                `
                SELECT
                    account.*,
                    account_status.createdAt as accountStatusCreatedAt,
                    account_status.updatedAt as accountStatusUpdatedAt,
                    account_status.id as accountStatusId,
                    account_status.allowLogin,
                    account_status.description,
                    account_status.clientStatus
                FROM account
                    JOIN account_status ON account.accountStatusId = account_status.id
                WHERE
                    account.username = ?;
                `,
                [username],
            );
            accountRow = accounts[0];
        }
        return this.mapToEntity(accountRow);
    }

    mapToEntity(account: any) {
        if (!account) return;
        const {
            id,
            username,
            password,
            email,
            lastLogin,
            deleteCode,
            createdAt,
            updatedAt,
            accountStatusCreatedAt,
            accountStatusUpdatedAt,
            accountStatusId,
            allowLogin,
            description,
            clientStatus,
        } = account;
        return Account.create({
            id,
            username,
            password,
            email,
            lastLogin,
            deleteCode,
            createdAt,
            updatedAt,
            accountStatus: AccountStatus.create({
                id: accountStatusId,
                createdAt: accountStatusCreatedAt,
                updatedAt: accountStatusUpdatedAt,
                allowLogin,
                description,
                clientStatus,
            }),
        });
    }
}
