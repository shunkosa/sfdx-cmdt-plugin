import { flags, SfdxCommand } from '@salesforce/command';
export default class Convert extends SfdxCommand {
    static description: string;
    static examples: string[];
    static args: {
        name: string;
    }[];
    protected static flagsConfig: {
        type: flags.IOptionFlag<string>;
        mapping: flags.IOptionFlag<string>;
        protected: import("../../../../../../../../Users/skosaka/dev/sfdx-cmdt-plugin/node_modules/@salesforce/command/node_modules/@oclif/command/node_modules/@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    protected static requiresUsername: boolean;
    protected static requiresProject: boolean;
    private fullNameToTypeMap;
    private csvHeaderTofullNameMap;
    private targetPath;
    private countSuccess;
    run(): Promise<any>;
    private generateMetadataRecord;
    private getCustomMetadataXsiType;
    private convertToDeveloperName;
}
