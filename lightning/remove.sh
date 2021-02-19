#!/bin/bash
NAME=$1
tmpdir=tmp

if [[ "$NAME" == "" ]];then
    echo "Name is required"
    exit -1
fi

package=\
'<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <version>41.0</version>
</Package>
'
destructiveChanges=\
'<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>'$NAME'</members>
        <name>AuraDefinitionBundle</name>
    </types>
    <version>41.0</version>
</Package>
'

mkdir -p $tmpdir
echo "$package" > $tmpdir/package.xml
echo "$destructiveChanges" > $tmpdir/destructiveChanges.xml

date
sfdx force:mdapi:deploy -u MySandbox -d $tmpdir -w 100
date

rm -rf $tmpdir
