import CommandHandler from '../../CommandHandler';
import PhaseSelectCommand from './PhaseSelectCommand';
import Logger from '@/core/infra/logger/Logger';
import LeaveGameService from '@/game/domain/service/LeaveGameService';
import LoadCharactersService from '@/game/app/service/LoadCharactersService';
import { CharactersInfoSelectPacket } from '@/core/interface/networking/packets/packet/out/CharactersInfoPacket';
import { ConnectionStateEnum } from '@/core/enum/ConnectionStateEnum';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import ReturnToSelectPacket from '@/core/interface/networking/packets/packet/in/returnToSelect/ReturnToSelectPacket';
import Ip from '@/core/util/Ip';
import { GameConfig } from '@/game/infra/config/GameConfig';
import EmpirePacket from '@/core/interface/networking/packets/packet/bidirectional/empire/EmpirePacket';

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
            if (players.length > 0) {
                const empirePacket = new EmpirePacket({ empireId: players[0].empire });
                connection.send(empirePacket);
                console.log('[PhaseSelectCommandHandler] EmpirePacket sent:', players[0].empire);
            }
            const port = process.env.GAME_SERVER_PORT ? Number(process.env.GAME_SERVER_PORT) : Number(this.config.SERVER_PORT);
            const ip = Ip.toInt(process.env.GAME_SERVER_ADDRESS || '127.0.0.1');
            const characterInfoPacket = new CharactersInfoSelectPacket();
            for (let slot = 0; slot < 4; slot++) {
                const playerData = players.find(p => p.slot === slot);
                if (playerData) {
                    characterInfoPacket.addCharacter(slot, {
                        id: playerData.id,
                        name: playerData.name,
                        playerClass: playerData.playerClass,
                        level: playerData.level,
                        playTime: playerData.playTime,
                        st: playerData.st,
                        ht: playerData.ht,
                        dx: playerData.dx,
                        iq: playerData.iq,
                        bodyPart: playerData.bodyPart,
                        nameChange: 0,
                        hairPart: playerData.hairPart,
                        positionX: playerData.positionX,
                        positionY: playerData.positionY,
                        ip: ip,
                        port: port,
                        skillGroup: playerData.skillGroup,
                    });
                } else {
                    characterInfoPacket.addCharacter(slot, {
                        id: 0,
                        name: '',
                        playerClass: 0,
                        level: 0,
                        playTime: 0,
                        st: 0,
                        ht: 0,
                        dx: 0,
                        iq: 0,
                        bodyPart: 0,
                        nameChange: 0,
                        hairPart: 0,
                        positionX: 0,
                        positionY: 0,
                        ip: ip,
                        port: port,
                        skillGroup: 0,
                    });
                }
            }
            console.log('[PhaseSelectCommandHandler] CharactersInfoPacket characters:', characterInfoPacket['characters']);
            const rawBuffer = characterInfoPacket.pack();
            console.log('[PhaseSelectCommandHandler] CharactersInfoPacket raw buffer:', rawBuffer);
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