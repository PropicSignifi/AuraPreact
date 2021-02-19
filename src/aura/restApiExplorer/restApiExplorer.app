<aura:application access="GLOBAL" extends="c:baseApplication" >
    <c:gLightningExtension/>
    <c:dataLightningExtension/>

    <c:preact aura:id="preact" name="restApiExplorer" waitFor="GLightningExtension,DataLightningExtension"/>
</aura:application>
