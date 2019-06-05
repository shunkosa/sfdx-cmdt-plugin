import { core, flags, SfdxCommand } from '@salesforce/command';
import { SfdxError } from '@salesforce/core';

core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages('sfdx-cmdt-plugin', 'cmdt');

export default class List extends SfdxCommand {

    public static description = messages.getMessage('listCommandDescription');

    public static examples = [
        `$ sfdx cmdt:field:list --type Example__mdt
{ fullName: 'ExampleField__c',
caseSensitive: 'false',
externalId: 'false',
fieldManageability: 'DeveloperControlled',
label: 'ExampleFieldLabel',
length: '255',
required: 'true',
type: 'Text',
unique: 'true'
}
  `];


    protected static flagsConfig = {
        type: flags.string({ char: 't', required: true, description: messages.getMessage('typeDescription') })
        };

    protected static requiresUsername = true;

    public async run() {
        if (this.flags.type.slice(-5) != '__mdt') {
            throw new SfdxError(messages.getMessage('errorInvalidCustomMetadataType'));
        }
        const conn = this.org.getConnection();
        //read cmdt definition
        const metadata: any = await conn.metadata.read('CustomObject', this.flags.type);
        if (!metadata.fullName) {
            throw new SfdxError(messages.getMessage('errorCustomMetadataDefinitionNotFound'));
        }
        if (metadata.fields){
            console.log(metadata.fields);
        } else {
            console.log(messages.getMessage('infoNoCustomFields'));
        }
    }
}