# sfdx-cmdt-plugin

A plugin for Salesforce DX CLI that converts CSV to XML custom metadata records.

## Setup

### Install from source
1. Install the SDFX CLI.

2. Clone the repository: `git clone git@github.com:shunkosa/sfdx-cmdt-plugin.git`

3. Install npm modules: `npm install`

4. Link the plugin: `sfdx plugins:link .

## Use
### Convert
`sfdx-cmdt-plugin cmdt:csv:convert records.csv -t Example__mdt`

(Optional) you can use a column mapping file like Data Loader.
```mapping.txt
DeveloperName=API Name
Label=Display Label
Field__c=Field
```

### Show list of custom fields
`sfdx-cmdt-plugin cmdt:field:list -t Example__mdt`
