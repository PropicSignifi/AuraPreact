// This is a generated file. Please do not modify it.
global class GLightningExtension {

    private static Action.Registry registry = new Action.Registry();

    static {
        registry.action(new ExecuteAction());
    }

    @AuraEnabled
    public static Object invoke(String name, Map<String, Object> args) {
        return registry.invoke(name, args);
    }

    @AuraEnabled
    public static Map<String, Action> apiDescriptorForLightning() {
        return registry.actions;
    }

    private class ExecuteAction extends Action {
        public ExecuteAction() {
            super('execute');
            param('query', String.class, 'query');

        }
        public override Object execAction(Object arg0) {
            String query = (String)arg0;
            System.debug('Executing Query: ' + query);
            GObjectService.register();
            return G.execute(query);
        }
    }
}
