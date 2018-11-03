"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@salesforce/command");
const fs = require("fs-extra");
const csvparse = require("csv-parse");
const xmlbuilder = require("xmlbuilder");
const core_1 = require("@salesforce/core");
command_1.core.Messages.importMessagesDirectory(__dirname);
const messages = command_1.core.Messages.loadMessages('sfdx-cmdt-plugin', 'cmdt');
class Convert extends command_1.SfdxCommand {
    constructor() {
        super(...arguments);
        this.fullNameToTypeMap = new Map([
            ['DeveloperName', 'string'],
            ['Label', 'string']
        ]);
        this.csvHeaderTofullNameMap = new Map();
        this.countSuccess = 0;
    }
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
            if (!Array.isArray(metadata.fields)) {
                this.fullNameToTypeMap.set(metadata.fields.fullName, metadata.fields.type);
            }
            else {
                for (const field of metadata.fields) {
                    this.fullNameToTypeMap.set(field.fullName, field.type);
                }
            }
        }
        //path
        const project = await core_1.Project.resolve();
        const projectPath = project.getPath();
        const projectJson = await core_1.SfdxProjectJson.retrieve();
        const packageDirList = projectJson.get("packageDirectories");
        for (const packageDir of packageDirList) {
            if (packageDir.default) {
                this.targetPath = `${projectPath}/${packageDir.path}`;
            }
        }
        if (!this.targetPath) {
            throw new core_1.SfdxError(messages.getMessage('errorInvalidProjectConfigFile'));
        }
        fs.ensureDirSync(this.targetPath);
        //read mapping file
        if (this.flags.mapping) {
            ;
            const mappingFile = fs.readFileSync(this.flags.mapping, { encoding: 'utf-8' });
            for (const line of mappingFile.toString().split('\n')) {
                this.csvHeaderTofullNameMap.set(line.split('=')[1], line.split('=')[0]);
            }
            let unmapped = [];
            for (const fullName of this.fullNameToTypeMap.keys()) {
                if (!Array.from(this.csvHeaderTofullNameMap.values()).includes(fullName)) {
                    unmapped.push(fullName);
                }
            }
            if (unmapped.length > 0) {
                throw new core_1.SfdxError(messages.getMessage('errorInvalidMappingFile') + unmapped);
            }
        }
        //read csv and generate xml
        const csvstream = fs.createReadStream(this.args.file, { encoding: 'utf-8' });
        const parser = csvparse({ columns: true });
        let rowcount = 0;
        csvstream
            .pipe(parser)
            .on('data', (row) => {
            rowcount++;
            let csvRow = row;
            if (this.flags.mapping) {
                csvRow = this.convertToDeveloperName(row);
            }
            if (rowcount == 1) {
                let keysnotfound = [];
                for (const fullName of this.fullNameToTypeMap.keys()) {
                    if (!Object.keys(csvRow).includes(fullName)) {
                        keysnotfound.push(this.flags.mapping
                            ? Array.from(this.csvHeaderTofullNameMap.keys()).filter((key) => { return this.csvHeaderTofullNameMap.get(key) === fullName; })
                            : fullName);
                    }
                }
                if (keysnotfound.length > 0) {
                    throw new core_1.SfdxError(messages.getMessage('errorInvalidCSVHeader') + keysnotfound);
                }
            }
            if (csvRow.DeveloperName.match(/(^\d|^_|__|[^0-9A-Za-z]|_$)/)) {
                console.log(`line ${rowcount}, DeveloperName=${csvRow.DeveloperName} : ${messages.getMessage('errorInvalidDeveloperName')}`);
            }
            else {
                this.generateMetadataRecord(csvRow);
            }
        })
            .on('end', () => {
            console.log(`${this.countSuccess} of ${rowcount} ${messages.getMessage('infoProcessFinished')}`);
        });
    }
    generateMetadataRecord(csvRow) {
        const xml = xmlbuilder.create('CustomMetadata', {
            encoding: 'UTF-8'
        }).att('xmlns', "http://soap.sforce.com/2006/04/metadata")
            .att('xmlns:xsi', "http://www.w3.org/2001/XMLSchema-instance")
            .att('xmlns:xsd', "http://www.w3.org/2001/XMLSchema");
        xml.ele('label', csvRow.Label);
        xml.ele('protected', this.flags.protected);
        for (const key of Object.keys(csvRow)) {
            if (key === 'DeveloperName' || key === 'Label')
                continue;
            const values = xml.ele('values');
            values.ele('field', key);
            values.ele('value', { 'xsi:type': this.getCustomMetadataXsiType(key) }, csvRow[key]);
        }
        const xmlPath = this.targetPath + '/main/default/customMetadata/'
            + this.flags.type.slice(0, -5) + '.'
            + csvRow.DeveloperName
            + '.md';
        const fileStream = fs.createWriteStream(xmlPath, { autoClose: true });
        const writer = xmlbuilder.streamWriter(fileStream);
        writer.pretty = true;
        writer.newline = '\n';
        writer.indent = '    ';
        xml.end(writer);
        this.countSuccess++;
    }
    getCustomMetadataXsiType(type) {
        switch (type) {
            case "Checkbox": return "boolean";
            case "Datetime": return "datetime";
            case "Date": return "date";
            case "Datetime": return "dateTime";
            case "Number": return "double";
            case "Percent": return "double";
            default: return "string";
        }
    }
    convertToDeveloperName(translatedCSVRow) {
        const result = {};
        for (const key of Object.keys(translatedCSVRow)) {
            result[this.csvHeaderTofullNameMap.get(key)] = translatedCSVRow[key];
        }
        return result;
    }
}
Convert.description = messages.getMessage('convertCommandDescription');
Convert.examples = [
    `$ sfdx cmdt:csv:convert example.csv --type Example__mdt
10 of 10 Custom metadata records were converted.
`,
    `$ sfdx cmdt:csv:convert example.csv --type Example__mdt --mapping mapping.txt
10 of 10 Custom metadata records were converted.`
];
Convert.args = [{ name: 'file' }];
Convert.flagsConfig = {
    type: command_1.flags.string({ char: 't', required: true, description: messages.getMessage('typeDescription') }),
    mapping: command_1.flags.string({ char: 'm', description: messages.getMessage('mappingDescription') }),
    protected: command_1.flags.boolean({ char: 'p', default: false, description: messages.getMessage('protectedFlagDescription') })
};
Convert.requiresUsername = true;
Convert.requiresProject = true;
exports.default = Convert;
//# sourceMappingURL=convert.js.map