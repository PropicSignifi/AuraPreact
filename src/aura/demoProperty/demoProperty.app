<aura:application access="GLOBAL" extends="force:slds" >
    <ltng:require
        scripts="{! join(',',
            $Resource.ctcPropertyLightning + '/lib/mjml.js'
        ) }"
    />

    <c:gLightningExtension/>
    <c:dataLightningExtension/>
    <c:demoRoot/>
</aura:application>
