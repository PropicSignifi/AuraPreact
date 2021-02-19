(function(w) {
    // spreadParams :: Params -> String
    const spreadParams = params => {
        return _.chain(params).
            map((value, key) => `${key}="${value}"`).
            join(" ").
            value();
    };

    // fromXml :: (String, Component) -> [Comp]/Comp
    const fromXml = window.$Utils.fromXml;

    w.DEMO_COMPONENTS = [
        {
            name: "Accordion (Lightning)",
            componentName: "lightning:accordion",
            description: "Create a lightning accordion.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                activeSectionName: 'A',
            },
            configurable: {
                class: "String",
            },
            createComp: function(name, params) {
                return `
                <lightning:accordion ${spreadParams(params)}>
                    <lightning:accordionSection name="A">This is section A.</lightning:accordionSection>
                    <lightning:accordionSection name="B">This is section B.</lightning:accordionSection>
                    <lightning:accordionSection name="C">This is section C.</lightning:accordionSection>
                </lightning:accordion>
                `;
            },
        },
        {
            name: "Accordion (CTC)",
            componentName: "c:accordion",
            description: "Create a ctc accordion.",
            created: "16/01/2018",
            defaultParams: {
                class: 'class',
                title: 'title',
                activeSectionName: 'A',
            },
            configurable: {
                class: "String",
            },
            createComp: function(name, params) {
                return `
                <c:accordion ${spreadParams(params)}>
                    <c:accordionSection name="A">This is section A.</c:accordionSection>
                    <c:accordionSection name="B">This is section B.</c:accordionSection>
                    <c:accordionSection name="C">This is section C.</c:accordionSection>
                </c:accordion>
                `;
            },
        },
        {
            name: "Accordion Section (Lightning)",
            componentName: "lightning:accordionSection",
            description: "Create a lightning accordion section.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                label: 'label',
                name: 'name',
            },
            configurable: {
                class: 'String',
                label: 'String',
            },
            createComp: function(name, params) {
                return `
                <lightning:accordion activeSectionName="A">
                    <lightning:accordionSection ${spreadParams(params)}>
                        This is section A.
                        <aura:set attribute="actions">
                            <lightning:buttonMenu>
                                <lightning:menuItem
                                    value="New"
                                    label="Menu Item"
                                    user:ref="true"
                                />
                            </lightning:buttonMenu>
                        </aura:set>
                    </lightning:accordionSection>
                    <lightning:accordionSection name="B">This is section B.</lightning:accordionSection>
                    <lightning:accordionSection name="C">This is section C.</lightning:accordionSection>
                </lightning:accordion>
                `;
            },
        },
        {
            name: "Activity Timeline (CTC)",
            componentName: "c:timeline",
            description: "Create a ctc activity timeline.",
            created: "16/12/2017",
            defaultParams: {
                title: 'Title',
                class: 'class',
            },
            configurable: {
                title: 'String',
                class: 'String',
            },
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    <c:timelineItem variant="task" iconName="standard:task" time="1513419653383">
                        <aura:set attribute="title">
                            <a href="javascript:void(0)">Task</a>
                        </aura:set>
                        This is a task activity.
                    </c:timelineItem>
                    <c:timelineItem variant="event" iconName="standard:event" time="1513419653383">
                        <aura:set attribute="title">
                            <a href="javascript:void(0)">Event</a>
                        </aura:set>
                        This is an event activity.
                    </c:timelineItem>
                    <c:timelineItem variant="call" iconName="standard:log_a_call" time="1513419653383">
                        <aura:set attribute="title">
                            <a href="javascript:void(0)">Call</a>
                        </aura:set>
                        This is a call activity.
                    </c:timelineItem>
                    <c:timelineItem variant="email" iconName="standard:email" time="1513419653383">
                        <aura:set attribute="title">
                            <a href="javascript:void(0)">Email</a>
                        </aura:set>
                        This is an email activity.
                    </c:timelineItem>
                </${name}>
                `;
            },
        },
        {
            name: "Alert Modal (CTC)",
            componentName: "c:alertModal",
            description: "Create a ctc alert modal.",
            created: "01/12/2017",
            defaultParams: {
                header: 'Alert',
                message: 'message',
                onSaveText: 'Yes',
                onCancelText: 'Cancel',
            },
            configurable: {
                header: "String",
                message: "String",
                onSaveText: 'String',
                onCancelText: 'String',
            },
            createComp: function(name, params) {
                return `
                <c:button variant="primary" label="Show Alert" onclick="{! c.trigger }"/>
                `;
            },
            onTrigger: function(name, params) {
                window.$Utils.getCurrentApp().alert(params);
            },
        },
        {
            name: "Alert (CTC)",
            componentName: "c:alert",
            description: "Create a ctc alert.",
            created: "01/12/2017",
            defaultParams: {
                variant: 'info',
                closeable: true,
            },
            configurable: {
                variant: [
                    "info",
                    "warning",
                    "error",
                ],
                closeable: 'Boolean',
            },
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    This is an alert.
                </${name}>
                `;
            },
        },
        {
            name: "App Loading (CTC)",
            componentName: "c:appLoading",
            description: "Demonstrate how to use app loading spinner.",
            created: "20/01/2018",
            defaultParams: {
            },
            configurable: {
            },
            createComp: function(name, params) {
                return `
                <c:button variant="primary" label="Show Spinner" onclick="{! c.trigger }"/>
                `;
            },
            onTrigger: function(name, params) {
                window.$Utils.startLoading(window.$Utils.getCurrentApp());
                window.setTimeout($A.getCallback(function() {
                    window.$Utils.stopLoading(window.$Utils.getCurrentApp());
                }), 3000);
            },
        },
        {
            name: "Avatar (Lightning)",
            componentName: "lightning:avatar",
            description: "Create a lightning avatar.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                variant: 'square',
                size: 'medium',
                src: '/static/images/some.png',
                alternativeText: 'logo',
                fallbackIconName: 'standard:account',
                initials: 'Sa',
            },
            configurable: {
                class: 'String',
                variant: [
                    "empty",
                    "circle",
                    "square",
                ],
                size: [
                    "x-small",
                    "small",
                    "medium",
                    "large",
                ],
                src: "String",
                initials: "String",
            },
            mandatory: [
                "src",
                "alternativeText",
            ],
        },
        {
            name: "Badge (Lightning)",
            componentName: "lightning:badge",
            description: "Create a lightning badge.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                label: 'label',
            },
            configurable: {
                class: 'String',
                label: 'String',
            },
            mandatory: [
                "label",
            ],
        },
        {
            name: "Breadcrumb (Lightning)",
            componentName: "lightning:breadcrumb",
            description: "Create a lightning breadcrumb.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                label: 'label',
                href: 'href',
                name: 'name',
            },
            configurable: {
                class: 'String',
                label: 'String',
                href: 'String',
            },
            mandatory: [
                "label",
            ],
            createComp: function(name, params) {
                return `
                <lightning:breadcrumbs>
                    <lightning:breadcrumb ${spreadParams(params)}/>
                    <lightning:breadcrumb label="B"/>
                    <lightning:breadcrumb label="C"/>
                </lightning:breadcrumbs>
                `;
            },
        },
        {
            name: "Breadcrumbs (Lightning)",
            componentName: "lightning:breadcrumbs",
            description: "Create a lightning breadcrumbs.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
            },
            configurable: {
                class: 'String',
            },
            createComp: function(name, params) {
                return `
                <lightning:breadcrumbs ${spreadParams(params)}>
                    <lightning:breadcrumb label="A"/>
                    <lightning:breadcrumb label="B"/>
                    <lightning:breadcrumb label="C"/>
                </lightning:breadcrumbs>
                `;
            },
        },
        {
            name: "Bubble Primitive (CTC)",
            componentName: "c:primitiveBubble",
            description: "Create a ctc primitive bubble.",
            created: "20/01/2018",
            defaultParams: {
                contentId: 'contentId',
                content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                visible: true,
            },
            configurable: {
                content: "String",
                visible: "Boolean",
            },
            createComp: function(name, params) {
                const newParams = {
                    align: {
                        horizontal: 'left',
                        vertical: 'bottom',
                    },
                };
                return fromXml(`<${name} ${spreadParams(params)}/>`).
                    assign(newParams);
            },
        },
        {
            name: "Button (Lightning)",
            componentName: "lightning:button",
            description: "Create a lightning button.",
            created: "01/12/2017",
            defaultParams: {
                label: 'Button',
                class: 'class',
                title: 'title',
                name: 'name',
                value: 'value',
                variant: 'brand',
                iconName: '',
                iconPosition: 'left',
                disabled: false,
                type: 'button',
            },
            configurable: {
                label: "String",
                class: "String",
                variant: [
                    "base",
                    "neutral",
                    "brand",
                    "destructive",
                    "inverse",
                    "success",
                ],
                iconName: "String",
                iconPosition: ["left", "right"],
                disabled: "Boolean",
            },
            events: [
                "onclick",
            ],
        },
        {
            name: "Button (CTC)",
            componentName: "c:button",
            description: `
                <p>Create a ctc button.<p>
                <p>Please use custom variants of <strong>primary</strong>, <strong>secondary</strong>, <strong>tertiary</strong> and <strong>save</strong>.</p>
            `,
            created: "01/12/2017",
            defaultParams: {
                label: 'Button',
                class: 'class',
                title: 'title',
                name: 'name',
                value: 'value',
                variant: 'primary',
                iconName: '',
                iconPosition: 'left',
                disabled: false,
                type: 'button',
                tooltip: '',
            },
            configurable: {
                label: "String",
                class: "String",
                variant: [
                    "base",
                    "neutral",
                    "brand",
                    "destructive",
                    "inverse",
                    "success",
                    "primary",
                    "secondary",
                    "tertiary",
                    "save",
                ],
                iconName: "Icon",
                iconPosition: ["left", "right"],
                disabled: "Boolean",
                tooltip: 'String',
            },
            events: [
                "onclick",
            ],
        },
        {
            name: "Button Group (Lightning)",
            componentName: "lightning:buttonGroup",
            description: "Create a lightning button group.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
            },
            configurable: {
                class: 'String',
            },
            createComp: function(name, params) {
                return `
                <lightning:buttonGroup ${spreadParams(params)}>
                    <lightning:button label="Button 1"/>
                    <lightning:button label="Button 2"/>
                    <lightning:button label="Button 3"/>
                </lightning:buttonGroup>
                `;
            },
        },
        {
            name: "Button Icon (Lightning)",
            componentName: "lightning:buttonIcon",
            description: "Create a lightning button icon.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                name: 'name',
                value: 'value',
                variant: 'border',
                iconName: 'utility:info',
                iconClass: 'iconClass',
                size: 'medium',
                disabled: false,
                alternativeText: "icon",
                type: 'button',
            },
            configurable: {
                class: 'String',
                iconName: 'String',
                iconClass: 'String',
                variant: [
                    "bare",
                    "container",
                    "border",
                    "border-filled",
                    "bare-inverse",
                    "border-inverse",
                ],
                size: [
                    "xx-small",
                    "x-small",
                    "small",
                    "medium",
                    "large",
                ],
                disabled: 'Boolean',
            },
            mandatory: [
                "iconName",
                "alternativeText",
            ],
        },
        {
            name: "Button Icon (CTC)",
            componentName: "c:buttonIcon",
            description: "Create a ctc button icon.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                name: 'name',
                value: 'value',
                variant: 'border',
                iconName: 'ctc-utility:info_info',
                iconClass: 'iconClass',
                iconDisplay: '',
                size: 'medium',
                disabled: false,
                alternativeText: "icon",
                type: 'button',
            },
            configurable: {
                class: 'String',
                iconName: 'Icon',
                iconClass: 'String',
                iconDisplay: [
                    'base',
                    'inline-flex',
                ],
                variant: [
                    "bare",
                    "container",
                    "border",
                    "border-filled",
                    "bare-inverse",
                    "border-inverse",
                ],
                size: [
                    "xx-small",
                    "x-small",
                    "small",
                    "medium",
                    "large",
                ],
                disabled: 'Boolean',
            },
            mandatory: [
                "iconName",
                "alternativeText",
            ],
        },
        {
            name: "Button Icon Stateful (Lightning)",
            componentName: "lightning:buttonIconStateful",
            description: "Create a lightning stateful button icon.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                name: 'name',
                value: 'value',
                iconName: 'utility:info',
                variant: 'border',
                size: 'medium',
                disabled: false,
                alternativeText: "icon",
                selected: false,
            },
            configurable: {
                class: 'String',
                iconName: 'String',
                variant: [
                    "border",
                    "border-inverse",
                ],
                size: [
                    "xx-small",
                    "x-small",
                    "small",
                    "medium",
                ],
                disabled: 'Boolean',
                selected: 'Boolean',
            },
            mandatory: [
                "iconName",
                "alternativeText",
            ],
        },
        {
            name: "Button Menu (Lightning)",
            componentName: "lightning:buttonMenu",
            description: "Create a lightning button menu.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                variant: 'border',
                menuAlignment: 'left',
                iconName: 'utility:down',
                iconSize: 'medium',
                disabled: false,
                visible: true,
                alternativeText: "icon",
                name: 'name',
                value: 'value',
            },
            configurable: {
                class: 'String',
                variant: [
                    "bare",
                    "container",
                    "border",
                    "border-filled",
                    "bare-inverse",
                    "border-inverse",
                ],
                menuAlignment: [
                    "left",
                    "center",
                    "right",
                    "bottom-left",
                    "bottom-center",
                    "bottom-right",
                ],
                iconName: 'String',
                iconSize: [
                    "xx-small",
                    "x-small",
                    "medium",
                    "large",
                ],
                disabled: 'Boolean',
                visible: 'Boolean',
            },
            createComp: function(name, params) {
                return `
                <lightning:buttonMenu ${spreadParams(params)}>
                    <lightning:menuItem label="Item 1" value="1" user:ref="true"/>
                    <lightning:menuItem label="Item 2" value="2" user:ref="true"/>
                    <lightning:menuItem label="Item 3" value="3" user:ref="true"/>
                </lightning:buttonMenu>
                `;
            },
        },
        {
            name: "Button Menu (CTC)",
            componentName: "c:buttonMenu",
            description: "Create a ctc button menu.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                variant: 'border',
                menuAlignment: 'left',
                iconName: 'ctc-utility:a_down',
                iconSize: 'medium',
                disabled: false,
                visible: true,
                alternativeText: "icon",
                name: 'name',
                value: 'value',
            },
            configurable: {
                class: 'String',
                variant: [
                    "bare",
                    "container",
                    "border",
                    "border-filled",
                    "bare-inverse",
                    "border-inverse",
                ],
                menuAlignment: [
                    "left",
                    "center",
                    "right",
                    "bottom-left",
                    "bottom-center",
                    "bottom-right",
                ],
                iconName: 'Icon',
                iconSize: [
                    "xx-small",
                    "x-small",
                    "medium",
                    "large",
                ],
                disabled: 'Boolean',
                visible: 'Boolean',
            },
            createComp: function(name, params) {
                return `
                <c:buttonMenu ${spreadParams(params)}>
                    <c:menuItem label="Item 1" value="1"/>
                    <c:menuItem label="Item 2" value="2" disabled="true"/>
                    <c:menuItem label="Item 3" value="3" tooltip="Tooltip"/>
                </c:buttonMenu>
                `;
            },
            events: [
                "onselect",
            ],
        },
        {
            name: "Button Stateful (Lightning)",
            componentName: "lightning:buttonStateful",
            description: "Create a lightning stateful button.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                state: false,
                labelWhenOff: 'Off',
                labelWhenOn: 'On',
                labelWhenHover: 'Hover',
                iconNameWhenOff: 'utility:add',
                iconNameWhenOn: 'utility:check',
                iconNameWhenHover: 'utility:close',
                variant: 'neutral',
            },
            configurable: {
                class: 'String',
                state: 'Boolean',
                labelWhenOff: 'String',
                labelWhenOn: 'String',
                labelWhenHover: 'String',
                iconNameWhenOff: 'String',
                iconNameWhenOn: 'String',
                iconNameWhenHover: 'String',
                variant: [
                    "brand",
                    "destructive",
                    "inverse",
                    "neutral",
                    "success",
                    "text",
                ],
            },
            mandatory: [
                "labelWhenOff",
                "labelWhenOn",
            ],
        },
        {
            name: "Button Stateful (CTC)",
            componentName: "c:buttonStateful",
            description: "Create a ctc stateful button.",
            created: "17/01/2018",
            defaultParams: {
                class: 'class',
                title: 'title',
                state: false,
                labelWhenOff: 'Off',
                labelWhenOn: 'On',
                labelWhenHover: '',
                iconNameWhenOff: 'ctc-utility:people_profile',
                iconNameWhenOn: 'ctc-utility:people_tick',
                iconNameWhenHover: '',
                variant: 'primary',
                iconPosition: 'left',
                tooltip: '',
            },
            configurable: {
                class: 'String',
                state: 'Boolean',
                labelWhenOff: 'String',
                labelWhenOn: 'String',
                labelWhenHover: 'String',
                iconNameWhenOff: 'Icon',
                iconNameWhenOn: 'Icon',
                iconNameWhenHover: 'Icon',
                variant: [
                    "brand",
                    "destructive",
                    "inverse",
                    "neutral",
                    "success",
                    "text",
                    "primary",
                    "secondary",
                    "tertiary",
                    "save",
                ],
                iconPosition: [
                    "left",
                    "right",
                ],
                tooltip: 'String',
            },
            mandatory: [
                "labelWhenOff",
                "labelWhenOn",
            ],
        },
        {
            name: "Card (Lightning)",
            componentName: "lightning:card",
            description: "Create a lightning card.",
            created: "01/12/2017",
            defaultParams: {
                title: 'title',
                iconName: 'utility:down',
                variant: 'base',
                class: 'class',
                footer: 'footer',
            },
            configurable: {
                title: 'String',
                iconName: 'String',
                variant: [
                    "base",
                    "narrow",
                ],
                class: 'String',
                footer: 'String',
            },
            mandatory: [
                "title",
            ],
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    <lightning:button label="Action"/>
                </${name}>
                `;
            },
        },
        {
            name: "Checkbox Group (Lightning)",
            componentName: "lightning:checkboxGroup",
            description: "Create a lightning checkbox group.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                name: 'name',
                label: 'label',
                value: '[]',
                messageWhenValueMissing: '',
                required: false,
                disabled: false,
            },
            configurable: {
                class: 'String',
                label: 'String',
                required: 'Boolean',
                disabled: 'Boolean',
            },
            mandatory: [
                "name",
                "label",
                "options",
                "value",
            ],
            createComp: function(name, params) {
                const newParams = {
                    options: [
                        {
                            label: 'Option 1',
                            value: 1,
                        },
                        {
                            label: 'Option 2',
                            value: 2,
                        },
                    ],
                };
                return fromXml(`<${name} ${spreadParams(params)}/>`).
                    assign(newParams);
            },
        },
        {
            name: "Checkbox Group (CTC)",
            componentName: "c:checkboxGroup",
            description: "Create a ctc checkbox group.",
            created: "12/01/2018",
            defaultParams: {
                class: 'class',
                title: 'title',
                name: 'name',
                label: 'label',
                value: '',
                required: false,
                disabled: false,
                variant: 'standard',
                type: 'checkbox',
                style: 'vertical',
            },
            configurable: {
                class: 'String',
                label: 'String',
                required: 'Boolean',
                disabled: 'Boolean',
                variant: [
                    "standard",
                    "label-hidden",
                ],
                type: [
                    "checkbox",
                    "checkbox-big",
                    "checkbox-medium",
                    "checkbox-small",
                ],
                style: [
                    "vertical",
                    "horizontal",
                    "button",
                ],
            },
            mandatory: [
                "name",
                "label",
                "options",
            ],
            createComp: function(name, params) {
                const newParams = {
                    options: [
                        {
                            label: 'Option 1',
                            value: 'option1',
                        },
                        {
                            label: 'Option 2',
                            value: 'option2',
                        },
                    ],
                };
                return fromXml(`<${name} ${spreadParams(params)}/>`).
                    assign(newParams);
            },
        },
        {
            name: "Click to Dial (Lightning)",
            componentName: "lightning:clickToDial",
            description: "Create a lightning click-to-dial component.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                value: '0412345678',
                recordId: 'recordId',
                params: 'accountSid=xxx, sourceId=xxx, apiVersion=123',
            },
            configurable: {
                class: 'String',
                value: 'String',
                recordId: 'String',
                params: 'String',
            },
            mandatory: [
                "value",
            ],
        },
        {
            name: "Combobox (Lightning)",
            componentName: "lightning:combobox",
            description: "Create a lightning combobox.",
            created: "01/12/2017",
            defaultParams: {
                name: 'name',
                value: '',
                variant: 'standard',
                disabled: false,
                required: false,
                class: 'class',
                title: 'title',
                label: 'label',
                placeholder: 'Select an Option',
                dropdownAlignment: 'left',
                messageWhenValueMissing: '',
                readonly: false,
            },
            configurable: {
                variant: [
                    "standard",
                    "label-hidden",
                ],
                disabled: 'Boolean',
                required: 'Boolean',
                readonly: 'Boolean',
                class: 'String',
                label: 'String',
                placeholder: 'String',
                dropdownAlignment: [
                    "left",
                    "center",
                    "right",
                    "bottom-left",
                    "bottom-center",
                    "bottom-right",
                ],
            },
            mandatory: [
                "name",
                "label",
                "options",
            ],
            createComp: function(name, params) {
                const newParams = {
                    options: [
                        {
                            label: 'Option 1',
                            value: 1,
                        },
                        {
                            label: 'Option 2',
                            value: 2,
                        },
                    ],
                };
                return fromXml(`<${name} ${spreadParams(params)}/>`).
                    assign(newParams);
            },
        },
        {
            name: "Container (CTC)",
            componentName: "c:container",
            description: "Create a ctc container.",
            created: "21/12/2017",
            defaultParams: {
            },
            configurable: {
            },
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    <c:parameter name="name" value="Wilson"/>
                    <c:parameter name="age" value="30"/>
                    <c:expression name="_text" value="{name} is {age} years old"/>
                    <c:expression name="_html" value="&lt;strong>{name} is {age} years old&lt;/strong>"/>
                    <c:expression name="label" value="_text" inject="true"/>
                    <c:button name="button" label="button" variant="primary"/>
                </${name}>
                `;
            },
        },
        {
            name: "Creator (CTC)",
            componentName: "c:creator",
            description: "Create a ctc creator.",
            created: "25/12/2017",
            defaultParams: {
                componentName: "c:button",
            },
            configurable: {
                componentName: "String",
            },
            mandatory: [
                "componentName",
            ],
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    <c:parameter name="label" value="Button"/>
                </${name}>
                `;
            },
        },
        {
            name: "Date Picker (CTC)",
            componentName: "c:datePicker",
            description: "Create a ctc date picker.",
            created: "19/01/2018",
            defaultParams: {
                name: 'name',
                variant: 'standard',
                class: 'class',
                title: 'title',
                disabled: false,
                readonly: false,
                required: false,
                label: 'Date Picker',
                placeholder: '',
                tooltip: '',
                popupClass: '',
            },
            configurable: {
                variant: [
                    "standard",
                    "label-hidden",
                ],
                class: 'String',
                disabled: 'Boolean',
                readonly: 'Boolean',
                required: 'Boolean',
                label: 'String',
                placeholder: 'String',
                tooltip: 'String',
                popupClass: 'String',
            },
            mandatory: [
                "name",
                "label",
            ],
        },
        {
            name: "Date Time Picker (CTC)",
            componentName: "c:datetimePicker",
            description: "Create a ctc date time picker.",
            created: "09/12/2017",
            defaultParams: {
                name: 'name',
                variant: 'standard',
                class: 'class',
                title: 'title',
                disabled: false,
                readonly: false,
                required: false,
                label: 'Date Time Picker',
                placeholder: '',
                tooltip: '',
            },
            configurable: {
                variant: [
                    "standard",
                    "label-hidden",
                ],
                class: 'String',
                disabled: 'Boolean',
                readonly: 'Boolean',
                required: 'Boolean',
                label: 'String',
                placeholder: 'String',
                tooltip: 'String',
            },
            mandatory: [
                "name",
                "label",
            ],
        },
        {
            name: "Data Table (Lightning)",
            componentName: "lightning:datatable",
            description: "Create a lightning data table.",
            created: "05/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                hideCheckboxColumn: false,
                resizeColumnDisabled: false,
                minColumnWidth: 50,
                maxColumnWidth: 1000,
                resizeStep: 10,
                sortedBy: '',
                sortedDirection: 'asc',
                defaultSortDirection: 'asc',
                keyField: 'id',
            },
            configurable: {
                class: 'String',
                hideCheckboxColumn: 'Boolean',
                resizeColumnDisabled: 'Boolean',
                minColumnWidth: 'Number',
                maxColumnWidth: 'Number',
                resizeStep: 'Number',
            },
            mandatory: [
                "keyField",
            ],
            createComp: function(name, params) {
                const newParams = {
                    columns: [
                        {
                            label: "Column 1",
                            fieldName: "col1",
                            type: "text",
                        },
                        {
                            label: "Column 2",
                            fieldName: "col2",
                            type: "text",
                        },
                        {
                            label: "Column 3",
                            fieldName: "col3",
                            type: "text",
                        },
                    ],
                    data: [
                        {
                            id: 1,
                            col1: "cell 1",
                            col2: "cell 1",
                            col3: "cell 1",
                        },
                        {
                            id: 2,
                            col1: "cell 2",
                            col2: "cell 2",
                            col3: "cell 2",
                        },
                        {
                            id: 3,
                            col1: "cell 3",
                            col2: "cell 3",
                            col3: "cell 3",
                        },
                    ],
                };
                return fromXml(`<${name} ${spreadParams(params)}/>`).
                    assign(newParams);
            },
        },
        {
            name: "Dual List Box (Lightning)",
            componentName: "lightning:dualListbox",
            description: "Create a lightning dual list box.",
            created: "01/12/2017",
            defaultParams: {
                name: 'name',
                value: '[]',
                variant: 'standard',
                disabled: false,
                readonly: false,
                required: false,
                label: 'Dual Listbox',
                sourceLabel: 'Source',
                selectedLabel: 'Selected',
                min: 0,
                max: 0,
            },
            configurable: {
                variant: [
                    "standard",
                    "label-hidden",
                ],
                disabled: 'Boolean',
                readonly: 'Boolean',
                required: 'Boolean',
                label: 'String',
                sourceLabel: 'String',
                selectedLabel: 'String',
                min: 'Number',
                max: 'Number',
            },
            mandatory: [
                "name",
                "label",
                "sourceLabel",
                "selectedLabel",
                "options",
            ],
            createComp: function(name, params) {
                const newParams = {
                    options: [
                        {
                            label: "One",
                            value: 1,
                        },
                        {
                            label: "Two",
                            value: 2,
                        },
                        {
                            label: "Three",
                            value: 3,
                        },
                        {
                            label: "Four",
                            value: 4,
                        },
                        {
                            label: "Five",
                            value: 5,
                        },
                    ],
                    requiredOptions: [1],
                    values: [5],
                };
                return fromXml(`<${name} ${spreadParams(params)}/>`).
                    assign(newParams);
            },
        },
        {
            name: "Dual List Box (CTC)",
            componentName: "c:dualListbox",
            description: "Create a ctc dual list box.",
            created: "16/01/2018",
            defaultParams: {
                name: 'name',
                variant: 'standard',
                disabled: false,
                readonly: false,
                required: false,
                label: 'Dual Listbox',
                sourceLabel: 'Source',
                selectedLabel: 'Selected',
                tooltip: '',
            },
            configurable: {
                variant: [
                    "standard",
                    "label-hidden",
                ],
                disabled: 'Boolean',
                readonly: 'Boolean',
                required: 'Boolean',
                label: 'String',
                sourceLabel: 'String',
                selectedLabel: 'String',
                tooltip: 'String',
            },
            mandatory: [
                "name",
                "label",
                "sourceLabel",
                "selectedLabel",
                "options",
            ],
            createComp: function(name, params) {
                const newParams = {
                    options: [
                        {
                            label: "One",
                            value: 1,
                        },
                        {
                            label: "Two",
                            value: 2,
                        },
                        {
                            label: "Three",
                            value: 3,
                        },
                        {
                            label: "Four",
                            value: 4,
                        },
                        {
                            label: "Five",
                            value: 5,
                        },
                    ],
                };
                return fromXml(`<${name} ${spreadParams(params)}/>`).
                    assign(newParams);
            },
        },
        {
            name: "Dynamic Icon (Lightning)",
            componentName: "lightning:dynamicIcon",
            description: "Create a lightning dynamic icon.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                type: 'score',
                option: 'positive',
                alternativeText: '',
            },
            configurable: {
                class: 'String',
                type: [
                    "ellie",
                    "eq",
                    "score",
                    "strength",
                    "trend",
                    "waffle",
                ],
                option: [
                    "play",
                    "stop",
                    "positive",
                    "negative",
                    "-3",
                    "-2",
                    "-1",
                    "0",
                    "1",
                    "2",
                    "3",
                    "neutral",
                    "up",
                    "down",
                ],
            },
            mandatory: [
                "type",
            ],
        },
        {
            name: "Dynamic Menu (CTC)",
            componentName: "c:dynamicMenu",
            description: "Create a ctc dynamic menu.",
            created: "17/12/2017",
            defaultParams: {
                iconName: "ctc-utility:info_info",
                variant: "bare",
            },
            configurable: {
                iconName: "Icon",
                variant: [
                    "bare",
                    "border",
                ],
            },
            mandatory: [
                "iconName",
            ],
            createComp: function(name, params) {
                return `
                    <${name} ${spreadParams(params)}>
                        Some content
                    </${name}>
                    `;
            },
        },
        {
            name: "Event Decorator (CTC)",
            componentName: "c:eventDecorator",
            description: "Create a ctc event decorator to help set parameters to client controllers.",
            created: "16/12/2017",
            defaultParams: {
                param1: "Wilson",
                eventName: "onclick",
            },
            configurable: {
                param1: "String",
                eventName: [
                    "onclick",
                    "onselect",
                    "onselectAll",
                    "onchange",
                    "onfocus",
                    "onblur",
                    "onlookup",
                    "onactive",
                    "oninactive",
                    "onsort",
                ],
            },
            mandatory: [
                "eventName",
            ],
            createComp: function(name, params) {
                return `
                    <${name} ${spreadParams(params)} onEvent="{! c.trigger }">
                        <c:button variant="primary" label="Click"></c:button>
                    </${name}>
                    `;
            },
            onTrigger: function(name, params, createdComp, event) {
                window.alert(event.getParam("data").param1);
            },
        },
        {
            name: "Expandable Section (CTC)",
            componentName: "c:expandableSection",
            description: "Create a ctc expandable section.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                expanded: true,
                tooltip: "",
            },
            configurable: {
                class: 'String',
                title: 'String',
                expanded: 'Boolean',
                tooltip: "String",
            },
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    Some content
                </${name}>
                `;
            },
        },
        {
            name: "File Droppable Zone Primitive (CTC)",
            componentName: "c:primitiveFileDroppableZone",
            description: "Create a ctc primitive file droppable zone.",
            created: "01/12/2017",
            defaultParams: {
                multiple: false,
                disabled: false,
            },
            configurable: {
                multiple: "Boolean",
                disabled: "Boolean",
            },
        },
        {
            name: "File Upload (Lightning)",
            componentName: "lightning:fileUpload",
            description: "Create a lightning file upload.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                label: 'File Upload',
                recordId: 'recordId',
                multiple: true,
                disabled: false,
                accept: '.pdf .png',
            },
            configurable: {
                class: 'String',
                label: 'String',
                recordId: 'String',
                multiple: 'Boolean',
                disabled: 'Boolean',
                accept: 'String',
            },
            mandatory: [
                "label",
                "recordId",
            ],
        },
        {
            name: "Flat Panel (CTC)",
            componentName: "c:flatPanel",
            description: "Create a ctc flat panel.",
            created: "22/12/2017",
            defaultParams: {
                class: 'class',
                header: 'Panel Header',
                iconName: "ctc-utility:info_info",
                expandable: false,
                expanded: true,
                tooltip: "",
            },
            configurable: {
                class: 'String',
                header: 'String',
                iconName: "Icon",
                expandable: 'Boolean',
                expanded: 'Boolean',
                tooltip: "String",
            },
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    Some content inside the panel.
                </${name}>
                `;
            },
        },
        {
            name: "Form (CTC)",
            componentName: "c:form",
            description: "Create a ctc form.",
            created: "06/01/2018",
            defaultParams: {
                class: 'class',
                variant: "base",
                name: 'demoForm',
                layout: "stacked",
                readonly: false,
                disabled: false,
                saveable: false,
            },
            configurable: {
                class: 'String',
                variant: [
                    "base",
                    "compound",
                ],
                layout: [
                    "stacked",
                    "horizontal",
                ],
                readonly: 'Boolean',
                disabled: 'Boolean',
                saveable: 'Boolean',
            },
            mandatory: [
                "name",
            ],
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    <c:input type="text" label="Name" name="name" required="true"/>
                    <c:input type="number" label="Age" name="age"/>
                    <c:input type="number" label="Size" name="size" min="3"/>
                    <c:input type="toggle" label="Married" name="married"/>
                    <c:input type="text" label="Hobby" name="hobby"/>
                    <div class="slds-grid slds-m-top_medium">
                        <c:button variant="tertiary" name="cancel" label="Cancel" class="slds-col_bump-left" onclick="{! c.trigger }"/>
                        <c:button variant="tertiary" name="dirty" label="Dirty?" class="" onclick="{! c.trigger }"/>
                        <c:button variant="primary" name="submit" label="Submit" onclick="{! c.trigger }"/>
                    </div>
                </${name}>
                `;
            },
            afterRender: function(newComp) {
                newComp.set("v.validators", {
                    demo: {
                        fieldNames: ["name", "size"],
                        validate: function(fields, cmp) {
                            var nameInput = fields[0];
                            var sizeInput = fields[1];
                            var name = nameInput.get("v.value");
                            var size = _.parseInt(sizeInput.get("v.value"));
                            if(_.size(name) !== size) {
                                return "Name should have correct size.";
                            }
                        },
                    },
                    hobby_check: {
                        fieldNames: ["hobby"],
                        validate: function(fields, cmp) {
                            var hobbyInput = fields[0];
                            var hobby = hobbyInput.get("v.value");
                            if(hobby !== 'games') {
                                return "Hobby can only be games.";
                            }
                        },
                    },
                });

                newComp.set("v.constraints", {
                    demo: {
                        fieldNames: ["name", "age"],
                        watch: ["name"],
                        enforce: function(fields, cmp) {
                            var nameInput = fields[0];
                            var ageInput = fields[1];
                            var name = nameInput.get("v.value");
                            ageInput.set("v.value", _.size(name) * 10);
                        },
                    },
                });
            },
            onTrigger: function(name, params, createdComp, event) {
                var button = event.getSource();
                if(button.get("v.name") === "submit") {
                    var valid = createdComp.save();
                    console.log("Form is valid? " + valid);
                }
                else if(button.get("v.name") === "dirty") {
                    var dirty = createdComp.checkDirty();
                    window.alert("Dirty? " + dirty);
                }
                else if(button.get("v.name") === "cancel") {
                    createdComp.cancel();
                }
            },
        },
        {
            name: "Formatted Date Time (Lightning)",
            componentName: "lightning:formattedDateTime",
            description: "Create a lightning formatted date time.",
            created: "01/12/2017",
            defaultParams: {
                value: '1470174029742',
                class: 'class',
                day: '2-digit',
                era: 'short',
                hour: '2-digit',
                hour12: false,
                minute: '2-digit',
                month: '2-digit',
                second: '2-digit',
                title: 'title',
                weekday: 'short',
                year: '2-digit',
            },
            configurable: {
                class: 'String',
                day: [
                    "numeric",
                    "2-digit",
                ],
                era: [
                    "narrow",
                    "short",
                    "long",
                ],
                hour: [
                    "numeric",
                    "2-digit",
                ],
                hour12: 'Boolean',
                minute: [
                    "numeric",
                    "2-digit",
                ],
                month: [
                    "2-digit",
                    "narrow",
                    "short",
                    "long",
                ],
                second: [
                    "numeric",
                    "2-digit",
                ],
                weekday: [
                    "narrow",
                    "short",
                    "long",
                ],
                year: [
                    "numeric",
                    "2-digit",
                ],
            },
            mandatory: [
                "value",
            ],
        },
        {
            name: "Formatted Date Time (CTC)",
            componentName: "c:formattedDateTime",
            description: "Create a ctc formatted date time.",
            created: "01/12/2017",
            defaultParams: {
                value: '1470174029742',
                class: 'class',
                type: 'date',
            },
            configurable: {
                class: 'String',
                type: [
                    "date",
                    "time",
                    "datetime",
                    "datetime-short",
                ],
            },
            mandatory: [
                "value",
            ],
        },
        {
            name: "Formatted Email (Lightning)",
            componentName: "lightning:formattedEmail",
            description: "Create a lightning formatted email.",
            created: "01/12/2017",
            defaultParams: {
                value: 'wilson@clicktocloud.com',
                label: 'Email',
            },
            configurable: {
                value: 'String',
                label: 'String',
            },
            mandatory: [
                "value",
            ],
        },
        {
            name: "Formatted Location (Lightning)",
            componentName: "lightning:formattedLocation",
            description: "Create a lightning formatted location.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                latitude: 37.7938460,
                longitude: -122.3948370,
            },
            configurable: {
                class: 'String',
                latitude: 'Number',
                longitude: 'Number',
            },
            mandatory: [
                "latitude",
                "longitude",
            ],
        },
        {
            name: "Formatted Number (Lightning)",
            componentName: "lightning:formattedNumber",
            description: "Create a lightning formatted number.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                value: 120000.10,
                style: 'currency',
                currencyCode: 'USD',
                currencyDisplayAs: 'symbol',
            },
            configurable: {
                class: 'String',
                value: 'Number',
                style: [
                    "decimal",
                    "currency",
                    "percent",
                ],
                currencyCode: 'String',
                currencyDisplayAs: [
                    "symbol",
                    "code",
                    "name",
                ],
            },
            mandatory: [
                "value",
            ],
        },
        {
            name: "Formatted Number (CTC)",
            componentName: "c:formattedNumber",
            description: "Create a ctc formatted number.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                value: 120000.10,
                type: 'currency',
            },
            configurable: {
                class: 'String',
                value: 'Number',
                type: [
                    "currency",
                ],
            },
            mandatory: [
                "value",
            ],
        },
        {
            name: "Formatted Phone (Lightning)",
            componentName: "lightning:formattedPhone",
            description: "Create a lightning formatted phone.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                value: '0412345678',
            },
            configurable: {
                class: 'String',
                value: 'Number',
            },
        },
        {
            name: "Formatted Rich Text (Lightning)",
            componentName: "lightning:formattedRichText",
            description: "Create a lightning formatted rich text.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                value: '<h1>Hello</h1>',
            },
            configurable: {
                class: 'String',
                value: 'String',
            },
        },
        {
            name: "Formatted Text (Lightning)",
            componentName: "lightning:formattedText",
            description: "Create a lightning formatted text.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                value: 'I like salesforce.com and trailhead.salesforce.com.',
                linkify: true,
            },
            configurable: {
                class: 'String',
                value: 'String',
                linkify: 'Boolean',
            },
        },
        {
            name: "Formatted Url (Lightning)",
            componentName: "lightning:formattedUrl",
            description: "Create a lightning formatted url.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                value: 'http://www.salesforce.com',
                target: '_blank',
                label: 'Salesforce',
                tooltip: 'website',
            },
            configurable: {
                class: 'String',
                value: 'String',
                target: [
                    "_blank",
                    "_parent",
                    "_self",
                    "_top",
                ],
                label: 'String',
                tooltip: 'String',
            },
        },
        {
            name: "Help Text (Lightning)",
            componentName: "lightning:helptext",
            description: "Create a lightning help text.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                content: 'Some help',
                iconName: 'utility:info',
            },
            configurable: {
                class: 'String',
                content: 'String',
                iconName: 'String',
            },
        },
        {
            name: "Help Text (CTC)",
            componentName: "c:helptext",
            description: "Create a ctc help text.",
            created: "20/01/2018",
            defaultParams: {
                content: 'Some help',
                iconName: 'ctc-utility:info_info',
                align: 'bottom-left',
            },
            configurable: {
                content: 'String',
                iconName: 'Icon',
                align: [
                    "top",
                    "top-left",
                    "top-right",
                    "bottom",
                    "bottom-left",
                    "bottom-right",
                ],
            },
            createComp: function(name, params) {
                return `
                <div>
                    <${name} ${spreadParams(params)}/>
                    <c:helptext content="#unescaped#&lt;strong&gt;Test&lt;/strong&gt;"/>
                </div>
                `;
            },
        },
        {
            name: "Icon (Lightning)",
            componentName: "lightning:icon",
            description: "Create a lightning icon.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                iconName: 'utility:info',
                size: 'medium',
                variant: 'warning',
                alternativeText: '',
            },
            configurable: {
                class: 'String',
                iconName: 'String',
                size: [
                    "xx-small",
                    "x-small",
                    "small",
                    "medium",
                    "large",
                ],
                variant: [
                    "inverse",
                    "warning",
                    "error",
                ],
            },
            mandatory: [
                "iconName",
            ],
        },
        {
            name: "Icon (CTC)",
            componentName: "c:icon",
            description: "Create a ctc icon.",
            created: "17/01/2018",
            defaultParams: {
                class: 'class',
                title: 'title',
                iconName: 'ctc-utility:a_clear',
                size: 'medium',
                variant: 'warning',
                alternativeText: '',
            },
            configurable: {
                class: 'String',
                iconName: 'Icon',
                size: [
                    "xx-small",
                    "x-small",
                    "small",
                    "medium",
                    "large",
                ],
                variant: [
                    "inverse",
                    "warning",
                    "error",
                ],
            },
            mandatory: [
                "iconName",
            ],
        },
        {
            name: "Icon Primitive (CTC)",
            componentName: "c:primitiveIcon",
            description: "Create a ctc primitive icon.",
            created: "01/12/2017",
            defaultParams: {
                iconName: 'ctc-utility:info_info',
                size: 'small',
                variant: 'warning',
                svgClass: '',
                display: '',
            },
            configurable: {
                iconName: 'Icon',
                size: [
                    "xx-small",
                    "x-small",
                    "small",
                    "large",
                ],
                variant: [
                    "bare",
                    "inverse",
                    "warning",
                    "error",
                ],
                display: [
                    "inline-flex",
                ],
            },
            mandatory: [
                "iconName",
            ],
        },
        {
            name: "Icon Picker (CTC)",
            componentName: "c:iconPicker",
            description: "Create a ctc icon picker.",
            created: "19/12/2017",
            defaultParams: {
                name: 'name',
                variant: 'standard',
                class: 'class',
                title: 'title',
                disabled: false,
                readonly: false,
                required: false,
                label: 'Icon Picker',
                placeholder: '',
                category: 'ctc-utility',
                tooltip: "",
            },
            configurable: {
                variant: [
                    "standard",
                    "label-hidden",
                ],
                class: 'String',
                disabled: 'Boolean',
                readonly: 'Boolean',
                required: 'Boolean',
                label: 'String',
                placeholder: 'String',
                category: 'String',
                tooltip: "String",
            },
            mandatory: [
                "name",
                "label",
            ],
        },
        {
            name: "If (CTC)",
            componentName: "c:if",
            description: "Create a ctc if.",
            created: "07/01/2018",
            defaultParams: {
                isTrue: true,
            },
            configurable: {
                isTrue: 'Boolean',
            },
            mandatory: [
                "isTrue",
            ],
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    Visible condition
                    <aura:set attribute="else">
                        Invisible condition
                    </aura:set>
                </${name}>
                `;
            },
        },
        {
            name: "Image (CTC)",
            componentName: "c:image",
            description: "Create a ctc image.",
            created: "17/01/2018",
            defaultParams: {
                src: 'https://static.pexels.com/photos/40784/drops-of-water-water-nature-liquid-40784.jpeg',
                altSrc: '',
                alt: 'water',
                width: 200,
                height: 100,
            },
            configurable: {
                src: 'String',
                altSrc: 'String',
                alt: 'String',
                width: 'Number',
                height: 'Number',
            },
            mandatory: [
                "src",
            ],
        },
        {
            name: "Input (Lightning)",
            componentName: "lightning:input",
            description: "Create a lightning input.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                disabled: false,
                isLoading: false,
                label: 'Input',
                name: 'name',
                placeholder: '',
                readonly: false,
                required: false,
                title: 'title',
                type: 'number',
                value: '',
                variant: 'standard',
            },
            configurable: {
                class: 'String',
                disabled: 'Boolean',
                isLoading: 'Boolean',
                label: 'String',
                placeholder: 'String',
                readonly: 'Boolean',
                required: 'Boolean',
                type: [
                    "checkbox",
                    "checkbox-button",
                    "color",
                    "date",
                    "datetime-local",
                    "email",
                    "file",
                    "month",
                    "number",
                    "password",
                    "radio",
                    "range",
                    "search",
                    "tel",
                    "text",
                    "time",
                    "toggle",
                    "url",
                    "week",
                ],
                variant: [
                    "standard",
                    "label-hidden",
                ],
            },
            mandatory: [
                "label",
                "name",
            ],
        },
        {
            name: "Input (CTC)",
            componentName: "c:input",
            description: "Create a ctc input.",
            created: "19/01/2018",
            defaultParams: {
                class: 'class',
                disabled: false,
                isLoading: false,
                label: 'Input',
                name: 'name',
                placeholder: '',
                readonly: false,
                required: false,
                title: 'title',
                type: 'text',
                value: '',
                variant: 'standard',
                tooltip: "",
                allowedPattern: '',
                formatter: '',
                step: '',
                addonBefore: '',
                addonAfter: '',
                style: 'tradition',
                iconNameLeft: '',
                iconNameRight: '',
            },
            configurable: {
                class: 'String',
                disabled: 'Boolean',
                isLoading: 'Boolean',
                label: 'String',
                placeholder: 'String',
                readonly: 'Boolean',
                required: 'Boolean',
                type: [
                    "checkbox",
                    "checkbox-button",
                    "color",
                    "date",
                    "datetime-local",
                    "email",
                    "file",
                    "month",
                    "number",
                    "password",
                    "radio",
                    "range",
                    "search",
                    "tel",
                    "text",
                    "time",
                    "toggle",
                    "url",
                    "week",
                    "checkbox-big",
                    "checkbox-medium",
                    "checkbox-small",
                    "radio-big",
                    "radio-medium",
                    "radio-small",
                ],
                variant: [
                    "standard",
                    "label-hidden",
                ],
                tooltip: "String",
                allowedPattern: 'String',
                formatter: "dataProducer:formatters",
                step: 'String',
                addonBefore: 'String',
                addonAfter: 'String',
                style: [
                    "base",
                    "tradition",
                ],
                iconNameLeft: 'Icon',
                iconNameRight: 'Icon',
            },
            mandatory: [
                "name",
                "label",
            ],
        },
        {
            name: "Input Phone (CTC)",
            componentName: "c:inputPhone",
            description: "Create a ctc input phone.",
            created: "18/01/2018",
            defaultParams: {
                name: 'name',
                variant: 'standard',
                class: 'class',
                title: 'title',
                disabled: false,
                readonly: false,
                required: false,
                label: 'Input Phone',
                placeholder: '',
                tooltip: '',
                type: '',
            },
            configurable: {
                variant: [
                    "standard",
                    "label-hidden",
                ],
                class: 'String',
                disabled: 'Boolean',
                readonly: 'Boolean',
                required: 'Boolean',
                label: 'String',
                placeholder: 'String',
                tooltip: 'String',
                type: [
                    '',
                    'mobile',
                    'fixed_line',
                ],
            },
            mandatory: [
                "name",
                "label",
            ],
            createComp: function(name, params) {
                const newParams = {
                    countries: [
                        {
                            label: '+61 - Australia',
                            value: 61,
                        },
                        {
                            label: '+1 - United States of America',
                            value: 1,
                        },
                        {
                            label: '+86 - China',
                            value: 86,
                        },
                        {
                            label: '+886 - Taiwan',
                            value: 886,
                        },
                    ],
                };
                return fromXml(`<${name} ${spreadParams(params)}/>`).
                    assign(newParams);
            },
        },
        {
            name: "Input Location (Lightning)",
            componentName: "lightning:inputLocation",
            description: "Create a lightning input location.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                latitude: 37.7938460,
                longitude: -122.3948370,
                disabled: false,
                label: 'Input',
                readonly: false,
                required: false,
                variant: 'standard',
            },
            configurable: {
                class: 'String',
                disabled: 'Boolean',
                label: 'String',
                readonly: 'Boolean',
                required: 'Boolean',
                variant: [
                    "standard",
                    "label-hidden",
                ],
            },
        },
        {
            name: "Input Rich Text (Lightning)",
            componentName: "lightning:inputRichText",
            description: "Create a lightning input rich text.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                value: '',
                placeholder: '',
                disabled: false,
                valid: true,
                variant: 'bottom-toolbar',
                messageWhenBadInput: '',
            },
            configurable: {
                class: 'String',
                placeholder: 'String',
                disabled: 'Boolean',
                valid: 'Boolean',
                variant: [
                    "bottom-toolbar",
                ],
                messageWhenBadInput: 'String',
            },
        },
        {
            name: "Iteration (CTC)",
            componentName: "c:iteration",
            description: "Create a ctc iteration.",
            created: "15/01/2018",
            defaultParams: {
            },
            configurable: {
            },
            createComp: function(name, params, component) {
                const items = [];
                _.times(5, n => {
                    items.push({
                        name: "Item " + _.uniqueId(),
                    });
                });
                const newParams = {
                    template: `
                    <c:button label="{! v.object.name }"/>
                    `,
                    items,
                    providers: {
                        cmp: component,
                    },
                };
                const div = fromXml(`
                    <div>
                        <${name} ${spreadParams(params)}/>
                        <div class="slds-p-top_medium slds-m-top_medium slds-border_top">
                            <c:button label="Append" name="append" onclick="{! c.trigger }"/>
                            <c:button label="Prepend" name="prepend" onclick="{! c.trigger }"/>
                            <c:button label="Remove First" name="removeFirst" onclick="{! c.trigger }"/>
                            <c:button label="Remove Last" name="removeLast" onclick="{! c.trigger }"/>
                            <c:button label="Update 3rd Item" name="update" onclick="{! c.trigger }"/>
                        </div>
                    </div>
                    `, component);
                div.children.body[0].assign(newParams);
                return div;
            },
            afterRender: function(newComp) {
                const cmp = newComp.get("v.body")[0];
                cmp.renderItems();
            },
            onTrigger: function(name, params, createdComp, event) {
                const cmp = createdComp.get("v.body")[0];
                const items = cmp.get("v.items");
                switch(event.getSource().get("v.name")) {
                    case 'append':
                        items.push({
                            name: "Item " + _.uniqueId(),
                        });
                        break;
                    case 'prepend':
                        items.unshift({
                            name: "Item " + _.uniqueId(),
                        });
                        break;
                    case 'removeFirst':
                        items.shift();
                        break;
                    case 'removeLast':
                        items.pop();
                        break;
                    case 'update':
                        items[2].name += " Updated";
                        break;
                    default:
                        break;
                }
                cmp.set("v.items", items);
                cmp.renderItems();
            },
        },
        {
            name: "Layout (Lightning)",
            componentName: "lightning:layout",
            description: "Create a lightning layout.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                horizontalAlign: 'center',
                verticalAlign: 'center',
                multipleRows: false,
                pullToBoundary: 'small',
            },
            configurable: {
                class: 'String',
                horizontalAlign: [
                    "center",
                    "space",
                    "spread",
                    "end",
                ],
                verticalAlign: [
                    "start",
                    "center",
                    "end",
                    "stretch",
                ],
                multipleRows: 'Boolean',
                pullToBoundary: [
                    "small",
                    "medium",
                    "large",
                ],
            },
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    <lightning:layoutItem flexibility="auto" padding="around-small">1</lightning:layoutItem>
                    <lightning:layoutItem flexibility="auto" padding="around-small">2</lightning:layoutItem>
                    <lightning:layoutItem flexibility="auto" padding="around-small">3</lightning:layoutItem>
                    <lightning:layoutItem flexibility="auto" padding="around-small">4</lightning:layoutItem>
                </${name}>
                `;
            },
        },
        {
            name: "Layout Item (Lightning)",
            componentName: "lightning:layoutItem",
            description: "Create a lightning layout item.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                size: 12,
                smallDeviceSize: 12,
                mediumDeviceSize: 12,
                largeDeviceSize: 12,
                flexibility: 'auto',
                padding: 'around-small',
            },
            configurable: {
                class: 'String',
                size: 'Number',
                smallDeviceSize: 'Number',
                mediumDeviceSize: 'Number',
                largeDeviceSize: 'Number',
                flexibility: [
                    "auto",
                    "shrink",
                    "no-shrink",
                    "grow",
                    "no-grow",
                    "no-flex",
                ],
                padding: [
                    "horizontal-small",
                    "horizontal-medium",
                    "horizontal-large",
                    "around-small",
                    "around-medium",
                    "around-large",
                ],
            },
            createComp: function(name, params) {
                return `
                <lightning:layout>
                    <${name} ${spreadParams(params)}>1</${name}>
                    <${name} ${spreadParams(params)}>2</${name}>
                    <${name} ${spreadParams(params)}>3</${name}>
                    <${name} ${spreadParams(params)}>4</${name}>
                </lightning:layout>
                `;
            },
        },
        {
            name: "Link (CTC)",
            componentName: "c:link",
            description: "Create a ctc link.",
            created: "04/01/2018",
            requires: [
                "This component only works in one.app",
            ],
            defaultParams: {
                variant: 'url',
                url: "http://www.google.com",
                isredirect: false,
                tooltip: "",
            },
            configurable: {
                variant: [
                    'url',
                    'sobject',
                    'relatedList',
                    'objectHome',
                    'list',
                    'component',
                ],
                url: "String",
                isredirect: "Boolean",
                tooltip: "String",
            },
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    Link
                </${name}>
                `;
            },
        },
        {
            name: "List Editor (CTC)",
            componentName: "c:listEditor",
            description: "Create a ctc list editor.",
            created: "23/01/2018",
            defaultParams: {
                name: "demoList",
                paginatorName: "demo",
            },
            configurable: {
            },
            mandatory: [
                "name",
            ],
            createComp: function(name, params) {
                const items = [];
                _.times(13, n => {
                    items.push({
                        name: _.sample(["Wilson", "Test"]),
                        age: _.random(30, 40),
                    });
                });
                const newParams = {
                    items,
                    itemsConfig: {
                        createEditor: function(value, index, cmp) {
                            return `
                            <div class="slds-grid slds-grid_pull-padded-medium">
                                <div class="slds-col slds-p-horizontal_medium slds-size_1-of-2">
                                    <c:input type="text" name="name" label="Name" value="{! v.object.name }"/>
                                </div>
                                <div class="slds-col slds-p-horizontal_medium slds-size_1-of-2">
                                    <c:input type="number" name="age" label="Age" value="{! v.object.age }"/>
                                </div>
                            </div>
                            `;
                        },
                    },
                };
                const div = fromXml(`
                    <div>
                        <${name} ${spreadParams(params)}/>
                        <c:paginator class="slds-m-top_medium" variant="default" name="demo" listName="demoList" pageSize="5" current="1"/>
                    </div>
                    `);
                div.children.body[0].assign(newParams);
                return div;
            },
        },
        {
            name: "Lookup (CTC)",
            componentName: "c:lookup",
            description: "Create a ctc lookup.",
            created: "01/12/2017",
            requires: [
                "Implement onlookup to make it fully work.",
            ],
            defaultParams: {
                name: 'name',
                variant: 'standard',
                disabled: false,
                required: false,
                class: 'class',
                title: 'title',
                label: 'Lookup',
                tooltip: "",
            },
            configurable: {
                name: 'String',
                variant: [
                    "standard",
                    "label-hidden",
                ],
                disabled: 'Boolean',
                required: 'Boolean',
                class: 'String',
                title: 'String',
                label: 'String',
                tooltip: "String",
            },
            mandatory: [
                "label",
                "name",
            ],
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)} onlookup="{! c.trigger }"/>
                `;
            },
            onTrigger: function(name, params, createdComp) {
                createdComp.setObject({
                    value: "New Object",
                    id: "id",
                });
            },
        },
        {
            name: "Menu Item (Lightning)",
            componentName: "lightning:menuItem",
            description: "Create a lightning menu item.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                value: 'value',
                iconName: '',
                label: 'Menu Item',
                checked: true,
                disabled: false,
            },
            configurable: {
                class: 'String',
                iconName: 'String',
                label: 'String',
                checked: 'Boolean',
                disabled: 'Boolean',
            },
            createComp: function(name, params) {
                return `
                <lightning:buttonMenu alternativeText="Toggle Menu">
                    <${name} ${spreadParams(params)} user:ref="true"/>
                </lightning:buttonMenu>
                `;
            },
        },
        {
            name: "Modal (CTC)",
            componentName: "c:modal",
            description: "Create a ctc modal.",
            created: "19/01/2018",
            defaultParams: {
                size: 'base',
                headerText: 'Modal Header',
            },
            configurable: {
                size: ["base", "large"],
                headerText: "String",
            },
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    <aura:set attribute="footer">
                        <c:button variant="tertiary" label="Cancel"/>
                        <c:button variant="primary" label="Save"/>
                    </aura:set>
                    Some texts in modal.
                </${name}>
                `;
            },
            afterRender: function(newComp) {
                newComp.show();
            },
        },
        {
            name: "Object Editor (CTC)",
            componentName: "c:objectEditor",
            description: "Create a ctc object editor.",
            created: "01/12/2017",
            defaultParams: {
                template: 'one-column',
            },
            configurable: {
                template: [
                    'one-column',
                    'two-column',
                    'table-body-row',
                    'table-header-row',
                ],
            },
            createComp: function(name, params, component) {
                const newParams = {
                    object: {
                        name: "Wilson",
                        age: 30,
                        job: "Software Engineer",
                        married: true,
                    },
                    editorConfig: [
                        {
                            name: "name",
                            template: `<c:input type="text" name="name" label="Name" value="{! v.object.name }"/>`,
                        },
                        {
                            name: "age",
                            template: `<c:input type="number" name="age" label="Age" value="{! v.object.age }"/>`,
                        },
                        {
                            name: "job",
                            template: `<c:input type="text" name="job" label="Job" value="{! v.object.job }"/>`,
                        },
                        {
                            name: "married",
                            template: `<c:input type="toggle" name="married" label="Married" checked="{! v.object.married }"/>`,
                        },
                        {
                            name: "action",
                            template: `<c:button variant="primary" label="Click" onclick="{! cmp.c.trigger }"/>`,
                        },
                    ],
                    providers: {
                        cmp: component,
                    },
                };
                return fromXml(`<${name} ${spreadParams(params)}/>`).
                    assign(newParams);
            },
            afterRender: function(newComp) {
                newComp.renderEditor();
            },
            onTrigger: function(name, params) {
                window.alert("Clicked");
            },
        },
        {
            name: "Paginator (CTC)",
            componentName: "c:paginator",
            description: "Create a ctc paginator.",
            created: "18/01/2018",
            defaultParams: {
                class: 'class',
                name: 'name',
                title: 'title',
                variant: 'default',
                total: 36,
                pageSize: 5,
                current: 7,
            },
            configurable: {
                class: 'String',
                variant: [
                    "default",
                ],
                total: 'Number',
                pageSize: 'Number',
                current: 'Number',
            },
            mandatory: [
                "name",
            ],
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                </${name}>
                `;
            },
        },
        {
            name: "Path (CTC)",
            componentName: "c:path",
            description: "Create a ctc path.",
            created: "17/12/2017",
            defaultParams: {
                value: 'two',
            },
            configurable: {
                value: 'String',
            },
            mandatory: [
                "stages",
            ],
            createComp: function(name, params) {
                const newParams = {
                    stages: [
                        {
                            label: 'Stage 1',
                            value: 'one',
                        },
                        {
                            label: 'Stage 2',
                            value: 'two',
                        },
                        {
                            label: 'Stage 3',
                            value: 'three',
                        },
                    ],
                };
                return fromXml(`
                <${name} ${spreadParams(params)}>
                    <aura:set attribute="action">
                        <c:button variant="primary" label="Close"/>
                    </aura:set>
                </${name}>
                `).assign(newParams);
            },
        },
        {
            name: "Pill (Lightning)",
            componentName: "lightning:pill",
            description: "Create a lightning pill.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                label: 'Pill',
                href: '',
                hasError: false,
                name: 'name',
            },
            configurable: {
                class: 'String',
                label: 'String',
                href: 'String',
                hasError: 'Boolean',
            },
            mandatory: [
                "label",
            ],
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    <aura:set attribute="media">
                        <lightning:icon
                            iconName="standard:account"
                            alternativeText="Account"
                        />
                    </aura:set>
                </${name}>
                `;
            },
        },
        {
            name: "Picklist (CTC)",
            componentName: "c:picklist",
            description: "Create a ctc picklist.",
            created: "19/01/2018",
            defaultParams: {
                name: 'name',
                variant: 'standard',
                disabled: false,
                required: false,
                class: 'class',
                title: 'title',
                label: 'label',
                placeholder: 'Select an Option',
                messageWhenValueMissing: '',
                readonly: false,
                select: 'single',
                hidePills: false,
                style: "base",
                limit: 5,
                searchable: false,
                tooltip: "",
                dataProducer: "",
                popupClass: "",
            },
            configurable: {
                name: 'String',
                variant: [
                    "standard",
                    "label-hidden",
                ],
                disabled: 'Boolean',
                required: 'Boolean',
                class: 'String',
                title: 'String',
                label: 'String',
                placeholder: 'String',
                messageWhenValueMissing: 'String',
                readonly: 'Boolean',
                select: [
                    "single",
                    "multiple",
                ],
                hidePills: 'Boolean',
                style: [
                    "base",
                    "checkbox",
                    "checkbutton",
                ],
                limit: 'Number',
                searchable: "Boolean",
                tooltip: "String",
                dataProducer: "dataProducer:dataProducers",
                popupClass: "String",
            },
            mandatory: [
                "name",
                "label",
            ],
            createComp: function(name, params) {
                const newParams = {
                    options: [
                        {
                            label: 'Group 1',
                            isGroupLabel: true,
                        },
                        {
                            label: 'Option 1',
                            value: '1',
                        },
                        {
                            label: 'Option 2',
                            value: '2',
                        },
                    ],
                    configurer: {
                        getTotalSelectionLabel: function(selections) {
                            return _.isEmpty(selections) ? null : "Selections (" + _.size(selections) + ")";
                        },

                        getLabel: function(option) {
                            return option.label + "m&sup2;";
                        },
                    },
                };
                return fromXml(`<${name} ${spreadParams(params)}/>`).
                    assign(newParams);
            },
        },
        {
            name: "Placeholder (CTC)",
            componentName: "c:placeholder",
            description: "Create a ctc placeholder.",
            created: "01/12/2017",
            defaultParams: {
                name: 'related',
                opacity: 50,
            },
            configurable: {
                name: [
                    'highlight',
                    'group_highlight',
                    'record_home_anchor_vertical',
                    'detail',
                    'related',
                    'relatedInPreview',
                    'list',
                    'split_view_header',
                    'list_view_header',
                    'list_no_header',
                    'list_app',
                    'listpreview',
                    'split_view',
                    'feed_item',
                    'feed',
                    'map',
                    'composer',
                    'composer_tabs',
                    'path',
                    'record_home_anchor',
                    'record_home_anchor_collapsed',
                    'preview_panel_anchor',
                    'related_record',
                    'contacts',
                    'files',
                    'insights_card',
                    'lead_insights_hover',
                    'lead_insights_record_home',
                    'assistant_card',
                    'notes_products_generic',
                    'notes_products_generic_alt',
                    'activity_discussion',
                    'activity_expand',
                    'activity_composer',
                    'activity_composer_small',
                    'object_home_list_anchor_alt',
                    'object_home_list_anchor',
                    'object_home_list_summary',
                    'table_list_line_item',
                    'event_card',
                    'top_deals',
                    'recent_records',
                    'stencil_account_news',
                    'stencil_account_news_compact',
                    'setup_card',
                    'app_detail',
                    'empty_chart',
                    'twitter_bird',
                    'social_service',
                    'dashboard_card',
                    'pipelineView',
                    'fieldMapping',
                ],
                opacity: 'Number',
            },
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                </${name}>
                `;
            },
        },
        {
            name: "Preact (CTC)",
            componentName: "c:preact",
            description: "Create a ctc preact app container.",
            created: "25/01/2018",
            defaultParams: {
                name: 'demo_preact',
            },
            configurable: {
                name: 'dataProducer:preact-apps',
            },
            createComp: function(name, params, cmp) {
                const newParams = {
                    onPreactEvent: cmp.getReference("c.trigger"),
                };
                return fromXml(`<${name} ${spreadParams(params)}/>`).
                    assign(newParams);
            },
            afterRender: function(newComp) {
                var name = newComp.get("v.name");
                if(name === 'helloworld') {
                    newComp.set('v.props', {
                        style: {
                            color: 'red',
                        },
                    });
                }
            },
            onTrigger: function(name, params, createdComp, event) {
                window.$Utils.getCurrentApp().toast({
                    variant: "success",
                    content: "Event fired from Preact App",
                });
            },
        },
        {
            name: "Preview Text (CTC)",
            componentName: "c:previewText",
            description: "Create a ctc preview text.",
            created: "17/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                text: 'A long text',
            },
            configurable: {
                text: 'String',
            },
        },
        {
            name: "Progress Bar (Lightning)",
            componentName: "lightning:progressBar",
            description: "Create a lightning progress bar.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                variant: 'base',
                value: 50,
                size: 'medium',
            },
            configurable: {
                class: 'String',
                variant: [
                    "base",
                    "circular",
                ],
                value: 'Number',
                size: [
                    "x-small",
                    "small",
                    "medium",
                    "large",
                ],
            },
        },
        {
            name: "Progress Indicator (CTC)",
            componentName: "c:progressIndicator",
            description: "Create a ctc progress indicator.",
            created: "17/01/2018",
            defaultParams: {
                class: 'class',
                title: 'title',
                variant: 'base',
                error: false,
            },
            configurable: {
                class: 'String',
                variant: [
                    "base",
                ],
                error: 'Boolean',
            },
            mandatory: [
                "options",
            ],
            createComp: function(name, params) {
                const options = [];
                _.times(5, n => {
                    options.push({
                        label: 'Step ' + (n + 1),
                        value: n + 1,
                    });
                });
                const newParams = {
                    options,
                };
                return fromXml(`<${name} ${spreadParams(params)}/>`).
                    assign(newParams);
            },
        },
        {
            name: "Progress Indicator (Lightning)",
            componentName: "lightning:progressIndicator",
            description: "Create a lightning progress indicator.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                currentStep: 'step1',
                hasError: false,
                type: 'base',
                variant: 'base',
            },
            configurable: {
                class: 'String',
                hasError: 'Boolean',
                type: [
                    "base",
                    "path",
                ],
                variant: [
                    "base",
                    "shaded",
                ],
            },
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    <lightning:progressStep label="Step One" value="step1"/>
                    <lightning:progressStep label="Step Two" value="step2"/>
                    <lightning:progressStep label="Step Three" value="step3"/>
                </${name}>
                `;
            },
        },
        {
            name: "Radio Group (Lightning)",
            componentName: "lightning:radioGroup",
            description: "Create a lightning radio group.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                name: 'name',
                label: 'label',
                value: '',
                messageWhenValueMissing: '',
                required: false,
                disabled: false,
                variant: 'standard',
                type: 'radio',
            },
            configurable: {
                class: 'String',
                label: 'String',
                messageWhenValueMissing: 'String',
                required: 'Boolean',
                disabled: 'Boolean',
                variant: [
                    "standard",
                    "label-hidden",
                ],
                type: [
                    "radio",
                    "button",
                ],
            },
            mandatory: [
                "name",
                "label",
                "options",
            ],
            createComp: function(name, params) {
                const newParams = {
                    options: [
                        {
                            label: 'Option 1',
                            value: 1,
                        },
                        {
                            label: 'Option 2',
                            value: 2,
                        },
                    ],
                };
                return fromXml(`<${name} ${spreadParams(params)}/>`).
                    assign(newParams);
            },
        },
        {
            name: "Radio Group (CTC)",
            componentName: "c:radioGroup",
            description: "Create a ctc radio group.",
            created: "16/01/2018",
            defaultParams: {
                class: 'class',
                title: 'title',
                name: 'name',
                label: 'label',
                value: '',
                required: false,
                disabled: false,
                variant: 'standard',
                type: 'radio',
                style: 'vertical',
            },
            configurable: {
                class: 'String',
                label: 'String',
                required: 'Boolean',
                disabled: 'Boolean',
                variant: [
                    "standard",
                    "label-hidden",
                ],
                type: [
                    "radio",
                    "radio-big",
                    "radio-medium",
                    "radio-small",
                ],
                style: [
                    "vertical",
                    "horizontal",
                    "button",
                    "primary",
                    "select",
                ],
            },
            mandatory: [
                "name",
                "label",
                "options",
            ],
            createComp: function(name, params) {
                const newParams = {
                    options: [
                        {
                            label: 'Option 1',
                            value: 'option1',
                            labelHtml: 'Option 1 m&sup2;',
                        },
                        {
                            label: 'Option 2',
                            value: 'option2',
                        },
                    ],
                };
                return fromXml(`<${name} ${spreadParams(params)}/>`).
                    assign(newParams);
            },
        },
        {
            name: "Rating (CTC)",
            componentName: "c:rating",
            description: "Create a ctc rating.",
            created: "17/01/2018",
            defaultParams: {
                name: 'name',
                variant: 'standard',
                class: 'class',
                title: 'title',
                disabled: false,
                readonly: false,
                required: false,
                label: 'Rating',
                showTooltip: false,
                tooltip: '',
                style: 'favorite',
            },
            configurable: {
                variant: [
                    "standard",
                    "label-hidden",
                ],
                class: 'String',
                disabled: 'Boolean',
                readonly: 'Boolean',
                required: 'Boolean',
                label: 'String',
                showTooltip: 'Boolean',
                tooltip: 'String',
                style: [
                    'favorite',
                ],
            },
            mandatory: [
                "name",
                "label",
            ],
            createComp: function(name, params) {
                const newParams = {
                    options: [
                        {
                            label: 'Terrible',
                            value: 1,
                        },
                        {
                            label: 'Bad',
                            value: 2,
                        },
                        {
                            label: 'Not so bad',
                            value: 3,
                        },
                        {
                            label: 'Good',
                            value: 4,
                        },
                        {
                            label: 'Awesome',
                            value: 5,
                        },
                    ],
                };
                return fromXml(`<${name} ${spreadParams(params)}/>`).
                    assign(newParams);
            },
        },
        {
            name: "Relative Date Time (Lightning)",
            componentName: "lightning:relativeDateTime",
            description: "Create a lightning relative date time.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                value: Date.now() - 60 * 60 * 1000,
            },
            configurable: {
                class: 'String',
                value: 'Number',
            },
            mandatory: [
                "value",
            ],
        },
        {
            name: "Router (CTC)",
            componentName: "c:router",
            description: "Create a ctc router.",
            created: "17/12/2017",
            defaultParams: {
                name: 'demo',
            },
            configurable: {
            },
            mandatory: [
                "name",
                "routes",
            ],
            createComp: function(name, params, component) {
                const newParams = {
                    routes: [
                        {
                            name: "one",
                            params: {
                                message: "",
                            },
                            template: `
                            <div>{! v.data.message }</div>
                            `,
                        },
                        {
                            name: "two",
                            params: {
                                message: "",
                            },
                            template: `
                            <div>{! v.data.message }</div>
                            `,
                        },
                    ],
                };
                var div = fromXml(`
                    <div>
                        <${name} ${spreadParams(params)}>
                        </${name}>
                        <c:button variant="primary" label="Route" name="one" onclick="{! c.trigger }"/>
                    </div>
                    `,
                    component
                );
                div.children.body[0].assign(newParams);
                return div;
            },
            onTrigger: function(name, params, createdComp, event) {
                var button = event.getSource();
                var pageName = button.get("v.name");
                pageName = pageName === "one" ? "two" : "one";
                button.set("v.name", pageName);
                window.$Utils.routeTo("demo", pageName, {
                    message: "Page " + pageName,
                });
            },
        },
        {
            name: "Select (Lightning)",
            componentName: "lightning:select",
            description: "Create a lightning select.",
            created: "01/12/2017",
            defaultParams: {
                name: 'name',
                value: 'value',
                variant: 'standard',
                disabled: false,
                readonly: false,
                required: false,
                class: 'class',
                title: 'title',
                label: 'Select',
            },
            configurable: {
                variant: [
                    "standard",
                    "label-hidden",
                ],
                disabled: 'Boolean',
                readonly: 'Boolean',
                required: 'Boolean',
                class: 'String',
                label: 'String',
            },
            mandatory: [
                "name",
                "label",
            ],
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                </${name}>
                `;
            },
        },
        {
            name: "Search Client Modal (CTC)",
            componentName: "c:searchClientModal",
            description: `
                <p>Create a ctc search client modal.<p>
                <p>To make this modal fully functional, add back-end logic in the configurer.</p>
            `,
            created: "23/01/2018",
            defaultParams: {
                class: 'class',
                title: 'Search Client',
                min: 1,
                wait: 500,
            },
            configurable: {
                class: 'String',
                title: 'String',
                min: 'Number',
                wait: 'Number',
            },
            mandatory: [
            ],
            createComp: function(name, params, component) {
                const newParams = {
                    types: [
                        "INDIVIDUAL",
                        "BUSINESS",
                    ],
                    configurer: {
                        getContactCountries: function() {
                            return new Promise(function(resolve, reject) {
                                window.setTimeout(function() {
                                    var data = [
                                        {
                                            label: '+61 - Australia',
                                            value: 61,
                                        },
                                        {
                                            label: '+1 - United States of America',
                                            value: 1,
                                        },
                                        {
                                            label: '+86 - China',
                                            value: 86,
                                        },
                                        {
                                            label: '+886 - Taiwan',
                                            value: 886,
                                        },
                                    ];
                                    resolve(data);
                                }, 200);
                            });
                        },
                        getContactTitles: function() {
                            return new Promise(function(resolve, reject) {
                                window.setTimeout(function() {
                                    const data = [
                                        {
                                            label: "Mr.",
                                            value: "Mr.",
                                        },
                                        {
                                            label: "Mrs.",
                                            value: "Mrs.",
                                        },
                                        {
                                            label: "Miss",
                                            value: "Miss",
                                        },
                                        {
                                            label: "Ms.",
                                            value: "Ms.",
                                        },
                                        {
                                            label: "Dr.",
                                            value: "Dr.",
                                        },
                                        {
                                            label: "Prof.",
                                            value: "Prof.",
                                        },
                                    ];
                                    resolve(data);
                                }, 200);
                            });
                        },
                        searchClients: function(searchCriteria, typeName) {
                            return new Promise((resolve, reject) => {
                                window.setTimeout(() => {
                                    const clients = [];

                                    _.times(30, n => {
                                        clients.push({
                                            id: "id-" + n,
                                            name: "Client " + n,
                                            mobile: "+61 423 456 7" + _.padStart(n, 2, '0'),
                                            phone: "+61 2 1111 11" + _.padStart(n, 2, '0'),
                                            email: "email" + n + "@gmail.com",
                                        });
                                    });

                                    resolve(clients.filter(client => {
                                        if(searchCriteria.contactNumber) {
                                            if( _.toString(searchCriteria.contactNumber) !== _.toString(client.mobile) &&
                                                _.toString(searchCriteria.contactNumber) !== _.toString(client.phone)) {
                                                return false;
                                            }
                                        }

                                        return true;
                                    }));
                                }, 200);
                            });
                        },
                        onClickClientName: function(client) {
                            console.log(client.name + " is clicked on");
                        },
                        selectClient: function(client, typeName) {
                            return new Promise((resolve, reject) => {
                                window.setTimeout(() => {
                                    resolve(client);
                                }, 200);
                            });
                        },
                        createClient: function(newClient, typeName) {
                            return new Promise((resolve, reject) => {
                                window.setTimeout(() => {
                                    resolve({
                                        id: "newClient",
                                        name: newClient.firstName + " " + newClient.lastName,
                                        mobile: newClient.mobile,
                                        phone: newClient.homePhone,
                                        email: newClient.email,
                                    });
                                }, 200);
                            });
                        },
                    },
                    onSelectClient: component.getReference("c.trigger"),
                };
                const div = fromXml(`
                    <div>
                        <${name} ${spreadParams(params)}/>
                        <c:button variant="primary" label="Search Client" name="searchClient" onclick="{! c.trigger }"/>
                        <c:button variant="secondary" label="Search Solicitor" name="searchSolicitor" onclick="{! c.trigger }"/>
                    </div>
                    `, component);
                div.children.body[0].assign(newParams);
                return div;
            },
            onTrigger: function(name, params, createdComp, event) {
                if(event.getSource().isInstanceOf(window.$Config.getNamespace() + ":button")) {
                    const modal = createdComp.get("v.body")[0];
                    var buttonName = event.getSource().get("v.name");
                    switch(buttonName) {
                        case 'searchClient':
                            modal.set("v.types", [
                                "INDIVIDUAL",
                                "BUSINESS",
                            ]);
                            break;
                        case 'searchSolicitor':
                            modal.set("v.types", [
                                "SOLICITOR",
                            ]);
                            break;
                        default:
                            break;
                    }
                    modal.show();
                }
                else {
                    const data = event.getParam('data');
                    console.log("Selected client: " + data.client.name);
                }
            },
        },
        {
            name: "Select (CTC)",
            componentName: "c:select",
            description: `
                <p>Create a ctc select.<p>
                <p>Use 'options' attribute in case of dynamic options.</p>
            `,
            created: "29/12/2017",
            defaultParams: {
                name: 'name',
                value: 'value',
                variant: 'standard',
                disabled: false,
                readonly: false,
                required: false,
                class: 'class',
                title: 'title',
                label: 'Select',
                tooltip: "",
                dataProducer: '',
            },
            configurable: {
                variant: [
                    "standard",
                    "label-hidden",
                ],
                disabled: 'Boolean',
                readonly: 'Boolean',
                required: 'Boolean',
                class: 'String',
                label: 'String',
                tooltip: "String",
                dataProducer: "dataProducer:dataProducers",
            },
            mandatory: [
                "name",
                "label",
            ],
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                </${name}>
                `;
            },
        },
        {
            name: "Slider (Lightning)",
            componentName: "lightning:slider",
            description: "Create a lightning slider.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                value: 0,
                min: 0,
                max: 100,
                step: 1,
                size: "medium",
                type: "horizontal",
                label: "Slider",
                disabled: false,
                variant: 'standard',
            },
            configurable: {
                class: 'String',
                value: 'Number',
                min: 'Number',
                max: 'Number',
                step: 'Number',
                size: [
                    "x-small",
                    "small",
                    "medium",
                    "large",
                ],
                type: [
                    "horizontal",
                ],
                label: 'String',
                disabled: 'Boolean',
                variant: [
                    "standard",
                    "label-hidden",
                ],
            },
        },
        {
            name: "Sorting Indicator (CTC)",
            componentName: "c:sortingIndicator",
            description: "Create a ctc sorting indicator.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                variant: 'default',
                sortable: true,
                active: false,
                direction: "desc",
                name: "sort",
            },
            configurable: {
                class: 'String',
                title: 'String',
                variant: [
                    "default",
                    "control",
                ],
                sortable: "Boolean",
                active: "Boolean",
                direction: [
                    "asc",
                    "desc",
                ],
                name: "String",
            },
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)} onsort="{! c.trigger }">
                    Sortable
                </${name}>
                `;
            },
            onTrigger: function(name, params, createdComp, event) {
                const data = event.getParam("data");
                window.alert(`Request to sort [${data.name}] in direction [${data.direction}]`);
            },
        },
        {
            name: "Spinner (Lightning)",
            componentName: "lightning:spinner",
            description: "Create a lightning spinner.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                size: 'medium',
                variant: 'base',
                alternativeText: '',
            },
            configurable: {
                class: 'String',
                size: [
                    "small",
                    "medium",
                    "large",
                ],
                variant: [
                    "base",
                    "brand",
                    "inverse",
                ],
            },
        },
        {
            name: "Spinner (CTC)",
            componentName: "c:spinner",
            description: "Create a ctc spinner.",
            created: "20/01/2018",
            defaultParams: {
                class: 'class',
                title: 'title',
                size: 'medium',
                variant: 'base',
                timing: '',
                container: 'with',
                alternativeText: 'Alternative Text',
                text: 'Text',
            },
            configurable: {
                class: 'String',
                size: [
                    "xx-small",
                    "x-small",
                    "small",
                    "medium",
                    "large",
                ],
                variant: [
                    "base",
                    "brand",
                    "inverse",
                ],
                timing: [
                    "",
                    "delayed",
                ],
                container: [
                    "without",
                    "with",
                    "with_fixed",
                ],
                text: 'String',
            },
            createComp: function(name, params) {
                return `
                <div class="slds-box slds-theme_shade" style="height: 80px; position: relative;">
                    <${name} ${spreadParams(params)}>
                    </${name}>
                </div>
                `;
            },
        },
        {
            name: "Suggestion Box (CTC)",
            componentName: "c:suggestionBox",
            description: "Create a ctc suggestion box.",
            created: "19/01/2018",
            defaultParams: {
                name: 'name',
                variant: 'standard',
                class: 'class',
                title: 'title',
                disabled: false,
                readonly: false,
                required: false,
                label: 'Suggestion Box',
                placeholder: '',
                cache: false,
                wait: 50,
                minlength: 3,
                limit: 5,
                tooltip: "",
                iconName: "",
                messageWhenNotFound: 'No results found',
                popupClass: '',
            },
            configurable: {
                variant: [
                    "standard",
                    "label-hidden",
                ],
                class: 'String',
                disabled: 'Boolean',
                readonly: 'Boolean',
                required: 'Boolean',
                label: 'String',
                placeholder: 'String',
                cache: 'Boolean',
                wait: 'Number',
                minlength: 'Number',
                limit: 'Number',
                tooltip: "String",
                iconName: "Icon",
                messageWhenNotFound: 'String',
                popupClass: 'String',
            },
            mandatory: [
                "name",
                "label",
            ],
            createComp: function(name, params) {
                const newParams = {
                    getSuggestions: function(value) {
                        return new Promise((resolve, reject) => {
                            window.setTimeout(() => {
                                const suggestions = [];
                                _.times(500, n => {
                                    suggestions.push({
                                        id: "" + n,
                                        value: "Item " + n,
                                        iconName: _.random() === 1 ? "ctc-utility:info_info" : null, // optional
                                        iconContainer: "default", // optional
                                        description: _.random() === 1 ? "Description" : null, // optional
                                    });
                                });
                                resolve(suggestions);
                            }, 100);
                        });
                    },
                };
                return fromXml(`<${name} ${spreadParams(params)}/>`).
                    assign(newParams);
            },
        },
        {
            name: "Switch (CTC)",
            componentName: "c:switch",
            description: "Create a ctc switch.",
            created: "17/12/2017",
            defaultParams: {
                'case': 'one',
            },
            configurable: {
                'case': [
                    "one",
                    "two",
                ],
            },
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    <c:case name="one">
                        This is case one.
                    </c:case>
                    <c:case name="two">
                        This is case two.
                    </c:case>
                </${name}>
                `;
            },
        },
        {
            name: "Tab (Lightning)",
            componentName: "lightning:tab",
            description: "Create a lightning tab.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                id: 'id',
                label: 'Tab Label',
            },
            configurable: {
                class: 'String',
                label: 'String',
            },
            createComp: function(name, params) {
                return window.$Utils.comp("lightning:tabset", {}, {
                    body: [
                        window.$Utils.comp(name, _.assign({}, _.omit(params, ["label"]), {
                        }), {
                            label: [
                                window.$Utils.compText(params.label || "Tab Label", true),
                            ],
                            body: [
                                window.$Utils.compText("Content", true),
                            ],
                        }, true),
                        window.$Utils.comp("lightning:tab", {
                        }, {
                            label: [
                                window.$Utils.compText("Tab Two", true),
                            ],
                            body: [
                                window.$Utils.compText("Other content", true),
                            ],
                        }, true),
                    ],
                });
            },
        },
        {
            name: "Tabset (Lightning)",
            componentName: "lightning:tabset",
            description: "Create a lightning tabset.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                variant: 'default',
                selectedTabId: '',
            },
            configurable: {
                class: 'String',
                variant: [
                    "default",
                    "scoped",
                    "vertical",
                ],
            },
            createComp: function(name, params) {
                return window.$Utils.comp(name, params, {
                    body: [
                        window.$Utils.comp("lightning:tab", {
                        }, {
                            label: [
                                window.$Utils.compText("Tab One", true),
                            ],
                            body: [
                                window.$Utils.compText("Content", true),
                            ],
                        }, true),
                        window.$Utils.comp("lightning:tab", {
                        }, {
                            label: [
                                window.$Utils.compText("Tab Two", true),
                            ],
                            body: [
                                window.$Utils.compText("Other content", true),
                            ],
                        }, true),
                    ],
                });
            },
        },
        {
            name: "Tabset (CTC)",
            componentName: "c:tabset",
            description: "Create a ctc tabset.",
            created: "21/01/2018",
            requires: [
                "There is a known issue when using aura:if to toggle visibility of the tabset. Please use css display to control visibility instead of dom creating/destroying.",
            ],
            defaultParams: {
                class: 'class',
                title: 'title',
                variant: 'default',
                selectedTabId: '',
            },
            configurable: {
                class: 'String',
                variant: [
                    "default",
                    "scoped",
                    "vertical",
                ],
            },
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    <c:tab tooltip="Tooltip">
                        <aura:set attribute="label">
                            Tab One
                        </aura:set>
                        Content
                    </c:tab>
                    <c:tab disabled="true">
                        <aura:set attribute="label">
                            Tab Two
                        </aura:set>
                        Other Content
                    </c:tab>
                    <c:tab>
                        <aura:set attribute="label">
                            Tab Three
                        </aura:set>
                        Other Content
                    </c:tab>
                </${name}>
                `;
            },
        },
        {
            name: "Table (CTC)",
            componentName: "c:table",
            description: "Create a ctc table.",
            created: "23/01/2018",
            requires: [
                "Set the attributes in order: providers(optional), headerRowConfig, rowConfig, headerRow, rows.",
            ],
            defaultParams: {
                class: 'class',
                title: 'title',
                variant: 'striped',
                checkable: false,
                select: 'multiple',
                resizable: false,
            },
            configurable: {
                class: 'String',
                variant: [
                    "default",
                    "striped",
                ],
                checkable: 'Boolean',
                select: [
                    "single",
                    "multiple",
                ],
                resizable: 'Boolean',
            },
            mandatory: [
                "name",
                "headerRowConfig",
                "rowConfig",
                "headerRow",
                "rows",
            ],
            createComp: function(name, params, component) {
                const names = ["Wilson", "Adam", "Sabrina", "Green", "Henry", "Anping", "Surya"];
                const jobs = ["Front End Developer", "Back End Developer", "QA", "BA"];
                const rows = [];
                _.times(300, n => {
                    rows.push({
                        id: "row_" + n,
                        name: _.sample(names),
                        age: _.random(20, 40),
                        job: _.sample(jobs),
                        saving: _.random(10000, 2000000),
                        date: Date.now(),
                        married: _.random() === 1,
                    });
                });
                const newParams = {
                    rows,
                    rowConfig: [
                        {
                            name: "name",
                            type: "String",
                        },
                        {
                            name: "age",
                            type: "Number",
                        },
                        {
                            name: "job",
                            type: "String",
                        },
                        {
                            name: "saving",
                            type: "Currency",
                        },
                        {
                            name: "date",
                            type: "Date",
                        },
                        {
                            name: "married",
                            type: "Boolean",
                            mode: "editable",
                            triggerRefresh: true,
                        },
                        {
                            name: "action",
                            template: function(params, providers) {
                                const row = params.object;
                                if(row && !row.married) {
                                    return `<c:button variant="primary" name="expand" label="{! v.object.uiState.buttonLabel }"/>`;
                                }
                                else {
                                    return `Secret`;
                                }
                            },
                        },
                    ],
                    headerRow: {
                        name: "Name",
                        age: "Age",
                        job: "Job",
                        saving: "Saving",
                        date: "Date",
                        married: "Married",
                    },
                    headerRowConfig: [
                        {
                            name: "name",
                            type: "String",
                            sortable: true,
                        },
                        {
                            name: "age",
                            type: "String",
                            sortable: true,
                        },
                        {
                            name: "job",
                            type: "String",
                            sortable: true,
                        },
                        {
                            name: "saving",
                            type: "String",
                            sortable: true,
                        },
                        {
                            name: "date",
                            type: "String",
                        },
                        {
                            name: "married",
                            type: "String",
                        },
                        {
                            name: "action",
                            template: `
                            <div>
                                <c:button aura:id="filter" variant="tertiary" name="filter" label="Filter" onclick="{! cmp.c.trigger }"/>
                                <c:button variant="tertiary" name="refresh" label="Refresh" onclick="{! cmp.c.trigger }"/>
                            </div>
                            `,
                        },
                    ],
                    expanderConfig: {
                        name: "more",
                        template: `
                        <div class="slds-m-around_xx-large">
                            Expanded section for <span>{! v.object.name }</span>
                        </div>
                        `,
                    },
                    providers: {
                        cmp: component,
                    },
                    configurer: {
                        refreshRow: function(row) {
                            row.uiState = row.uiState || {};
                            row.uiState.buttonLabel = row.$expanded ? "Collapse" : "Expand";
                        },
                    },
                    paginatorName: "demo",
                    name: "demoTable",
                    onRowEvent: component.getReference("c.trigger"),
                };
                const root = fromXml(`
                    <div>
                        <${name} ${spreadParams(params)}/>
                        <div class="slds-m-top_large slds-grid">
                            <c:paginator variant="default" name="demo" tableName="demoTable" pageSize="5" current="1"/>
                            <c:button class="slds-col_bump-left" label="Find By Id" name="find" onclick="{! c.trigger }"/>
                            <c:button label="Fewer Cols" name="fewerCols" onclick="{! c.trigger }"/>
                            <c:button label="New Data" name="newData" onclick="{! c.trigger }"/>
                        </div>
                    </div>
                `, component);
                root.children.body[0].assign(newParams);
                return root;
            },
            afterRender: function(newComp) {
                const table = newComp.get("v.body")[0];
                table.sortBy("name", "asc");
            },
            onTrigger: function(name, params, createdComp, event, cmp) {
                const table = createdComp.get("v.body")[0];
                // const rows = table.get("v.rows");
                if(event.getName() === 'onRowEvent') {
                    const data = event.getParam('data');
                    const buttonName = data.event.getSource().get("v.name");
                    switch(buttonName) {
                        case 'expand':
                            const row = data.selection.getClickedRow();
                            if(row) {
                                table.setExpanded(row, !row.$expanded);
                            }
                            break;
                        default:
                            break;
                    }
                }
                else {
                    const buttonName = event.getSource().get("v.name");
                    switch(buttonName) {
                        case 'filter':
                            if(table.isFiltered()) {
                                table.filter(null);
                            }
                            else {
                                table.filter(function(item) {
                                    return item.name === "Wilson";
                                });
                            }
                            break;
                        case 'refresh':
                            table.refresh();
                            break;
                        case 'find':
                            const items = window.$Utils.findById(cmp, "filter");
                            console.log(items);
                            break;
                        case 'fewerCols':
                            table.set("v.headerRowConfig", [
                                {
                                    name: "name",
                                    type: "String",
                                    sortable: true,
                                },
                                {
                                    name: "age",
                                    type: "String",
                                },
                                {
                                    name: "job",
                                    type: "String",
                                },
                            ]);
                            table.set("v.rowConfig", [
                                {
                                    name: "name",
                                    type: "String",
                                },
                                {
                                    name: "age",
                                    type: "Number",
                                },
                                {
                                    name: "job",
                                    type: "String",
                                },
                            ]);
                            table.refreshTable();
                            break;
                        case 'newData':
                            const rows = [];
                            _.times(3, n => {
                                rows.push({
                                    id: "row_" + n,
                                    name: "New Person",
                                    age: _.random(20, 40),
                                    job: "N/A",
                                    saving: _.random(10000, 2000000),
                                    date: Date.now(),
                                    married: _.random() === 1,
                                });
                            });
                            table.set("v.rows", rows);
                            break;
                        default:
                            break;
                    }
                }
            },
        },
        {
            name: "Tags Input (CTC)",
            componentName: "c:tagsInput",
            description: "Create a ctc tags input.",
            created: "01/02/2018",
            defaultParams: {
                name: 'name',
                variant: 'standard',
                class: 'class',
                title: 'title',
                disabled: false,
                readonly: false,
                required: false,
                label: 'Tags Input',
                placeholder: '',
                style: 'below',
                cache: false,
                wait: 50,
                minlength: 3,
                limit: 5,
                tooltip: "",
                iconNameLeft: '',
                iconNameRight: '',
                messageWhenNotFound: 'No results found',
                popupClass: '',
            },
            configurable: {
                variant: [
                    "standard",
                    "label-hidden",
                ],
                class: 'String',
                disabled: 'Boolean',
                readonly: 'Boolean',
                required: 'Boolean',
                label: 'String',
                placeholder: 'String',
                style: [
                    'below',
                    'inside',
                ],
                cache: 'Boolean',
                wait: 'Number',
                minlength: 'Number',
                limit: 'Number',
                tooltip: "String",
                iconNameLeft: 'Icon',
                iconNameRight: 'Icon',
                messageWhenNotFound: 'String',
                popupClass: 'String',
            },
            mandatory: [
                "name",
                "label",
            ],
            createComp: function(name, params) {
                const newParams = {
                    getTags: function(value) {
                        return new Promise((resolve, reject) => {
                            window.setTimeout(() => {
                                const suggestions = [];
                                _.times(50, n => {
                                    suggestions.push({
                                        label: `Tag ${n}`,
                                        value: `Tag ${n}`,
                                    });
                                });
                                resolve(suggestions);
                            }, 100);
                        });
                    },
                };
                return fromXml(`<${name} ${spreadParams(params)}/>`).
                    assign(newParams);
            },
        },
        {
            name: "Template Creator (CTC)",
            componentName: "c:templateCreator",
            description: "Create a ctc template creator.",
            created: "07/01/2018",
            defaultParams: {
            },
            configurable: {
            },
            mandatory: [
                "template",
            ],
            createComp: function(name, params) {
                const newParams = {
                    template: `
                    <c:button variant="primary" label="{! v.object.buttonLabel }"/>
                    `,
                    object: {
                        name: "Wilson",
                        items: [1, 2, 3],
                        buttonLabel: "Click",
                    },
                };
                return fromXml(`<${name} ${spreadParams(params)}/>`).
                    assign(newParams);
            },
        },
        {
            name: "Textarea (Lightning)",
            componentName: "lightning:textarea",
            description: "Create a lightning textarea.",
            created: "01/12/2017",
            defaultParams: {
                name: 'name',
                value: '',
                variant: 'standard',
                class: 'class',
                title: 'title',
                disabled: false,
                readonly: false,
                required: false,
                label: 'Textarea',
                placeholder: '',
                maxlength: 100,
            },
            configurable: {
                variant: [
                    "standard",
                    "label-hidden",
                ],
                class: 'String',
                disabled: 'Boolean',
                readonly: 'Boolean',
                required: 'Boolean',
                label: 'String',
                placeholder: 'String',
                maxlength: 'Number',
            },
            mandatory: [
                "name",
                "label",
            ],
        },
        {
            name: "Textarea (CTC)",
            componentName: "c:textarea",
            description: "Create a ctc textarea.",
            created: "01/12/2017",
            defaultParams: {
                name: 'name',
                value: '',
                variant: 'standard',
                class: 'class',
                title: 'title',
                disabled: false,
                readonly: false,
                required: false,
                label: 'Textarea',
                placeholder: '',
                maxlength: 100,
                tooltip: '',
            },
            configurable: {
                variant: [
                    "standard",
                    "label-hidden",
                ],
                class: 'String',
                disabled: 'Boolean',
                readonly: 'Boolean',
                required: 'Boolean',
                label: 'String',
                placeholder: 'String',
                maxlength: 'Number',
                tooltip: 'String',
            },
            mandatory: [
                "name",
                "label",
            ],
        },
        {
            name: "Tile (Lightning)",
            componentName: "lightning:tile",
            description: "Create a lightning tile.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                label: 'Tile',
                href: '',
            },
            configurable: {
                class: 'String',
                label: 'String',
                href: 'String',
            },
            mandatory: [
                "label",
            ],
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    <aura:set attribute="media">
                        <lightning:icon
                            iconName="standard:account"
                            alternativeText="Account"
                        />
                    </aura:set>
                    This is a text.
                </${name}>
                `;
            },
        },
        {
            name: "Tile (CTC)",
            componentName: "c:tile",
            description: "Create a ctc tile.",
            created: "17/01/2018",
            defaultParams: {
                class: 'class',
                title: 'title',
                label: 'Tile',
                href: '',
            },
            configurable: {
                class: 'String',
                label: 'String',
                href: 'String',
            },
            mandatory: [
                "label",
            ],
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    <aura:set attribute="media">
                        <c:icon
                            iconName="standard:account"
                            alternativeText="Account"
                        />
                    </aura:set>
                    This is a text.
                </${name}>
                `;
            },
        },
        {
            name: "Time Picker (CTC)",
            componentName: "c:timePicker",
            description: "Create a ctc time picker.",
            created: "19/01/2018",
            defaultParams: {
                name: 'name',
                variant: 'standard',
                class: 'class',
                title: 'title',
                disabled: false,
                readonly: false,
                required: false,
                label: 'Time Picker',
                placeholder: '',
                tooltip: '',
                popupClass: '',
            },
            configurable: {
                variant: [
                    "standard",
                    "label-hidden",
                ],
                class: 'String',
                disabled: 'Boolean',
                readonly: 'Boolean',
                required: 'Boolean',
                label: 'String',
                placeholder: 'String',
                tooltip: 'String',
                popupClass: 'String',
            },
            mandatory: [
                "name",
                "label",
            ],
        },
        {
            name: "Toast (CTC)",
            componentName: "c:toast",
            description: "Create a ctc toast.",
            created: "01/12/2017",
            defaultParams: {
                variant: "info",
                position: "fixed",
                content: "Example Toast",
            },
            configurable: {
                position: [
                    "fixed",
                    "fixed-one",
                    "relative",
                ],
                variant: [
                    "info",
                    "success",
                    "warning",
                    "error",
                ],
                content: "String",
            },
            createComp: function(name, params) {
                return `
                <c:button variant="primary" label="Show Toast" onclick="{! c.trigger }"/>
                `;
            },
            onTrigger: function(name, params) {
                window.$Utils.getCurrentApp().toast(params);
            },
        },
        {
            name: "Tree (Lightning)",
            componentName: "lightning:tree",
            description: "Create a lightning tree.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                header: 'Tree',
            },
            configurable: {
                class: 'String',
                header: 'String',
            },
            createComp: function(name, params) {
                const newParams = {
                    items: [
                        {
                            label: "Item 1",
                            name: "1",
                            expanded: true,
                            items: [
                                {
                                    label: "Item 2",
                                    name: "2",
                                    expanded: false,
                                    items: [
                                    ],
                                },
                                {
                                    label: "Item 3",
                                    name: "3",
                                    expanded: false,
                                    items: [
                                    ],
                                },
                            ],
                        },
                    ],
                };
                return fromXml(`<${name} ${spreadParams(params)}/>`).
                    assign(newParams);
            },
        },
        {
            name: "Vertical Navigation (Lightning)",
            componentName: "lightning:verticalNavigation",
            description: "Create a lightning vertical navigation.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                compact: false,
                selectedItem: '',
                shaded: false,
            },
            configurable: {
                class: 'String',
                compact: 'Boolean',
                shaded: 'Boolean',
            },
            createComp: function(name, params) {
                return `
                <${name} ${spreadParams(params)}>
                    <lightning:verticalNavigationSection label="Reports">
                        <lightning:verticalNavigationItem label="Recent" name="recent"/>
                        <lightning:verticalNavigationItem label="All" name="all"/>
                    </lightning:verticalNavigationSection>
                </${name}>
                `;
            },
        },
        {
            name: "Vertical Navigation Item (Lightning)",
            componentName: "lightning:verticalNavigationItem",
            description: "Create a lightning vertical navigation item.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                label: 'Item',
                name: 'name',
                href: '',
            },
            configurable: {
                class: 'String',
                label: 'String',
                href: 'String',
            },
            mandatory: [
                "label",
                "name",
            ],
            createComp: function(name, params) {
                return `
                <lightning:verticalNavigation>
                    <lightning:verticalNavigationSection label="Reports">
                        <lightning:verticalNavigationItem ${spreadParams(params)}/>
                        <lightning:verticalNavigationItem label="All" name="all"/>
                    </lightning:verticalNavigationSection>
                </lightning:verticalNavigation>
                `;
            },
        },
        {
            name: "Vertical Navigation Item Badge (Lightning)",
            componentName: "lightning:verticalNavigationItemBadge",
            description: "Create a lightning vertical navigation item badge.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                label: 'Item Badge',
                name: 'name',
                href: '',
                badgeCount: 3,
                assistiveText: '',
            },
            configurable: {
                class: 'String',
                label: 'String',
                href: 'String',
                badgeCount: 'Number',
            },
            mandatory: [
                "label",
                "name",
            ],
            createComp: function(name, params) {
                return `
                <lightning:verticalNavigation>
                    <lightning:verticalNavigationSection label="Reports">
                        <${name} ${spreadParams(params)}/>
                        <lightning:verticalNavigationItem label="All" name="all"/>
                    </lightning:verticalNavigationSection>
                </lightning:verticalNavigation>
                `;
            },
        },
        {
            name: "Vertical Navigation Item Icon (Lightning)",
            componentName: "lightning:verticalNavigationItemIcon",
            description: "Create a lightning vertical navigation item icon.",
            created: "01/12/2017",
            defaultParams: {
                class: 'class',
                title: 'title',
                label: 'Item Badge',
                name: 'name',
                href: '',
                iconName: 'utility:clock',
            },
            configurable: {
                class: 'String',
                label: 'String',
                href: 'String',
                iconName: 'String',
            },
            mandatory: [
                "label",
                "name",
            ],
            createComp: function(name, params) {
                return `
                <lightning:verticalNavigation>
                    <lightning:verticalNavigationSection label="Reports">
                        <${name} ${spreadParams(params)}/>
                        <lightning:verticalNavigationItem label="All" name="all"/>
                    </lightning:verticalNavigationSection>
                </lightning:verticalNavigation>
                `;
            },
        },
    ];
})(window);
