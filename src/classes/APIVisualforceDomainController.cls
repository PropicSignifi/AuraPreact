public with sharing class APIVisualforceDomainController {
    public String getDomainURL() {
        URL requestURL = URL.getCurrentRequestUrl();
        return requestURL.toExternalForm().substringBefore(requestURL.getPath());
    }
}
