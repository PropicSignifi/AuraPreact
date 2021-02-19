Important:

This copy of preact is modified because of a conflict of event registration when running on salesforce lightning.

In preact.esm.js, we changed the original registration of eventProxy when calling addEventListener to a wrapped function call of the eventProxy, to avoid the lightning event callback cache trap.
