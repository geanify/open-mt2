import Logger from '@/core/infra/logger/Logger';
import PacketHandler from '../../PacketHandler';
import ChatInPacket from './ChatInPacket';
import GameConnection from '@/game/interface/networking/GameConnection';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import CommandManager from '@/game/app/command/CommandManager';

export default class ChatInPacketHandler extends PacketHandler<ChatInPacket> {
    private logger: Logger;
    private commandManager: CommandManager;
    private leaveGameService: any;
    private loadCharactersService: any;

    constructor({ logger, commandManager, leaveGameService, loadCharactersService }) {
        super();
        this.logger = logger;
        this.commandManager = commandManager;
        this.leaveGameService = leaveGameService;
        this.loadCharactersService = loadCharactersService;
    }

    async execute(connection: GameConnection, packet: ChatInPacket) {
        this.logger.info('[ChatInPacketHandler] execute called', {
            messageType: packet.getMessageType(),
            message: packet.getMessage(),
        });
        console.log('[ChatInPacketHandler] Checking packet validity...');
        if (!packet.isValid()) {
            console.log('[ChatInPacketHandler] Packet invalid:', packet.getErrorMessage());
            this.logger.error(`[ChatInPacketHandler] Packet invalid`);
            this.logger.error(packet.getErrorMessage());
            connection.close();
            return;
        }
        console.log('[ChatInPacketHandler] Packet is valid!');

        const player = connection.getPlayer();

        if (!player) {
            this.logger.info(`[ChatInPacketHandler] The connection does not have an player select, this cannot happen`);
            connection.close();
            return;
        }

        const message = packet.getMessage();
        const messageType = packet.getMessageType();
        console.log('[ChatInPacketHandler] messageType:', messageType, 'ChatMessageTypeEnum:', ChatMessageTypeEnum);

        switch (messageType) {
            case ChatMessageTypeEnum.NORMAL:
                console.log('[ChatInPacketHandler] Entered NORMAL case');
                console.log('[ChatInPacketHandler] Command message:', message, 'hex:', Buffer.from(message, 'utf8').toString('hex'));
                this.logger.debug(`[ChatInPacketHandler] NORMAL CHAT: ${message}`);
                this.logger.debug(`[ChatInPacketHandler] RAW MESSAGE:`, { message, hex: Buffer.from(message, 'utf8').toString('hex') });
                if (message.startsWith('/')) {
                    let extraArgs = undefined;
                    if (message.trim() === '/phase_select') {
                        const buffer = packet['bufferReader'].getBuffer();
                        const slot = buffer[buffer.length - 1];
                        extraArgs = { slot };
                    }
                    this.commandManager.execute({ message, player, extraArgs });
                }

                //send normal message to other players in map

                break;
            case ChatMessageTypeEnum.SHOUT:
                this.logger.debug(`[ChatInPacketHandler] SHOUT CHAT: ${message}`);
                //validate 15 sec countdown between shout
                //validate level min for shout
                break;
            case ChatMessageTypeEnum.COMMAND:
                this.logger.debug(`[ChatInPacketHandler] COMMAND CHAT: ${message}`);

                break;
            case ChatMessageTypeEnum.GROUP:
                this.logger.debug(`[ChatInPacketHandler] GROUP CHAT: ${message}`);

                break;
            case ChatMessageTypeEnum.GUILD:
                this.logger.debug(`[ChatInPacketHandler] GUILD CHAT: ${message}`);

                break;
            case ChatMessageTypeEnum.INFO:
                this.logger.debug(`[ChatInPacketHandler] INFO CHAT: ${message}`);

                break;

            default:
                this.logger.error(`[ChatInPacketHandler] INVALID CHAT: type: ${messageType}, message: ${message}`);
                break;
        }
    }
}
