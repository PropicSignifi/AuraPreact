<aura:application access="GLOBAL" extends="force:slds" >
    <aura:attribute name="serviceName" type="String"/>

    <c:remoteApiRoot serviceName="{! v.serviceName }"/>
</aura:application>
