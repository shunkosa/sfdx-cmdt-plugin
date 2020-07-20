# sfdx-cmdt-plugin

[![Version](https://img.shields.io/npm/v/sfdx-cmdt-plugin.svg)](https://npmjs.org/package/sfdx-cmdt-plugin)
[![Downloads/week](https://img.shields.io/npm/dw/sfdx-cmdt-plugin.svg)](https://npmjs.org/package/sfdx-cmdt-plugin)
[![License](https://img.shields.io/npm/l/sfdx-cmdt-plugin.svg)](https://github.com/shunkosa/sfdx-cmdt-plugin/blob/master/package.json)

A plugin for Salesforce DX CLI that converts CSV to XML custom metadata records.

## Notice
**The official CLI topic `sfdx force:cmdt` is now available at v49. This plugin is no longer actively maintained.**

## Setup
### Install as plugin
1. Install plugin: `sfdx plugins:install sfdx-cmdt-plugin`


### Install from source
1. Install the SDFX CLI.

2. Clone the repository: `git clone git@github.com:shunkosa/sfdx-cmdt-plugin.git`

3. Install npm modules: `npm install`

4. Link the plugin: `sfdx plugins:link` .

## Use
### Convert
`sfdx cmdt:csv:convert records.csv -t Example__mdt`

(Optional) you can use a column mapping file like Data Loader.

`sfdx cmdt:csv:convert records.csv -t Example__mdt -m mapping.txt`

```
DeveloperName=API Name
Label=Display Label
Field__c=Field
```
You can deploy the converted metadata records by `sfdx force:source:deploy -m CustomMetadata`
### Show list of custom fields
`sfdx cmdt:field:list -t Example__mdt`
