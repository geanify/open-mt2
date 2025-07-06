import PacketHeaderEnum from '@/core/enum/PacketHeaderEnum';
import PacketIn from '../PacketIn';
import ReturnToSelectPacketValidator from './ReturnToSelectPacketValidator';

export default class ReturnToSelectPacket extends PacketIn {
    constructor() {
        super({
            header: PacketHeaderEnum.RETURN_TO_SELECT,
            name: 'ReturnToSelectPacket',
            size: 1,
            validator: ReturnToSelectPacketValidator,
        });
    }

    unpack(buffer: Buffer) {
        this.bufferReader.setBuffer(buffer);
        this.validate();
        return this;
    }
} 