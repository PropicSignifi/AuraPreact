import Preactlet from '../preactlet/preactlet';

const patchScripts = {};

const applyPatchToFunction = (target, targetFnName, oldFn) => {
    const patchScript = _.isString(target) ? patchScripts[target] : target;

    if(patchScript) {
        const self = patchScript;

        return function(...args) {
            const beforeFn = self._getPatchFn(targetFnName, 'before');
            try {
                if(beforeFn) {
                    beforeFn.call(this, ...args);
                }
            }
            catch(e) {
                console.error(e);
            }

            let result = null;
            let failed = false;

            const proceed = (...args) => {
                return oldFn.call(this, ...args);
            };

            const aroundFn = self._getPatchFn(targetFnName, 'around');
            try {
                if(aroundFn) {
                    result = aroundFn.call(this, proceed, ...args);
                }
            }
            catch(e) {
                console.error(e);
                failed = true;
            }

            if(failed || !aroundFn) {
                result = proceed(...args);
            }

            failed = false;
            let finalResult = null;

            const afterFn = self._getPatchFn(targetFnName, 'after');
            try {
                if(afterFn) {
                    finalResult = afterFn.call(this, result, ...args);
                }
            }
            catch(e) {
                console.error(e);
                failed = true;
            }

            if(failed || !afterFn) {
                finalResult = result;
            }

            return finalResult;
        };
    }
    else {
        return oldFn;
    }
};

class PatchScript {
    constructor(target) {
        this.$target = target;
        this.$fn = {
            before: {},
            around: {},
            after: {},
        };
        this.$targetFnNames = [];
    }

    before(targetFnName, fn) {
        if(targetFnName) {
            this.$fn.before[targetFnName] = fn;
            this._addTargetFnName(targetFnName);
        }

        return this;
    }

    around(targetFnName, fn) {
        if(targetFnName) {
            this.$fn.around[targetFnName] = fn;
            this._addTargetFnName(targetFnName);
        }

        return this;
    }

    after(targetFnName, fn) {
        if(targetFnName) {
            this.$fn.after[targetFnName] = fn;
            this._addTargetFnName(targetFnName);
        }

        return this;
    }

    _addTargetFnName(targetFnName) {
        if(!_.includes(this.$targetFnNames, targetFnName)) {
            this.$targetFnNames.push(targetFnName);
        }
    }

    _getPatchFn(targetFnName, behavior) {
        return this.$fn[behavior][targetFnName];
    }

    _patchFunction(Comp, targetFnName) {
        if(targetFnName) {
            const self = this;
            const target = _.isPlainObject(Comp) ? Comp : Comp.prototype;
            const oldFn = target[targetFnName];
            if(!oldFn.$patched) {
                const patchedFunction = applyPatchToFunction(self, targetFnName, oldFn);
                patchedFunction.$patched = true;
                target[targetFnName] = patchedFunction;
            }
        }
    }

    apply() {
        if(patchScripts[this.$target]) {
            return;
        }

        patchScripts[this.$target] = this;

        const Comp = Preactlet.getComponent(this.$target);
        if(Comp) {
            _.forEach(this.$targetFnNames, targetFnName => {
                this._patchFunction(Comp, targetFnName);
            });
        }
    }
}

const of = target => new PatchScript(target);

const Patch = {
    of,
    applyPatchToFunction,
};

export default Patch;
