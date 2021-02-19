(function(window) {
    window.DEFAULT_TABLE_CELL_EDITORS = {
        "String": {
            "readonly": function(config) {
                return `<div class="slds-truncate" title="{! v.object.${config.name} }">{! v.object.${config.name} }</div>`;
            },
            "editable": function(config) {
                return `<c:input type="text" name="${config.name}" variant="label-hidden" label="${config.name}" value="{! v.object.${config.name} }"/>`;
            },
        },

        "Number": {
            "readonly": function(config) {
                return `<div class="slds-truncate" title="{! v.object.${config.name} }">{! v.object.${config.name} }</div>`;
            },
            "editable": function(config) {
                return `<c:input type="number" name="${config.name}" variant="label-hidden" label="${config.name}" value="{! v.object.${config.name} }"/>`;
            },
        },

        "Boolean": {
            "readonly": function(config) {
                return `<c:input type="checkbox" name="${config.name}" variant="label-hidden" label="${config.name}" checked="{! v.object.${config.name} }" disabled="true"/>`;
            },
            "editable": function(config) {
                return `<c:input type="checkbox" name="${config.name}" variant="label-hidden" label="${config.name}" checked="{! v.object.${config.name} }"/>`;
            },
        },

        "Currency": {
            "readonly": function(config) {
                return `<c:formattedNumber type="currency" value="{! v.object.${config.name} }"/>`;
            },
        },

        "Date": {
            "readonly": function(config) {
                return `<c:formattedDateTime type="date" value="{! v.object.${config.name} }"/>`;
            },
        },

        "Time": {
            "readonly": function(config) {
                return `<c:formattedDateTime type="time" value="{! v.object.${config.name} }"/>`;
            },
        },

        "DateTime": {
            "readonly": function(config) {
                return `<c:formattedDateTime type="datetime" value="{! v.object.${config.name} }"/>`;
            },
        },
    };
})(window);
