import PacketHandler from '../../PacketHandler';
import ReturnToSelectPacket from './ReturnToSelectPacket';
import Logger from '@/core/infra/logger/Logger';
import GameConnection from '@/game/interface/networking/GameConnection';
import LeaveGameService from '@/game/domain/service/LeaveGameService';
import LoadCharactersService from '@/game/app/service/LoadCharactersService';
import CharactersInfoPacket from '../../out/CharactersInfoPacket';
import { ConnectionStateEnum } from '@/core/enum/ConnectionStateEnum';

export default class ReturnToSelectPacketHandler extends PacketHandler<ReturnToSelectPacket> {
    private readonly logger: Logger;
    private readonly leaveGameService: LeaveGameService;
    private readonly loadCharactersService: LoadCharactersService;

    constructor({ logger, leaveGameService, loadCharactersService }) {
        super();
        this.logger = logger;
        this.leaveGameService = leaveGameService;
        this.loadCharactersService = loadCharactersService;
    }

    async execute(connection: GameConnection, packet: ReturnToSelectPacket) {
        console.info('[ReturnToSelectPacketHandler] Handler called for connection', connection.getId());
        if (!packet.isValid()) {
            this.logger.error(`[ReturnToSelectPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }

        const player = connection.getPlayer();
        if (player) {
            console.info('[ReturnToSelectPacketHandler] Player found, executing leaveGameService for', player.getName());
            await this.leaveGameService.execute(player);
            connection.setPlayer(null);
        } else {
            console.info('[ReturnToSelectPacketHandler] No player found on connection', connection.getId());
        }

        const accountId = connection.getAccountId();
        if (!accountId) {
            this.logger.info(`[ReturnToSelectPacketHandler] The connection does not have an accountId, this cannot happen`);
            connection.close();
            return;
        }
        console.info('[ReturnToSelectPacketHandler] Loading characters for accountId', accountId);
        const charactersResult = await this.loadCharactersService.execute({ accountId });
        if (!charactersResult.isOk()) {
            this.logger.error(`[ReturnToSelectPacketHandler] Failed to load characters for accountId: ${accountId}`);
            connection.close();
            return;
        }
        console.info('[ReturnToSelectPacketHandler] Characters loaded, sending CharactersInfoPacket');
        const players = charactersResult.getData();
        const characterInfoPacket = new CharactersInfoPacket();
        players.forEach((player) => {
            characterInfoPacket.addCharacter(player.slot, {
                id: player.id,
                name: player.name,
                playerClass: player.playerClass,
                level: player.level,
                playTime: player.playTime,
                st: player.st,
                ht: player.ht,
                dx: player.dx,
                iq: player.iq,
                bodyPart: player.bodyPart,
                nameChange: 0,
                hairPart: player.hairPart,
                positionX: player.positionX,
                positionY: player.positionY,
                ip: 0,
                port: 0,
                skillGroup: player.skillGroup,
            });
        });
        connection.send(characterInfoPacket);
        connection.setState(ConnectionStateEnum.SELECT);
        console.info('[ReturnToSelectPacketHandler] Sent CharactersInfoPacket and set state to SELECT');
    }
} 