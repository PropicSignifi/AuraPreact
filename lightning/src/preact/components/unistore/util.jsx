import Analytics from '../utils/analytics';
import Patch from '../utils/patch';

// Bind an object/factory of actions to the store and wrap them.
export function mapActions(actions, store, globalData, wrapperName) {
	if (typeof actions==='function') actions = actions(store);
	let mapped = {};
	for (let i in actions) {
        const f = store.action(actions[i], i);
        mapped[i] = (...args) => {
            const state = store.getState();
            Analytics.fireActionEvent(state.preactContainer, i, _.get(globalData, 'recordId'));

            const fn = function(store, state, ...args) {
                return f(...args);
            };

            const patchedFn = Patch.applyPatchToFunction(wrapperName, i, fn);
            return patchedFn(store, state, ...args);
        };
	}
	return mapped;
}


// select('foo,bar') creates a function of the form: ({ foo, bar }) => ({ foo, bar })
export function select(properties) {
	if (typeof properties==='string') properties = properties.split(/\s*,\s*/);
	return state => {
		let selected = {};
		for (let i=0; i<properties.length; i++) {
            const item = properties[i];
            if(typeof item === 'string') {
                selected[item] = state[item];
            }
            else {
                let name = null;
                let target = null;
                if(_.isArray(item)) {
                    [name, target] = item;
                }
                else if(_.isPlainObject(item)) {
                    name = item.name;
                    target = item.value;
                }
                else {
                    continue;
                }

                if(_.isFunction(target)) {
                    selected[name] = target(state);
                }
                else if(_.isString(target)) {
                    selected[name] = state[target];
                }
            }
		}
		return selected;
	};
}


// Lighter Object.assign stand-in
export function assign(obj, props) {
	for (let i in props) obj[i] = props[i];
	return obj;
}
