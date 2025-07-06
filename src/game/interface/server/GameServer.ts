import Server from '../../../core/interface/server/Server';
import GameConnection from '@/game/interface/networking/GameConnection';
import { Socket } from 'net';
import LogoutService from '@/game/app/service/LogoutService';

export default class GameServer extends Server {
    private readonly logoutService: LogoutService;

    constructor(container) {
        super(container);
        this.logoutService = container.logoutService;
    }

    async onData(connection: GameConnection, data: Buffer) {
        console.log('[GameServer] onData called', data, 'Header byte:', data[0]);
        console.info('[GameServer] Received data from client:', data, 'Header byte:', data[0]);
        this.container.containerInstance.createScope();
        this.logger.debug(`[IN][DATA SOCKET EVENT] Data received from ID: ${connection.getId()}`);

        const header = data[0];
        const packetExists = this.packets.has(header);
        console.log('[GameServer] packetExists:', packetExists);

        if (!packetExists) {
            this.logger.info(`[IN][PACKET] Unknown header packet: ${data[0]}`);
            return;
        }

        const { createPacket, createHandler } = this.packets.get(header);
        const packet = createPacket({});
        console.log('[GameServer] Packet created:', packet.constructor.name);
        const handler = createHandler(this.container);
        console.log('[GameServer] Handler created:', handler.constructor.name);
        let unpackedPacket;
        try {
            unpackedPacket = packet.unpack(data);
            console.log('[GameServer] Packet unpacked:', unpackedPacket.constructor.name);
        } catch (err) {
            console.error('[GameServer] Error unpacking packet:', err);
            return;
        }
        this.logger.debug(`[IN][PACKET] processing packet: ${handler.constructor.name}`);
        handler.execute(connection, unpackedPacket).catch((err) => this.logger.error(err));
    }

    createConnection(socket: Socket) {
        return new GameConnection({
            socket,
            logger: this.logger,
            logoutService: this.logoutService,
            config: this.config,
        });
    }

    async onClose(connection: GameConnection) {
        super.onClose(connection);
        if (!this.isShuttingDown) {
            await connection.onClose();
        }
    }
}
