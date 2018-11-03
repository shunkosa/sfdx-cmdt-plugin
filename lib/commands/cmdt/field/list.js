"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
command_1.core.Messages.importMessagesDirectory(__dirname);
const messages = command_1.core.Messages.loadMessages('sfdx-cmdt-plugin', 'cmdt');
class List extends command_1.SfdxCommand {
    async run() {
        if (this.flags.type.slice(-5) != '__mdt') {
            throw new core_1.SfdxError(messages.getMessage('errorInvalidCustomMetadataType'));
        }
        const conn = this.org.getConnection();
        //read cmdt definition
        const metadata = await conn.metadata.read('CustomObject', this.flags.type);
        if (!metadata.fullName) {
            throw new core_1.SfdxError(messages.getMessage('errorCustomMetadataDefinitionNotFound'));
        }
        if (metadata.fields) {
            console.log(metadata.fields);
        }
        else {
            console.log(messages.getMessage('infoNoCustomFields'));
        }
    }
}
List.description = messages.getMessage('listCommandDescription');
List.examples = [
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
  `
];
List.flagsConfig = {
    type: command_1.flags.string({ char: 't', required: true, description: messages.getMessage('typeDescription') })
};
List.requiresUsername = true;
exports.default = List;
//# sourceMappingURL=list.js.map