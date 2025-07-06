import CommandHandler from '../../CommandHandler';
import PhaseSelectCommand from './PhaseSelectCommand';
import Logger from '@/core/infra/logger/Logger';
import LeaveGameService from '@/game/domain/service/LeaveGameService';
import LoadCharactersService from '@/game/app/service/LoadCharactersService';
import CharactersInfoPacket from '@/core/interface/networking/packets/packet/out/CharactersInfoPacket';
import { ConnectionStateEnum } from '@/core/enum/ConnectionStateEnum';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import ReturnToSelectPacket from '@/core/interface/networking/packets/packet/in/returnToSelect/ReturnToSelectPacket';
import Ip from '@/core/util/Ip';
import { GameConfig } from '@/game/infra/config/GameConfig';

export default class PhaseSelectCommandHandler extends CommandHandler<PhaseSelectCommand> {
    private readonly logger: Logger;
    private readonly leaveGameService: LeaveGameService;
    private readonly loadCharactersService: LoadCharactersService;
    private readonly config: GameConfig;

    constructor({ logger, leaveGameService, loadCharactersService, config }) {
        super();
        this.logger = logger;
        this.leaveGameService = leaveGameService;
        this.loadCharactersService = loadCharactersService;
        this.config = config;
    }

    async execute(player, command: PhaseSelectCommand) {
        console.log('[PhaseSelectCommandHandler] execute called', { args: command.getArgs && command.getArgs() });
        console.log('[PhaseSelectCommandHandler] player keys:', Object.keys(player));
        console.log('[PhaseSelectCommandHandler] typeof player.getConnection:', typeof player.getConnection);
        if (!player) {
            console.log('[PhaseSelectCommandHandler] Early return: no player');
            return;
        }
        if (player.connection) {
            const connection = player.connection;
            console.log('[PhaseSelectCommandHandler] connection keys:', Object.keys(connection));
            console.log('[PhaseSelectCommandHandler] typeof connection.getAccountId:', typeof connection.getAccountId);
            if (connection && typeof connection.getAccountId === 'function') {
                console.log('[PhaseSelectCommandHandler] connection.getAccountId():', connection.getAccountId());
            }
            if (!connection) {
                console.log('[PhaseSelectCommandHandler] Early return: no connection');
                return;
            }
            await this.leaveGameService.execute(player);
            connection.setPlayer(null);
            const accountId = connection.getAccountId();
            console.log('[PhaseSelectCommandHandler] accountId:', accountId);
            if (!accountId) {
                console.log('[PhaseSelectCommandHandler] Early return: no accountId');
                return;
            }
            let charactersResult;
            try {
                charactersResult = await this.loadCharactersService.execute({ accountId });
            } catch (err) {
                console.log('[PhaseSelectCommandHandler] Error in loadCharactersService.execute:', err);
                return;
            }
            if (!charactersResult.isOk()) {
                console.log('[PhaseSelectCommandHandler] Early return: failed to load characters');
                return;
            }
            const players = charactersResult.getData();
            console.log('[PhaseSelectCommandHandler] players:', players);
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
                    ip: Ip.toInt(this.config.REAL_SERVER_ADDRESS || this.config.SERVER_ADDRESS),
                    port: Number(this.config.SERVER_PORT),
                    skillGroup: player.skillGroup,
                });
            });
            console.log('[PhaseSelectCommandHandler] CharactersInfoPacket characters:', characterInfoPacket['characters']);
            player.chat({
                message: 'Returning to character select screen...',
                messageType: ChatMessageTypeEnum.INFO,
            });
            connection.send(characterInfoPacket);
            console.log('[PhaseSelectCommandHandler] CharactersInfoPacket sent');
            connection.setState(ConnectionStateEnum.SELECT);
            console.log('[PhaseSelectCommandHandler] State set to SELECT');
        }
    }
} 