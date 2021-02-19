#!/bin/bash
option=$1
option2=$2
tmpdir=tmp
personalization=$CTC_PERSONALIZATION

if [[ -z $personalization ]] ; then
    personalization=enabled
fi

if [[ -z $option ]] ; then
    echo "Usage: ./deploy.sh <ui/aura/lwc/all>"
    exit 1
fi

rm -rf $tmpdir
mkdir -p $tmpdir

package=\
'<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>*</members>
        <name>StaticResource</name>
    </types>
    <version>40.0</version>
</Package>
'

meta=\
'<?xml version="1.0" encoding="UTF-8"?>
<StaticResource xmlns="http://soap.sforce.com/2006/04/metadata">
    <cacheControl>Private</cacheControl>
    <contentType>application/zip</contentType>
</StaticResource>
'

userId=''

if [ $personalization == "enabled" ] ; then
    if [[ -z $option2 ]] ; then
        userId=`echo 'System.debug(UserInfo.getUserId());' | sfdx force:apex:execute -u ctcproperty --loglevel debug | grep USER_DEBUG | cut -d '|' -f 5`
    else
        userId=`echo "List<User> users = [ SELECT Id FROM User WHERE Name LIKE '%$option2%' and Profile.Name = 'System Administrator' ]; System.debug(users[0].Id);" | sfdx force:apex:execute -u ctcproperty --loglevel debug | grep USER_DEBUG | cut -d '|' -f 5`
    fi
fi

if [ $option == "ui" ] || [ $option == "all" ] ; then
    sfdx force:apex:execute -u ctcproperty --loglevel debug > /dev/null << TEXT
CTC_Event__e e = new CTC_Event__e();
e.Type__c = 'UI Notification';
e.Title__c = 'Code Deploying';
e.Data__c = '$USER is deploying the code';
EventBus.publish(e);
TEXT

    gulp

    if [[ $? -ne 0 ]];then
        exit 1
    fi

    echo "Packaged"

    echo "$package" > $tmpdir/package.xml

    staticresource_dir=$tmpdir/staticresources
    mkdir -p $staticresource_dir

    cp ./dist/ctcPropertyLightning.zip $staticresource_dir/ctcPropertyLightning.resource
    echo $meta > $staticresource_dir/ctcPropertyLightning.resource-meta.xml

    cp ./dist/ctcPropertyLightningApp.zip $staticresource_dir/ctcPropertyLightningApp.resource
    echo $meta > $staticresource_dir/ctcPropertyLightningApp.resource-meta.xml

    if [[ ! -z $userId ]] ; then
        cp ./dist/ctcPropertyLightningApp.zip $staticresource_dir/ctcPropertyLightningApp_$userId.resource
        echo $meta > $staticresource_dir/ctcPropertyLightningApp_$userId.resource-meta.xml
    fi

    sfdx force:mdapi:deploy -u ctcproperty -d $tmpdir -w 100

    sfdx force:apex:execute -u ctcproperty --loglevel debug > /dev/null << TEXT
CTC_Event__e e = new CTC_Event__e();
e.Type__c = 'UI Notification';
e.Title__c = 'Code Deployed';
e.Data__c = '$USER has deployed the code';
EventBus.publish(e);
TEXT

    echo "Uploaded"

    if [[ $option == "ui" ]] ; then
        exit 0
    fi
fi

package=\
'<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <version>45.0</version>
</Package>
'

if [[ $option == "all" ]];then
    package=\
'<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>*</members>
        <name>AuraDefinitionBundle</name>
    </types>
    <types>
        <members>*</members>
        <name>LightningComponentBundle</name>
    </types>
    <version>45.0</version>
</Package>
'
elif [[ $option == "aura" ]];then
    package=\
'<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>*</members>
        <name>AuraDefinitionBundle</name>
    </types>
    <version>41.0</version>
</Package>
'
elif [[ $option == "lwc" ]];then
    package=\
'<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>*</members>
        <name>LightningComponentBundle</name>
    </types>
    <version>45.0</version>
</Package>
'
fi

rm -rf $tmpdir
mkdir -p $tmpdir
echo "$package" > $tmpdir/package.xml

if [ $option == "aura" ] || [ $option == "all" ]; then
    bundle_dir=$tmpdir/aura
    mkdir $bundle_dir
    cp -r ../src/aura/* $bundle_dir/
fi

if [ $option == "lwc" ] || [ $option == "all" ]; then
    lwc_dir=$tmpdir/lwc
    mkdir $lwc_dir
    cp -r ../src/lwc/* $lwc_dir/
fi

date
sfdx force:mdapi:deploy -u ctcproperty -d $tmpdir -w 100
date

rm -rf $tmpdir
