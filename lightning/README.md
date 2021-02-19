Steps to Set up Lightning Development Environment

1. Run npm install.

2. Copy env.sample.sh to env.sh and update the credentials.

3. Run login.sh before you want to connect to the salesforce org if it is the first time.

4. Run deploy.sh to build, package and deploy to the salesforce org.

5. Or run gulp only to build and package, without deploying to the salesforce org.

6. Run `export CTC_ENV=prod; gulp` to build package with production namespace.


To use Lightning components inside Angular in visualforce pages, follow below steps:

1. Add lightning components to 'lcvf.app'.

2. Add '<apex:includeLightning />' into the visualforce page.

3. Add 'slds-scope' to the class of the body in the visualforce page.

4. Add '<div id="container"/>' in html template

5. In angular controllers, add dependency 'ComponentService'

6. In init code, add below
```javascript
ComponentService.createComponents([
    {
        container: 'container',
        type: 'c:prospector',
        params: {
        },
        handlers: {},
    }
]);
```
