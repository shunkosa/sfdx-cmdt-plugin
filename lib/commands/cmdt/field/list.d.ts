import { flags, SfdxCommand } from '@salesforce/command';
export default class List extends SfdxCommand {
    static description: string;
    static examples: string[];
    protected static flagsConfig: {
        type: flags.IOptionFlag<string>;
    };
    protected static requiresUsername: boolean;
    run(): Promise<void>;
}
