<aura:application access="GLOBAL" extensible="true" abstract="true" extends="force:slds" >
    <aura:if isTrue="{! v.personalizedChecked }">
        <aura:if isTrue="{! v.personalized }">
            <ltng:require
                styles="{! join(',',
                    $Resource.ctcPropertyLightning + '/css/app.css',
                    $Resource.ctcPropertyLightningApp + v.personalized + '/preact-app.css'
                ) }"
            />
            <ltng:require
                scripts="{! join(',',
                    $Resource.ctcPropertyLightning + '/lib/lodash.js',
                    $Resource.ctcPropertyLightning + '/js/library.js',
                    $Resource.ctcPropertyLightning + '/js/app.js',
                    $Resource.ctcPropertyLightningApp + v.personalized + '/preact-app.js'
                ) }"
                afterScriptsLoaded="{! c.onScriptsLoaded }"
            />
            <aura:set attribute="else">
                <ltng:require
                    styles="{! join(',',
                        $Resource.ctcPropertyLightning + '/css/app.css',
                        $Resource.ctcPropertyLightningApp + '/preact-app.css'
                    ) }"
                />
                <ltng:require
                    scripts="{! join(',',
                        $Resource.ctcPropertyLightning + '/lib/lodash.js',
                        $Resource.ctcPropertyLightning + '/js/library.js',
                        $Resource.ctcPropertyLightning + '/js/app.js',
                        $Resource.ctcPropertyLightningApp + '/preact-app.js'
                    ) }"
                    afterScriptsLoaded="{! c.onScriptsLoaded }"
                />
            </aura:set>
    	</aura:if>
    </aura:if>

    <ltng:require
        scripts="{! join(',',
            $Resource.ctcPropertyLightning + '/lib/moment.js',
            $Resource.ctcPropertyLightning + '/lib/moment.timezone-with-data.js',
            $Resource.ctcPropertyLightning + '/lib/jquery.min.js'
        ) }"
        afterScriptsLoaded="{! c.onScriptsLoaded }"
    />
    <ltng:require
        scripts="{! join(',',
            $Resource.ctcPropertyLightning + '/lib/libphonenumber.js'
        ) }"
        afterScriptsLoaded="{! c.onScriptsLoaded }"
    />
    <ltng:require
        scripts="{! join(',',
            $Resource.ctcPropertyLightning + '/lib/pjxml.js'
        ) }"
        afterScriptsLoaded="{! c.onScriptsLoaded }"
    />

    <aura:attribute name="loading" type="Boolean" access="PUBLIC" default="true"
        description="Indicator of whether it is loading. Not to be set externally."/>
    <aura:attribute name="computed" type="Map" default="{}"
        description="The computed object. Not to be set externally."/>
    <aura:attribute name="personalized" type="Boolean"/>
    <aura:attribute name="personalizedChecked" type="Boolean"/>

    <aura:attribute name="privateAlert" type="Object" access="PRIVATE"
        description="The global alert for the application"/>
    <aura:attribute name="privateToast" type="Object" access="PRIVATE"
        description="The global toast for the application"/>

    <aura:attribute name="privateChildren" type="List"/>

    <aura:method name="getChildren" access="GLOBAL">
    </aura:method>
    <aura:method name="alert" access="GLOBAL">
        <aura:attribute name="options" type="Object"/>
    </aura:method>
    <aura:method name="toast" access="GLOBAL">
        <aura:attribute name="options" type="Object"/>
    </aura:method>

    <aura:registerEvent name="$init" type="c:dataEvent" access="GLOBAL"
        description="The event is fired when the application is initiated."/>
    <aura:registerEvent name="$destroy" type="c:dataEvent" access="GLOBAL"
        description="The event is fired when the application is destroyed."/>

    <aura:handler name="init" value="{! this }" action="{! c.doInit }"/>
    <aura:handler name="$heartbeat" event="c:dataEvent" includeFacets="true" action="{! c.heartbeat }"/>
    <aura:handler event="aura:locationChange" action="{! c.onLocationChange }"/>

    <c:toast visible="{! v.privateToast.visible }" contentText="{! v.privateToast.content }" variant="{! v.privateToast.variant }" position="{! v.privateToast.position }"/>
    <div class="root">
        <c:spinner aura:id="spinner" size="large" variant="brand" container="with_fixed" alternativeText="loading" class="{! v.loading ? '' : 'slds-hide' }"></c:spinner>

        {! v.body }
    </div>
    <aura:if isTrue="{! v.privateAlert }">
        <c:modal aura:id="alertModal" headerText="{! v.privateAlert.header }">
            <p>{! v.privateAlert.message }</p>
            <aura:set attribute="footer">
                <c:button variant="neutral" label="{! v.privateAlert.onCancelText }" onclick="{! c.onAlertCancel }"/>
                <aura:if isTrue="{! v.privateAlert.onOtherText }">
                    <c:button variant="secondary" label="{! v.privateAlert.onOtherText }" onclick="{! c.onAlertOther }"/>
                </aura:if>
                <c:button variant="brand" label="{! v.privateAlert.onSaveText }" onclick="{! c.onAlertSave }"/>
            </aura:set>
        </c:modal>
    </aura:if>
</aura:application>
