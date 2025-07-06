import Command from '../../Command';

export default class PhaseSelectCommand extends Command {
    constructor({ args } = { args: [] }) {
        super({ args });
    }

    static getName() {
        return '/phase_select';
    }
    static getDescription() {
        return 'Return to character select screen.';
    }
    static getExample() {
        return '/phase_select';
    }
} 