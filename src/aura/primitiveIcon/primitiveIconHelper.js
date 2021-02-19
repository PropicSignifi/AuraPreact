({
    injectSVG: function(cmp) {
        if (cmp.isRendered()) {
            var el = cmp.getElement();
            var svgEl = this.compileSVG(cmp);
            cmp.set('v.privateSvg', svgEl);
        }
    },

    updateSVG: function(cmp) {
        this.injectSVG(cmp);
    },

    removeSVG: function(cmp) {
    },

    compileSVG: function(cmp) {
        var iconName = cmp.get('v.iconName');
        var items = iconName.split(':');
        var category = items[0];
        var name = items[1];
        var svg = window.$Icons.getSvg(category, name);
        var ret = '<svg viewBox="0 0 24 24" class="' + cmp.get('v.privateSvgComputedClass') + '">' +
            svg +
            '</svg>';

        return ret;
    },

    updateSVGClass: function(cmp) {
        if (cmp.isRendered()) {
            var el = cmp.getElement();
            var svgElement = this.getSvgElement(el);
            if (svgElement) {
                svgElement.setAttribute('class', cmp.get('v.privateSvgComputedClass'));
            }
        }
    },

    getSvgElement: function(el) {
        return el.querySelector('svg');
    },

    computeClassNames: function(cmp) {
        this.computeSVGClassNames(cmp);
    },

    computeSVGClassNames: function(cmp) {
        if(!this.classnamesLibrary) {
            return;
        }
        var size = cmp.get('v.size');
        var className = cmp.get('v.svgClass');
        var variant = cmp.get('v.variant');

        var classNamesLogic = {
            'slds-icon': !this.equal(variant, 'bare'),
            'slds-icon-text-default': !(this.equal(variant, 'error') || this.equal(variant, 'warning') || this.equal(variant, 'inverse') || this.equal(variant, 'bare')),
            'slds-icon-text-error': this.equal(variant, 'error'),
            'slds-icon-text-warning': this.equal(variant, 'warning'),
            'slds-icon--x-small': this.equal(size, 'x-small'),
            'slds-icon--xx-small': this.equal(size, 'xx-small'),
            'slds-icon--small': this.equal(size, 'small'),
            'slds-icon--large': this.equal(size, 'large')
        };

        var svgComputedClass = this.classnamesLibrary.classnames(classNamesLogic, className);
        cmp.set('v.privateSvgComputedClass', svgComputedClass);
    },

    computeContainerClassNames: function(cmp) {
        if(!this.classnamesLibrary) {
            return;
        }
        var display = cmp.get('v.display');
        var classes = cmp.get("v.class");

        var classNamesLogic = {
            'slds-is-inline-flex': this.equal(display, 'inline-flex'),
        };

        var containerComputedClass = this.classnamesLibrary.classnames(classNamesLogic, classes);
        cmp.set('v.privateContainerComputedClass', containerComputedClass);
    },
})
