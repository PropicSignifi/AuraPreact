global class DataLightningExtension {
    private static Action.Registry registry = new Action.Registry();
    private static final String namespace =
        ManagedPackageHelper.getPackageNamespace();

    static {
        registry.action(new DescribeAction());
        registry.action(new SearchReferenceAction());
        registry.action(new GetNamesAction());
        registry.action(new LoadRecordAction());
        registry.action(new SaveRecordAction());
        registry.action(new LoadRecordDefaultsAction());
        registry.action(new GetConfigItemsAction());
        registry.action(new SetConfigAction());
        registry.action(new GetFileContentAction());
        registry.action(new AddConfigItemAction());
        registry.action(new RemoveConfigItemAction());
        registry.action(new LoadHelpAction());
        registry.action(new SearchHelpAction());
        registry.action(new SearchQuickTextAction());
        registry.action(new QueryFieldsAction());
        registry.action(new RegisterConfigsAction());
        registry.action(new InvokeApexAction());
        registry.action(new GetVisualforceDomainURL());
        registry.action(new GetOrgDomainURL());
        registry.action(new DescribeFieldsAction());
        registry.action(new DescribeObjectsAction());
        registry.action(new BatchQueryFieldsAction());
        registry.action(new ImportConfigItemsAction());
        registry.action(new RunQueryAction());
        registry.action(new RunQueryWithoutSharingAction());
        registry.action(new GetRecordTypeNameAction());
        registry.action(new GetFieldSetAction());
        registry.action(new GetDependentPicklistValuesAction());
        registry.action(new GetSObjectNameAction());
        registry.action(new DoRestApiAction());
    }

    @AuraEnabled
    public static Object invoke(String name, Map<String, Object> args) {
        return registry.invoke(name, args);
    }

    @AuraEnabled
    public static Map<String, Action> apiDescriptorForLightning() {
        return registry.actions;
    }

    private static Id saveTheFile(Id parentId, String fileName, String base64Data, String contentType) {
        base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');

        Attachment a = new Attachment();
        a.parentId = parentId;

        a.Body = EncodingUtil.base64Decode(base64Data);
        a.Name = fileName;
        a.ContentType = contentType;

        insert a;

        return a.Id;
    }

    private static void appendToFile(Id fileId, String base64Data) {
        Attachment a = [
            SELECT Id, Body
            FROM Attachment
            WHERE Id = :fileId
        ];

        a.Body = EncodingUtil.base64Decode(EncodingUtil.base64Encode(a.Body) + EncodingUtil.urlDecode(base64Data, 'UTF-8'));

        update a;
    }

    @AuraEnabled
    public static Id uploadFile(Id parentId, String fileName, String base64Data, String contentType, String fileId) {
        if (fileId == '') {
            fileId = saveTheFile(parentId, fileName, base64Data, contentType);
        } else {
            appendToFile(fileId, base64Data);
        }

        return Id.valueOf(fileId);
    }

    private static String trimNamespace(String str) {
        if (str != null && str.startsWith(namespace)) {
            return str.substring(namespace.length());
        }
        else {
            return str;
        }
    }

    private class RunQueryAction extends Action {
        public RunQueryAction() {
            super('runQuery');
            param('query', String.class, 'The soql query');
        }

        public override Object execAction(Object arg) {
            String query = (String)arg;

            return Database.query(query);
        }
    }

    private without sharing class RunQueryWithoutSharingAction extends Action {
        public RunQueryWithoutSharingAction() {
            super('runQueryWithoutSharing');
            param('query', String.class, 'The soql query');
        }

        public override Object execAction(Object arg) {
            String query = (String)arg;

            return Database.query(query);
        }
    }

    private class GetRecordTypeNameAction extends Action {
        public GetRecordTypeNameAction() {
            super('getRecordTypeName');
            param('recordId', String.class, 'The record id');
        }

        public override Object execAction(Object arg) {
            Id recordId = (Id)arg;

            Schema.SObjectType token = recordId.getSObjectType();

            String query = 'SELECT RecordType.DeveloperName FROM ' + token.getDescribe().getName() + ' WHERE Id = \'' + recordId + '\'';
            List<SObject> result = Database.query(query);
            SObject record = result.get(0);
            RecordType rt = (RecordType)record.getSObject('RecordType');

            return rt.DeveloperName;
        }
    }

    private class GetFieldSetAction extends Action {
        public GetFieldSetAction() {
            super('getFieldSet');
            param('sObjectName', String.class, 'The sObject name');
            param('fieldSetName', String.class, 'The field set name');
            this.returnRaw();
        }

        public override Object execAction(Object arg1, Object arg2) {
            String sObjectName = (String)arg1;
            String fieldSetName = (String)arg2;

            Map<String, Schema.SObjectType> globalDescribeMap = Schema.getGlobalDescribe();
            Schema.SObjectType sObjectTypeObj = globalDescribeMap.get(sObjectName);
            Schema.DescribeSObjectResult describeSObjectResultObj = sObjectTypeObj.getDescribe();

            Schema.FieldSet fieldSetObj = describeSObjectResultObj.FieldSets.getMap().get(fieldSetName);

            return fieldSetObj.getFields();
        }
    }

    private class GetDependentPicklistValuesAction extends Action {
        public GetDependentPicklistValuesAction() {
            super('getDependentPicklistValues');
            param('sObjectName', String.class, 'The sObject name');
            param('fieldName', String.class, 'The field name');
            this.returnRaw();
        }

        public override Object execAction(Object arg1, Object arg2) {
            String sObjectName = (String)arg1;
            String fieldName = (String)arg2;

            Schema.SObjectType type = Schema.getGlobalDescribe().get(sObjectName);
            Schema.DescribeSObjectResult typeDesc = type.getDescribe();
            Map<String, Schema.SObjectField> fieldMap = typeDesc.fields.getMap();
            Schema.SObjectField dependToken = fieldMap.get(fieldName);

            Schema.DescribeFieldResult depend = dependToken.getDescribe();
            Schema.sObjectField controlToken = depend.getController();
            if (controlToken == null) {
                return new Map<String, List<String>>();
            }

            Schema.DescribeFieldResult control = controlToken.getDescribe();
            List<Schema.PicklistEntry> controlEntries = null;
            if(control.getType() != Schema.DisplayType.Boolean) {
                controlEntries = control.getPicklistValues();
            }

            String base64map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
            Map<String, List<String>> dependentPicklistValues = new Map<String, List<String>>();
            for (Schema.PicklistEntry entry : depend.getPicklistValues()) {
                String validFor = String.valueOf(((Map<String, Object>)JSON.deserializeUntyped(JSON.serialize(entry))).get('validFor'));
                if (entry.isActive() && String.isNotEmpty(validFor)) {
                    List<String> base64chars = validFor.split('');
                    for (Integer index = 0; index < (controlEntries != null ? controlEntries.size() : 2); index++) {
                        Object controlValue = null;
                        if(controlEntries == null) {
                            controlValue = index == 1;
                        }
                        else {
                            controlValue = controlEntries[index].isActive() ? controlEntries[index].getValue() : null;
                        }
                        Integer bitIndex = index / 6, bitShift = 5 - Math.mod(index, 6);
                        if(controlValue == null || (base64map.indexOf(base64chars[ bitIndex ]) & (1 << bitShift)) == 0) {
                            continue;
                        }
                        if(!dependentPicklistValues.containsKey((String)controlValue)) {
                            dependentPicklistValues.put((String)controlValue, new List<String>());
                        }
                        dependentPicklistValues.get((String)controlValue).add(entry.getValue());
                    }
                }
            }

            return dependentPicklistValues;
        }
    }

    private class InvokeApexAction extends Action {
        public InvokeApexAction() {
            super('invokeApex');
            param('className', String.class, 'The apex class name');
            param('action', String.class, 'The apex action name');
            param('args', String.class, 'The apex action args in JSON');
        }

        public override Object execAction(Object arg1, Object arg2, Object arg3) {
            String className = (String)arg1;
            String action = (String)arg2;
            String argsJSON = (String)arg3;

            Map<String, Object> args = new Map<String, Object>();
            if(!String.isBlank(argsJSON)) {
                args = (Map<String, Object>)JSON.deserializeUntyped(argsJSON);
            }

            Integer pos = className.indexOf('.');
            String ns = null;
            if(pos > 0) {
                ns = className.substring(0, pos);
                className = className.substring(pos + 1);
            }

            Type t = Type.forName(ns, className);

            if(t != null) {
                Callable c = (Callable)t.newInstance();
                return c.call(action, args);
            }

            return null;
        }
    }

    private class GetVisualforceDomainURL extends Action {
        public GetVisualforceDomainURL() {
            super('getVisualforceDomainURL');
        }

        public override Object execAction() {
            PageReference vfPage = Page.APIVisualforceDomainPage;
            return vfPage.getContent().toString().trim();
        }
    }

    private class GetOrgDomainURL extends Action {
        public GetOrgDomainURL() {
            super('getOrgDomainURL');
        }

        public override Object execAction() {
            return URL.getOrgDomainUrl().toExternalForm();
        }
    }

    private class RegisterConfigsAction extends Action {
        public RegisterConfigsAction() {
            super('registerConfigs');
        }

        public override Object execAction() {
            SystemConfig.registerConfigs();

            return null;
        }
    }

    private class SearchHelpAction extends Action {
        public SearchHelpAction() {
            super('searchHelp');
            param('searchText', String.class, 'The search text');
        }

        public override Object execAction(Object arg) {
            String searchText = (String)arg;

            List<List<sObject>> itemList = [ FIND :searchText IN ALL FIELDS RETURNING CRM_Help__c(Id,Title__c,Content__c,Type__c) ];
            List<CRM_Help__c> helps = (List<CRM_Help__c>)itemList.get(0);

            List<Map<String, Object>> result = new List<Map<String, Object>>();
            for(CRM_Help__c help : helps) {
                Map<String, Object> item = (Map<String, Object>)GlobalDTOMapper.F.toMap.run(help);
                String content = (String)item.get('Content__c');
                if(content != null && content.length() > 300) {
                    item.put('Content__c', content.substring(0, 300) + ' ...');
                }

                result.add(item);
            }

            return result;
        }
    }

    private class LoadHelpAction extends Action {
        public LoadHelpAction() {
            super('loadHelp');
            param('id', String.class, 'The help item id');
            param('key', String.class, 'The help item key');
            param('title', String.class, 'The help item title');
        }

        private CRM_Help__c getParent(Id parentId) {
            return (CRM_Help__c)new Query('CRM_Help__c').selectFields('Id,Title__c,Parent__c').byId(parentId).fetch();
        }

        public override Object execAction(Object arg1, Object arg2, Object arg3) {
            String id = (String)arg1;
            String key = (String)arg2;
            String title = (String)arg3;

            Query q = new Query('CRM_Help__c')
                .selectFields('Id,Title__c,Keywords__c,Content__c,Parent__c,Type__c')
                .addSubQuery(
                    Query.subQuery('CRM_Helps__r')
                        .selectFields('Id,Title__c,Type__c')
                );

            if(!String.isEmpty(key)) {
                q.addConditionLike('Keywords__c', '%' + key + '%')
                 .addConditionNotEq('Type__c', 'Guide');
            }
            else if(!String.isEmpty(title)) {
                q.addConditionEq('Title__c', title);
            }
            else {
                q.byId(id);
            }

            CRM_Help__c help = (CRM_Help__c)q.fetch();

            if(help != null) {
                Map<String, Object> data = (Map<String, Object>)GlobalDTOMapper.F.toMap.run(help);

                List<Map<String, Object>> parents = new List<Map<String, Object>>();
                Id parentId = (Id)data.get('Parent__c');
                while(parentId != null) {
                    CRM_Help__c parent = this.getParent(parentId);
                    if(parent != null) {
                        parentId = parent.Parent__c;
                        parents.add((Map<String, Object>)GlobalDTOMapper.F.toMap.run(parent));
                    }
                    else {
                        parentId = null;
                    }
                }

                data.put('Parents', parents);

                return data;
            }
            else {
                return null;
            }
        }
    }

    private class RemoveConfigItemAction extends Action {
        public RemoveConfigItemAction() {
            super('removeConfigItem');
            param('path', String.class, 'The config item path');
        }

        public override Object execAction(Object arg) {
            String path = (String)arg;

            ConfigManager.removeConfigItem(path);

            return null;
        }
    }

    private class AddConfigItemAction extends Action {
        public AddConfigItemAction() {
            super('addConfigItem');
            param('item', String.class, 'The config item, in JSON');
            returnRaw();
        }

        public override Object execAction(Object arg) {
            String itemJSON = (String)arg;
            Map<String, Object> item = (Map<String, Object>)JSON.deserializeUntyped(itemJSON);

            String path = (String)item.get('path');
            String type = (String)item.get('type');
            String value = (String)item.get('value');
            String description = (String)item.get('description');
            List<String> values = (List<String>)item.get('values');

            ConfigManager.addConfigItem(path, type, value, description, values);
            return ConfigManager.getValue(path);
        }
    }

    private class ImportConfigItemsAction extends Action {
        public ImportConfigItemsAction() {
            super('importConfigItems');
            param('items', String.class, 'The config items, in JSON');
            returnRaw();
        }

        public override Object execAction(Object arg) {
            String itemsJSON = (String)arg;
            List<Object> items = (List<Object>)JSON.deserializeUntyped(itemsJSON);

            List<Config_Item__c> newItems = new List<Config_Item__c>();
            for(Object item : items) {
                Map<String, Object> itemData = (Map<String, Object>)item;
                String path = (String)itemData.get('Path__c');
                String type = (String)itemData.get('Type__c');
                String value = (String)itemData.get('Value__c');
                String description = (String)itemData.get('Description__c');
                String values = (String)itemData.get('Values__c');

                Config_Item__c newItem = new Config_Item__c();
                newItem.Path__c = path;
                newItem.Type__c = type;
                newItem.Value__c = value;
                newItem.Description__c = description;
                newItem.Values__c = values;
                newItems.add(newItem);
            }

            ConfigManager.importConfigItems(newItems);

            return null;
        }
    }

    private class SearchQuickTextAction extends Action {
        public SearchQuickTextAction() {
            super('searchQuickText');
            param('searchText', String.class, 'The search text');
            param('categories', String.class, 'The categories, separated by comma');
            param('channel', String.class, 'The channel');
        }

        public override Object execAction(Object arg1, Object arg2, Object arg3) {
            String searchText = (String)arg1;
            String categories = (String)arg2;
            String channel = (String)arg3;

            Query q = new Query('QuickText')
                .selectFields('Id,Name,Message,Category')
                .addConditionLike('Name', '%' + searchText + '%');

            if(!String.isBlank(categories)) {
                q.addConditionIn('Category', categories.split(','));
            }

            if(!String.isBlank(channel)) {
                q.addConditionEq('Channel', channel);
            }

            return R.of(q.run()).doMap(GlobalDTOMapper.F.toMap).toList();
        }
    }

    private class BatchQueryFieldsAction extends Action {
        public BatchQueryFieldsAction() {
            super('batchQueryFields');
            param('ids', String.class, 'The list of ids, separated by semicolon');
            param('fields', String.class, 'The list of fields, separated by semicolon');

            returnRaw();
        }

        public override Object execAction(Object arg1, Object arg2) {
            String idsStr = (String)arg1;
            String fieldsStr = (String)arg2;

            if(String.isBlank(idsStr) || String.isBlank(fieldsStr)) {
                return new List<Object>();
            }

            List<String> ids = idsStr.split(';');
            List<String> fields = fieldsStr.split(';');

            Id sampleId = (Id)ids.get(0);
            Schema.SObjectType token = sampleId.getSObjectType();

            return new Query(token.getDescribe().getName(), null)
                .selectFields(fields)
                .addConditionIn('Id', ids)
                .run();
        }
    }

    private class GetFileContentAction extends Action {
        public GetFileContentAction() {
            super('getFileContent');
            param('name', String.class, 'The static resource file name');
        }

        public override Object execAction(Object arg) {
            String name = (String)arg;

            Map<String, String> data = new Map<String, String>();
            List<StaticResource> srList = [ SELECT Id, Body FROM StaticResource WHERE Name = :name LIMIT 1 ];
            if(!srList.isEmpty()) {
                String id = srList[0].Id;
                String body = srList[0].Body.toString();
                data.put('id', id);
                data.put('body', body);
            }

            return data;
        }
    }

    private class SetConfigAction extends Action {
        public SetConfigAction() {
            super('setConfig');
            param('path', String.class, 'The config path');
            param('value', String.class, 'The config value');
        }

        public override Object execAction(Object arg1, Object arg2) {
            String path = (String)arg1;
            String value = (String)arg2;

            ConfigManager.setValue(path, value);

            return null;
        }
    }

    private class GetConfigItemsAction extends Action {
        public GetConfigItemsAction() {
            super('getConfigItems');
        }

        public override Object execAction() {
            List<Config_Item__c> items = ConfigManager.getConfigItems(null);

            items.add(ConfigManager.buildConfigItem('/System/UserInfo[Readonly]/Name', UserInfo.getName(), 'String', 'Current user name'));
            items.add(ConfigManager.buildConfigItem('/System/UserInfo[Readonly]/Id', UserInfo.getUserId(), 'String', 'Current user id'));
            Id profileId = UserInfo.getProfileId();
            Profile p = [ select Id, Name from Profile where Id =: profileId ];
            items.add(ConfigManager.buildConfigItem('/System/UserInfo[Readonly]/ProfileName', p.Name, 'String', 'Current user profile name'));

            User u = (User)new Query('User').selectFields('Id,Features__c').byId(UserInfo.getUserId()).fetch();

            items.add(ConfigManager.buildConfigItem('/System/UserInfo[Readonly]/Features', u.Features__c, 'MultiPicklist', 'Current user features', u.Features__c));

            items.add(ConfigManager.buildConfigItem('/System/Site[Readonly]/Id', Site.getSiteId(), 'String', 'Current site id'));
            items.add(ConfigManager.buildConfigItem('/System/Site[Readonly]/Name', Site.getName(), 'String', 'Current site name'));
            items.add(ConfigManager.buildConfigItem('/System/Site[Readonly]/BaseUrl', Site.getBaseUrl(), 'String', 'Current site base url'));

            return R.of(items).doMap(GlobalDTOMapper.F.toMap).toList();
        }
    }

    private class DescribeObjectsAction extends Action {
        public DescribeObjectsAction() {
            super('describeObjects');
            param('sObjectNames', String.class, 'The list of sObject names, separated by semicolon');

            returnRaw();
        }

        public override Object execAction(Object arg) {
            String sObjectNamesStr = (String)arg;
            if(String.isBlank(sObjectNamesStr)) {
                return new Map<String, String>();
            }

            List<String> sObjectNames = sObjectNamesStr.split(';');

            Map<String, String> result = new Map<String, String>();
            for(String sObjectName : sObjectNames) {
                Schema.SObjectType type = Schema.getGlobalDescribe().get(sObjectName);
                Schema.DescribeSObjectResult typeDesc = type.getDescribe();
                result.put(sObjectName, typeDesc.getLabel());
            }

            return result;
        }
    }

    private class DescribeFieldsAction extends Action {
        public DescribeFieldsAction() {
            super('describeFields');
            param('sObjectName', String.class, 'The sObject name');
            param('fields', String.class, 'The list of field names, separated by semicolon');

            returnRaw();
        }

        public override Object execAction(Object arg1, Object arg2) {
            String sObjectName = (String)arg1;
            String fieldsStr = (String)arg2;
            if(String.isBlank(fieldsStr)) {
                return new Map<String, Schema.DescribeFieldResult>();
            }

            List<String> fields = fieldsStr.split(';');

            Schema.SObjectType type = Schema.getGlobalDescribe().get(sObjectName);
            Schema.DescribeSObjectResult typeDesc = type.getDescribe();
            Map<String, Schema.SObjectField> fieldMap = typeDesc.fields.getMap();
            Map<String, Schema.DescribeFieldResult> result = new Map<String, Schema.DescribeFieldResult>();

            for(String fieldName : fields) {
                if(String.isBlank(fieldName)) {
                    continue;
                }

                Schema.DescribeFieldResult field = fieldMap.get(fieldName).getDescribe();
                result.put(fieldName, field);
            }

            return result;
        }
    }

    private class SaveRecordAction extends Action {
        public SaveRecordAction() {
            super('saveRecord');
            param('record', String.class, 'The record');
            param('sObjectName', String.class, 'The sObject name');
        }

        public override Object execAction(Object arg1, Object arg2) {
            String recordStr = (String)arg1;
            String sObjectName = (String)arg2;

            SObject sObj = GlobalUtility.populateRecordData(null, recordStr, sObjectName);

            if(sObj.Id == null) {
                insert sObj;
            }
            else {
                update sObj;
            }

            return sObj;
        }
    }

    private class QueryFieldsAction extends Action {
        public QueryFieldsAction() {
            super('queryFields');
            param('request', String.class, 'The request JSON string');
        }

        public override Object execAction(Object arg) {
            String request = (String)arg;
            List<Object> requestItems = (List<Object>)JSON.deserializeUntyped(request);

            List<Object> result = new List<Object>();
            for(Object requestItem : requestItems) {
                Map<String, Object> requestData = (Map<String, Object>)requestItem;
                String recordId = (String)requestData.get('recordId');
                String sObjectName = (String)requestData.get('sObjectName');
                String fields = (String)requestData.get('fields');
                List<SObject> records = Database.query('SELECT ' + fields + ' FROM ' + sObjectName + ' WHERE Id = :recordId');
                Map<String, Object> data = new Map<String, Object>();
                if(!records.isEmpty()) {
                    SObject record = records.get(0);
                    List<String> fieldList = fields.split(',');
                    for(String field : fieldList) {
                        Object value = R.path.run(field, record);
                        data.put(field, value);
                    }
                }
                result.add(data);
            }

            return result;
        }
    }

    private class LoadRecordAction extends Action {
        public LoadRecordAction() {
            super('loadRecord');
            param('id', String.class, 'The id');
            param('fields', String.class, 'The field names, separated by comma');
        }

        public override Object execAction(Object arg1, Object arg2) {
            String idStr = (String)arg1;
            String fields = (String)arg2;

            String name = Id.valueOf(idStr).getSObjectType().getDescribe().getName();
            String selectFields = String.isBlank(fields) ? 'Id' : 'Id,' + fields;
            List<SObject> result = new Query(name, '')
                    .selectFields(selectFields)
                    .byId(idStr)
                    .allRows()
                    .run();
            if(!result.isEmpty()) {
                return result.get(0);
            }
            else {
                return null;
            }
        }
    }

    private class GetSObjectNameAction extends Action {
        public GetSObjectNameAction() {
            super('getSObjectName');
            param('id', String.class, 'The id');
        }

        public override Object execAction(Object arg) {
            String idStr = (String)arg;

            String name = Id.valueOf(idStr).getSObjectType().getDescribe().getName();
            return name;
        }
    }

    private class DoRestApiAction extends Action {
        public DoRestApiAction() {
            super('doRestApi');
            param('request', String.class, 'The request object in JSON string');
        }

        public override Object execAction(Object arg) {
            String jsonStr = (String)arg;
            Map<String, Object> request = (Map<String, Object>)JSON.deserializeUntyped(jsonStr);

            RestExplorer explorer = new RestExplorer();
            String url = (String)request.get('url');
            if(String.isBlank(url)) {
                return null;
            }
            explorer.setEndpoint(url);

            String method = (String)request.get('method');
            if(String.isBlank(method)) {
                method = 'get';
            }

            if('get'.equalsIgnoreCase(method)) {
                explorer.doGet();
            }
            else if('post'.equalsIgnoreCase(method)) {
                explorer.doPost();
            }
            else if('put'.equalsIgnoreCase(method)) {
                explorer.doPut();
            }
            else if('patch'.equalsIgnoreCase(method)) {
                explorer.doPatch();
            }
            else if('delete'.equalsIgnoreCase(method)) {
                explorer.doDelete();
            }

            Map<String, Object> parameters = (Map<String, Object>)request.get('headers');
            if(parameters != null) {
                explorer.addParameters(parameters);
            }

            Object body = request.get('body');
            if(body != null) {
                explorer.setBody(body);
            }

            return explorer.getJsonResult();
        }
    }

    private class LoadRecordDefaultsAction extends Action {
        public LoadRecordDefaultsAction() {
            super('loadRecordDefaults');
            param('sObjectName', String.class, 'The sObject name');
        }

        public override Object execAction(Object arg1) {
            String sObjectName = (String)arg1;

            Schema.DescribeSobjectResult[] results = Schema.describeSObjects(new List<String>{ sObjectName });
            Schema.DescribeSobjectResult result = results[0];

            Map<String, Schema.SObjectField> fieldMap = result.fields.getMap();
            Map<String, Object> ret = new Map<String, Object>();
            for(String key : fieldMap.keySet()) {
                Schema.SObjectField field = fieldMap.get(key);
                Object defaultVal = field.getDescribe().getDefaultValue();
                ret.put(key, defaultVal);
            }

            return ret;
        }
    }

    private class GetNamesAction extends Action {
        public GetNamesAction() {
            super('getNames');
            param('idList', String.class, 'The id list, separated by comma');
        }

        public override Object execAction(Object arg) {
            String idList = (String)arg;
            Map<String, List<String>> data = new Map<String, List<String>>();

            if(String.isBlank(idList)) {
                return new List<String>();
            }

            List<String> ids = idList.split(',');
            for(String i : ids) {
                try {
                    String sObjectName = Id.valueOf(i).getSObjectType().getDescribe().getName();
                    List<String> items = data.get(sObjectName);
                    if(items == null) {
                        items = new List<String>();
                    }
                    items.add(i);
                    data.put(sObjectName, items);
                }
                catch(Exception e) {
                }
            }

            Schema.DescribeSobjectResult[] results = Schema.describeSObjects(new List<String>(data.keySet()));
            List<String> names = new List<String>();

            for(Schema.DescribeSobjectResult result : results) {
                Map<String, Schema.SObjectField> fieldMap = result.fields.getMap();
                String nameField = null;
                for(Schema.SObjectField f : fieldMap.values()) {
                    Schema.DescribeFieldResult field = f.getDescribe();
                    if(field.isNameField()) {
                        nameField = field.getName();
                        break;
                    }
                }

                String sObjectName = result.getName();
                String localName = result.getLocalName();
                List<sObject> items = new Query(localName)
                    .selectField('Id')
                    .selectField(nameField)
                    .byId(data.get(sObjectName))
                    .run();
                Map<Id, sObject> itemsMap = new Map<Id, sObject>(items);

                for(String id : data.get(sObjectName)) {
                    sObject item = itemsMap.get(id);
                    if(item != null) {
                        names.add(String.valueOf(item.get(nameField)));
                    }
                    else {
                        names.add(null);
                    }
                }
            }

            return names;
        }
    }

    private with sharing class SearchReferenceAction extends Action {
        public SearchReferenceAction() {
            super('searchReference');
            param('referenceTypes', String.class, 'Reference type list, separated by comma');
            param('searchText', String.class, 'The search text');
            returnRaw();
        }

        public override Object execAction(Object arg1, Object arg2) {
            String referenceTypes = (String)arg1;
            String searchText = (String)arg2;

            searchText = searchText.replaceAll('\'', '\\\\\'');

            Schema.DescribeSobjectResult[] results = Schema.describeSObjects(referenceTypes.split(','));
            Schema.DescribeSobjectResult[] filteredResults = new List<Schema.DescribeSobjectResult>();
            for(Schema.DescribeSobjectResult result : results) {
                if(result.isSearchable()) {
                    filteredResults.add(result);
                }
            }
            results = filteredResults;

            Map<String, String> nameFields = new Map<String, String>();
            for(Schema.DescribeSobjectResult result : results) {
                Map<String, Schema.SObjectField> fieldMap = result.fields.getMap();
                for(Schema.SObjectField f : fieldMap.values()) {
                    Schema.DescribeFieldResult field = f.getDescribe();
                    if(field.isNameField()) {
                        nameFields.put(result.getName(), field.getName());
                    }
                }
            }

            Boolean isMiddleNameEnabled = AdminExtension.isMiddleNameEnabled();
            String query = 'FIND \'' + searchText + '\' IN ALL FIELDS RETURNING ';
            List<String> returningList = new List<String>();
            Integer index = 0;
            for(String name : nameFields.keySet()) {
                String nameField = nameFields.get(name);
                if(name == 'Account') {
                    returningList.add(name + '(id,Name,LastName,FirstName' + (isMiddleNameEnabled ? ',MiddleName' : '') + ')');
                }
                else {
                    returningList.add(name + '(id,' + nameField + ')');
                }
                index += 1;
            }
            query += String.join(returningList, ',');

            List<List<SObject>> dataResult = search.query(query);
            Boolean isSameType = dataResult.size() == 1;

            List<PicklistOption> options = new List<PicklistOption>();
            for(Integer i = 0; i < results.size(); i++) {
                Schema.DescribeSobjectResult result = results.get(i);
                String referenceTypeLabel = result.getLabel();
                String nameField = nameFields.get(result.getName());
                List<SObject> dataResultItem = dataResult.get(i);
                for(SObject sObj : dataResultItem) {
                    PicklistOption option = new PicklistOption();
                    option.value = String.valueOf(sObj.get('Id'));
                    if(isSameType) {
                        option.label = String.valueOf(this.getLabel(sObj, result.getName(), nameField, isMiddleNameEnabled));
                    }
                    else {
                        option.label = referenceTypeLabel + ': ' + this.getLabel(sObj, result.getName(), nameField, isMiddleNameEnabled);
                    }
                    options.add(option);
                }
            }

            return options;
        }

        private Object getLabel(SObject sObj, String type, String nameField, Boolean isMiddleNameEnabled) {
            if(type == 'Account') {
                String firstName = (String)sObj.get('FirstName');
                String lastName = (String)sObj.get('LastName');
                String middleName = isMiddleNameEnabled ? (String)sObj.get('MiddleName') : '';
                String name = (String)sObj.get('Name');
                if(String.isEmpty(firstName) && String.isEmpty(lastName) && String.isEmpty(middleName)) {
                    return name;
                }
                else {
                    return String.isEmpty(middleName) ? firstName + ' ' + lastName : firstName + ' ' + middleName + ' ' + lastName;
                }
            }
            else {
                return sObj.get(nameField);
            }
        }
    }

    private class DescribeAction extends Action {
        public DescribeAction() {
            super('describe');
            param('sObjectName', String.class, 'The sObject name, like [Task]');
            param('layoutName', String.class, 'The layout name, like [Task-Task Layout]');
            returnRaw();
        }

        public override Object execAction(Object arg1, Object arg2) {
            String sObjectName = (String)arg1;
            String layoutName = (String)arg2;

            List<Metadata.Metadata> layouts = Metadata.Operations.retrieve(Metadata.MetadataType.Layout, new List<String> { layoutName });
            if(layouts == null || layouts.isEmpty()) {
                return null;
            }

            Metadata.Layout layout = (Metadata.Layout)layouts.get(0);

            String [] types = new String[] { sObjectName };

            Schema.DescribeSobjectResult[] results = Schema.describeSObjects(types);
            if(results == null || results.isEmpty()) {
                return null;
            }
            Schema.DescribeSobjectResult result = results[0];

            PageLayout p = new PageLayout();

            Map<String, Schema.SObjectField> fieldMap = result.fields.getMap();

            for(Metadata.LayoutSection section : layout.layoutSections) {
                PageLayoutGroup g = new PageLayoutGroup();
                g.label = section.label;
                g.style = String.valueOf(section.style);
                g.detailHeading = section.detailHeading;
                g.editHeading = section.editHeading;

                for(Metadata.LayoutColumn column : section.layoutColumns) {
                    PageLayoutGroupColumn c = new PageLayoutGroupColumn();

                    if(column.layoutItems == null) {
                        continue;
                    }

                    for(Metadata.LayoutItem item : column.layoutItems) {
                        PageLayoutGroupItem i = new PageLayoutGroupItem();
                        i.field = trimNamespace(item.field);
                        i.behavior = String.valueOf(item.behavior);

                        Schema.SObjectField field = fieldMap.get(item.field);
                        if(field != null) {
                            Schema.DescribeFieldResult fieldDesc = field.getDescribe();
                            if(fieldDesc != null) {
                                i.name = trimNamespace(fieldDesc.getName());
                                i.label = fieldDesc.getLabel();
                                i.tooltip = fieldDesc.getInlineHelpText();
                                i.canView = fieldDesc.isAccessible();
                                i.canEdit = fieldDesc.isUpdateable();
                                i.canCreate = fieldDesc.isCreateable();
                                Schema.DisplayType type = fieldDesc.getType();
                                i.type = String.valueOf(type);
                                Schema.sObjectField controlToken = fieldDesc.getController();
                                if(controlToken != null) {
                                    i.controllerName = controlToken.getDescribe().getName();
                                }
                                if(type == Schema.DisplayType.Reference) {
                                    for(Schema.sObjectType sObjType : fieldDesc.getReferenceTo()) {
                                        PicklistOption option = new PicklistOption();
                                        Schema.DescribeSobjectResult sObjTypeDesc = sObjType.getDescribe();
                                        option.label = sObjTypeDesc.getLabel();
                                        option.value = sObjTypeDesc.getName();
                                        i.referenceTypes.add(option);
                                    }
                                    if(i.label.endsWith(' ID')) {
                                        i.label = i.label.substring(0, i.label.length() - 3);
                                    }
                                }
                                else if(type == Schema.DisplayType.Combobox || type == Schema.DisplayType.Picklist || type == Schema.DisplayType.MultiPicklist) {
                                    for(Schema.PicklistEntry entry : fieldDesc.getPicklistValues()) {
                                        if(entry.isActive()) {
                                            PicklistOption option = new PicklistOption();
                                            option.label = entry.getLabel();
                                            option.value = entry.getValue();
                                            i.options.add(option);
                                        }
                                    }
                                }
                            }
                        }

                        c.items.add(i);
                    }

                    g.columns.add(c);
                }

                p.groups.add(g);
            }

            return p;
        }
    }

    public class PageLayout {
        public List<PageLayoutGroup> groups = new List<PageLayoutGroup>();
    }

    public class PageLayoutGroup {
        public String label;
        public String style;
        public Boolean detailHeading;
        public Boolean editHeading;
        public List<PageLayoutGroupColumn> columns = new List<PageLayoutGroupColumn>();
    }

    public class PageLayoutGroupColumn {
        public List<PageLayoutGroupItem> items = new List<PageLayoutGroupItem>();
    }

    public class PageLayoutGroupItem {
        public String name;
        public String field;
        public String behavior;
        public String label;
        public String type;
        public String tooltip;
        public Boolean canEdit;
        public Boolean canCreate;
        public Boolean canView;
        public List<PicklistOption> referenceTypes = new List<PicklistOption>();
        public List<PicklistOption> options = new List<PicklistOption>();
        public String controllerName;
    }

    public class PicklistOption {
        public String label;
        public String value;
    }
}
