import PacketValidator from '../../../PacketValidator';
import ReturnToSelectPacket from './ReturnToSelectPacket';

export default class ReturnToSelectPacketValidator extends PacketValidator<ReturnToSelectPacket> {
    constructor(packet: ReturnToSelectPacket) {
        super(packet);
    }

    build() {
        // No fields to validate for this packet
    }
} 