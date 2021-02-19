public class ChatBotCallable implements Callable {
    private Object version() {
        SObject sobj = [select id, lastModifiedBy.Name, lastModifiedDate from staticresource where name = 'ctcPropertyLightning'];

        return sobj;
    }

    private Object sendMessage(String message) {
        return this.sendEvent('UI Notification', 'Message', message);
    }

    private Object sendBotMessage(String target, String message) {
        return this.sendEvent('Bot Message', target, message);
    }

    private Object sendEvent(String type, String title, String data) {
        CTC_Event__e e = new CTC_Event__e();
        e.Type__c = type;
        e.Title__c = title;
        e.Data__c = data;
        EventBus.publish(e);

        return null;
    }

    public Object call(String action, Map<String, Object> args) {
        if(action == 'version') {
            return version();
        }
        else if(action == 'sendMessage') {
            return sendMessage((String)args.get('message'));
        }
        else if(action == 'sendEvent') {
            return sendEvent((String)args.get('type'), (String)args.get('title'), (String)args.get('data'));
        }
        else if(action == 'sendBotMessage') {
            return sendBotMessage((String)args.get('target'), (String)args.get('message'));
        }

        return null;
    }
}
