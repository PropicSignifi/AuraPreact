import { h, Component } from 'preact';
import { assign, mapActions, select } from '../util';
import Patch from '../../utils/patch';

/** Wire a component up to the store. Passes state as props, re-renders on change.
 *  @param {Function|Array|String} mapStateToProps  A function mapping of store state to prop values, or an array/CSV of properties to map.
 *  @param {Function|Object} [actions]                 Action functions (pure state mappings), or a factory returning them. Every action function gets current state as the first parameter and any other params next
 *  @returns {Component} ConnectedComponent
 *  @example
 *    const Foo = connect('foo,bar')( ({ foo, bar }) => <div /> )
 *  @example
 *    const actions = { someAction }
 *    const Foo = connect('foo,bar', actions)( ({ foo, bar, someAction }) => <div /> )
 *  @example
 *    @connect( state => ({ foo: state.foo, bar: state.bar }) )
 *    export class Foo { render({ foo, bar }) { } }
 */
export function connect(mapStateToProps, actions, lifecycles = {}) {
    if (typeof mapStateToProps!=='function') {
        mapStateToProps = select(mapStateToProps || []);
    }
    return Child => {
        function Wrapper(props, { store, globalData }) {
            let state = mapStateToProps(_.assign(store ? store.getState() : {}, props));
            let boundActions = actions ? mapActions(actions, store, globalData, lifecycles.name) : { store };

            const preactContainer = props.preactContainer;
            if(preactContainer && window.$PreactContainerHooks) {
                const preactContainerHook = window.$PreactContainerHooks[preactContainer];
                if(preactContainerHook && _.isFunction(preactContainerHook.actions)) {
                    const newBoundActions = mapActions(preactContainerHook.actions(boundActions), store, globalData, lifecycles.name);
                    _.assign(boundActions, newBoundActions);
                }
            }
            let update = () => {
                let mapped = mapStateToProps(_.assign(store ? store.getState() : {}, this.props));
                for (let i in mapped) if (mapped[i]!==state[i]) {
                    state = mapped;
                    return this.setState(null);
                }
                for (let i in state) if (!(i in mapped)) {
                    state = mapped;
                    return this.setState(null);
                }
            };

            let lc = null;
            if(_.isPlainObject(lifecycles)) {
                lc = _.mapValues(lifecycles, func => {
                    if(_.isFunction(func)) {
                        return func.bind(this);
                    }
                    else {
                        return func;
                    }
                });

                _.assign(this, lc);

                this.boundActions = boundActions;
                this.store = store;
            }

            this.getChildContext = () => {
                return {
                    boundActions,
                };
            };

            this.componentWillMount = () => {
                if(lc && _.isFunction(lc.componentWillMount)) {
                    lc.componentWillMount();
                }

                if(preactContainer && window.$PreactContainerHooks) {
                    const preactContainerHook = window.$PreactContainerHooks[preactContainer];
                    if(preactContainerHook && _.isFunction(preactContainerHook.componentWillMount)) {
                        return preactContainerHook.componentWillMount();
                    }
                }
            };

            this.componentDidMount = () => {
                update();
                store.subscribe(update);

                if(lc && _.isFunction(lc.componentDidMount)) {
                    lc.componentDidMount();
                }

                if(preactContainer && window.$PreactContainerHooks) {
                    const preactContainerHook = window.$PreactContainerHooks[preactContainer];
                    if(preactContainerHook && _.isFunction(preactContainerHook.componentDidMount)) {
                        return preactContainerHook.componentDidMount();
                    }
                }
            };

            this.componentWillReceiveProps = (nextProps, nextState) => {
                if(lc && _.isFunction(lc.componentWillReceiveProps)) {
                    lc.componentWillReceiveProps(nextProps, nextState);
                }

                if(preactContainer && window.$PreactContainerHooks) {
                    const preactContainerHook = window.$PreactContainerHooks[preactContainer];
                    if(preactContainerHook && _.isFunction(preactContainerHook.componentWillReceiveProps)) {
                        return preactContainerHook.componentWillReceiveProps(nextProps, nextState);
                    }
                }
            };

            this.shouldComponentUpdate = (nextProps, nextState) => {
                if(lc && _.isFunction(lc.shouldComponentUpdate)) {
                    return lc.shouldComponentUpdate(nextProps, nextState);
                }

                if(preactContainer && window.$PreactContainerHooks) {
                    const preactContainerHook = window.$PreactContainerHooks[preactContainer];
                    if(preactContainerHook && _.isFunction(preactContainerHook.shouldComponentUpdate)) {
                        return preactContainerHook.shouldComponentUpdate(nextProps, nextState);
                    }
                }
            };

            this.componentWillUpdate = () => {
                if(lc && _.isFunction(lc.componentWillUpdate)) {
                    lc.componentWillUpdate();
                }

                if(preactContainer && window.$PreactContainerHooks) {
                    const preactContainerHook = window.$PreactContainerHooks[preactContainer];
                    if(preactContainerHook && _.isFunction(preactContainerHook.componentWillUpdate)) {
                        return preactContainerHook.componentWillUpdate();
                    }
                }
            };

            this.componentDidUpdate = () => {
                if(lc && _.isFunction(lc.componentDidUpdate)) {
                    lc.componentDidUpdate();
                }

                if(preactContainer && window.$PreactContainerHooks) {
                    const preactContainerHook = window.$PreactContainerHooks[preactContainer];
                    if(preactContainerHook && _.isFunction(preactContainerHook.componentDidUpdate)) {
                        return preactContainerHook.componentDidUpdate();
                    }
                }
            };

            this.componentWillUnmount = () => {
                store.unsubscribe(update);

                if(lc && _.isFunction(lc.componentWillUnmount)) {
                    lc.componentWillUnmount();
                }

                if(preactContainer && window.$PreactContainerHooks) {
                    const preactContainerHook = window.$PreactContainerHooks[preactContainer];
                    if(preactContainerHook && _.isFunction(preactContainerHook.componentWillUnmount)) {
                        return preactContainerHook.componentWillUnmount();
                    }
                }
            };

            this.render = props => {
                const childState = assign(assign(assign({}, boundActions), state), props);
                const fn = function(childState) {
                    return h(Child, childState);
                };

                const patchedFn = Patch.applyPatchToFunction(lc.name, 'render', fn);

                const simpleComp = patchedFn.call(this, childState);

                if(preactContainer && window.$PreactContainerHooks) {
                    const preactContainerHook = window.$PreactContainerHooks[preactContainer];
                    if(preactContainerHook && _.isFunction(preactContainerHook.postRender)) {
                        return preactContainerHook.postRender(simpleComp, childState);
                    }
                }

                return simpleComp;
            };
        }
        return (Wrapper.prototype = new Component()).constructor = Wrapper;
    };
}


/** Provider exposes a store (passed as `props.store`) into context.
 *
 *  Generally, an entire application is wrapped in a single `<Provider>` at the root.
 *  @class
 *  @extends Component
 *  @param {Object} props
 *  @param {Store} props.store        A {Store} instance to expose via context.
 */
export function Provider(props) {
    this.getChildContext = () => ({ store: props.store });
}
Provider.prototype.render = props => props.children[0];
