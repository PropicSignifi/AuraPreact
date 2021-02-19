({
    generatePlaceholder: function(cmp) {
        var name = cmp.get('v.name');
        var opacity = cmp.get('v.opacity');

        var container = document.createElement('div');
        var prefix = 'template_';

        var concreteHelper = this;

        name = concreteHelper[prefix + name] ? name : 'related';
        var templateFn = concreteHelper[prefix + name];

        container.className = 'placeholder ' + name + ' ' + this.getOpacityClass(opacity);
        container.innerHTML = templateFn.apply(this);
        return container;
    },

    isFiniteNumber: function(value) {
        return typeof value === "number" && isFinite(value);
    },

    getOpacityClass: function(opacity) {
        opacity = parseInt(opacity, 10);
        if (!this.isFiniteNumber(opacity)) {
            return '';
        }

        opacity = (opacity < 0) ? 0 : opacity;

        opacity = Math.round(opacity * 20) / 20;

        if (opacity >= 1) {
            return '';
        }

        return 'opacity' + (opacity * 100);
    },

    times: function(n, tmpl) {
        var list = [];
        for (var i = 0; i < n; i++) {
            list.push(tmpl);
        }
        return list.join('');
    },

    field: function(primaryClass, secondaryClass, fieldClass) {
        primaryClass = primaryClass || '';
        secondaryClass = secondaryClass || '';
        fieldClass = fieldClass || '';
        return [
            '<div class="field ' + fieldClass + '">',
            '<div class="text text-primary ' + primaryClass + '"></div>',
            '<div class="text text-secondary ' + secondaryClass + '"></div>',
            '</div>'
        ].join('');
    },

    template_highlight: function() {
        return [
            '<div class="anchor dark">',
            '<div class="icon icon-large"></div>',
            '<div class="text-body">',
            '<div class="text text-medium text-primary"></div>',
            '<div class="text text-long text-thinner text-secondary"></div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_group_highlight: function() {
        return [
            '<div class="anchor dark">',
            '<div class="container">',
            '<div class="icon icon-xhuge"></div>',
            '<div class="text-body">',
            '<div class="text text-shorter text-thick text-primary"></div>',
            '<div class="text text-short text-secondary"></div>',
            '</div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_record_home_anchor_vertical: function() {
        return [
            '<div class="body dark">',
            '<div>',
            '<div class="icon icon-medium"></div>',
            '<div class="text-body">',
            '<div class="text text-thick text-long"></div>',
            '</div>',
            '</div>',
            '<div class="below-text-body">',
            '<div class="button button-small"></div>',
            '<div class="button button-full-width-small"></div>',
            '</div>',
            '<div class="p-top--small below-text-body">',
            this.times(3,
                [
                    '<div class="text-body p-bottom--small">',
                    '<div class="text text-long"></div>',
                    '<div class="multi-text-line">',
                    '<div class="text text-medium"></div>',
                    '<div class="text text-tiny"></div>',
                    '</div>',
                    '</div>',
                    '<div class="text-body p-bottom-small">',
                    '</div>'
                ].join('')),
            '<div class="text-body">',
            '<div class="text text-long"></div>',
            '<div class="multi-text-line">',
            '<div class="text text-medium"></div>',
            '<div class="text text-tiny"></div>',
            '</div>',
            '</div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_detail: function() {
        return [
            '<div class="left-column">',
            this.times(7,
                this.field('text-shorter text-thin',
                    'text-medium text-thin',
                    'border-bottom')),
            '</div>',
            '<div class="right-column">',
            this.times(6,
                this.field('text-shorter text-thin',
                    'text-medium text-thin',
                    'border-bottom')),
            '</div>'
        ].join('');
    },

    template_related: function() {
        var tmpl = [
            '<div class="card flex-grid flex-v-center">',
            '<div class="icon icon-square "></div>',
            '<div class="field flex-grow">',
            '<div class="text text-long text-thin"></div>',
            '</div>',
            '</div>'
        ].join('');
        return this.times(10, tmpl);
    },

    template_relatedInPreview: function() {
        var tmpl = [
            '<div class="card flex-grid flex-v-center">',
            '<div class="icon icon-square"></div>',
            '<div class="field flex-grow">',
            '<div class="text text-long text-thin"></div>',
            '</div>',
            '</div>'
        ].join('');
        return this.times(2, tmpl);
    },

    template_list: function() {
        return [
            '<div class="anchor dark flex-grid flex-v-center">',
            '<div class="icon icon-square flex-none"></div>',
            '<div class="field flex-grow">',
            '<div class="text text-short text-thin text-primary"></div>',
            '</div>',
            '</div>',
            '<div class="body">',
            this.times(12,
                this.field('text-medium text-thinner',
                    'text-short text-thinner',
                    'border-bottom')),
            '</div>'
        ].join('');
    },

    template_list_app: function() {
        return [
            '<div class="flex-grid flex-v-center flex-h-center">',
            '<div class="field flex-grow">',
            '<div class="text text-short text-thin text-primary center"></div>',
            '</div>',
            '</div>',
            '<div class="body">',
            this.times(12,
                this.field('text-medium text-thinner',
                    'text-short text-thinner',
                    'border-bottom')),
            '</div>'
        ].join('');
    },

    template_split_view_header: function() {
        return [
            '<div class="anchor darker">',
            '<div class="flex-grid flex-v-center">',
            '<div class="icon icon-square flex-none"></div>',
            '<div class="field flex-grow">',
            '<div class="text text-short text-primary"></div>',
            '</div>',
            '</div>',
            '<div class="field darker">',
            '<div class="text text-primary text-short text-thinner"></div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_list_view_header: function() {
        return [
            '<div class="anchor">',
            '<div class="flex-grid flex-v-center">',
            '<div class="icon icon-square flex-none"></div>',
            '<div class="field flex-grow">',
            '<div class="text text-short text-primary"></div>',
            '</div>',
            '</div>',
            '<div class="field">',
            '<div class="text text-primary text-short text-thinner"></div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_list_no_header: function() {
        return [
            '<div class="body">',
            this.times(12,
                this.field('text-medium text-thinner',
                    'text-short text-thinner',
                    'border-bottom')),
            '</div>'
        ].join('');
    },

    template_listpreview: function() {
        return [
            '<div class="body">',
            this.times(2,
                this.field('text-medium text-thinner',
                    'text-short text-thinner')),
            '</div>'
        ].join('');
    },

    template_split_view: function() {
        var buildSplitViewRows = function(helper) {
            var result = [];

            for (var i = 0; i < 10; i++) {
                var opacity = 1 - i / 10;
                result.push(helper.field("text-medium text-thin", "text-short text-thinner", "border-bottom " + helper.getOpacityClass(opacity)));
            }

            return result.join('');
        };

        return [
            '<div class="body darker">',
            buildSplitViewRows(this),
            '</div>'
        ].join('');
    },

    template_feed_item: function() {
        var tmpl = [
            '<div class="card">',
            '<div class="flex-grid flex-v-center">',
            '<div class="icon icon-round-large"></div>',
            '<div class="text-body">',
            '<div class="text text-medium text-thinner"></div>',
            '<div class="text text-shorter text-thinner"></div>',
            '</div>',
            '</div>',
            '<div class="text-body">',
            '<div class="text text-medium text-thinner"></div>',
            '<div class="text text-long text-thinner"></div>',
            '<div class="text text-short text-thinner"></div>',
            '</div>',
            '<div class="actions">',
            '<div class="text text-shorter text-thinner"></div>',
            '<div class="text text-shorter text-thinner"></div>',
            '</div>',
            '</div>'
        ].join('');

        return tmpl;
    },

    template_feed: function() {
        var numberOfCards = $A.get('$Browser').isPhone ? 4 : 8;

        return this.times(numberOfCards, this.template_feed_item());
    },

    template_map: function() {
        return [
            '<div class="messagebox opacity70">',
            '<div class="message">',
            '<div class="checkin"></div>',
            $A.get('$Label.GoogleStaticMapLabels.LoadingMessage'),
            '</div>',
            '</div>'
        ].join('');
    },

    template_composer: function() {
        return [
            '<div class="flex-grid flex-grow">',
            '<div class="input flex-grow"></div>',
            '<div class="button"></div>',
            '</div>'
        ].join('');
    },

    template_composer_tabs: function() {
        return [
            '<div class="composer dark flex-grid flex-grow">',
            this.template_composer(),
            '</div>'
        ].join('');
    },

    template_path: function() {
        var buildChevron = function(helper, n) {
            return [
                '<ul class="list flex-grid">',
                helper.times(n,
                    '<li class="chevronStep"></li>'),
                '</ul>'
            ].join('');
        };

        return [
            '<div class="pathStencil flex-grid">',
            '<div class="chevron flex-grid">',
            buildChevron(this,
                5),
            '</div>',
            '<div class="chevronButton flex-grid">',
            buildChevron(this,
                1),
            '</div>',
            '</div>'
        ].join('');
    },

    template_record_home_anchor: function() {
        return [
            '<div class="body dark">',
            '<div class="icon icon-medium"></div>',
            '<div class="text-body">',
            '<div class="text text-thick text-long"></div>',
            '</div>',
            '<div class="below-text-body">',
            this.times(4,
                ['<div class="text-body">',
                    '<div class="text text-long"></div>',
                    '<div class="multi-text-line">',
                    '<div class="text text-medium"></div>',
                    '<div class="text text-tiny"></div>',
                    '</div>',
                    '</div>'].join('')),
            '</div>',
            '</div>'
        ].join('');
    },

    template_record_home_anchor_collapsed: function() {
        return [
            '<div class="body dark">',
            '<div class="icon icon-medium"></div>',
            '<div class="text-body">',
            '<div class="text text-thick text-long"></div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_preview_panel_anchor: function() {
        return [
            '<div class="body dark">',
            '<div class="icon icon-large"></div>',
            '<div class="text-body">',
            '<div class="text text-thick text-long"></div>',
            '</div>',
            '<div class="below-text-body">',
            this.times(4,
                ['<div class="text-body">',
                    '<div class="text text-long"></div>',
                    '<div class="multi-text-line">',
                    '<div class="text text-medium"></div>',
                    '<div class="text text-tiny"></div>',
                    '</div>',
                    '</div>'].join('')),
            '</div>',
            '</div>'
        ].join('');
    },

    template_related_record: function() {
        return [
            '<div class="body dark flex-grid flex-v-center">',
            '<div class="icon icon-small"></div>',
            '<div class="text-body">',
            '<div class="text text-long"></div>',
            '<div class="text text-medium"></div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_contacts: function() {
        return [
            '<div class="body dark flex-grid flex-v-center">',
            '<div class="icon icon-round-small"></div>',
            '<div class="text-body">',
            '<div class="text text-long"></div>',
            '<div class="text text-medium"></div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_files: function() {
        return [
            '<div class="body dark flex-grid flex-v-center">',
            '<div class="icon icon-small"></div>',
            '<div class="text-body">',
            '<div class="text text-long"></div>',
            '<div class="text text-medium"></div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_insights_card: function() {
        return [
            '<div class="text text-short"></div>',
            '<div class="body flex-grid flex-v-center">',
            '<div class="icon icon-small"></div>',
            '<div class="text-body">',
            '<div class="text text-long"></div>',
            '<div class="text text-short"></div>',
            '<div class="text text-medium"></div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_lead_insights_hover: function() {
        return [
            '<div class="slds-popover__header">',
            '<div class="score-container">',
            '<div class="icon icon-round-large"></div>',
            '</div>',
            '</div>',
            '<div class="slds-popover__body">',
            '<div>',
            '<div class="lead-insights-title">',
            '<div class="text text-medium text-thick"></div>',
            '</div>',
            '<div class="lead-insights-body">',
            '<div class="body flex-grid flex-v-center">',
            '<div class="icon icon-round-small"></div>',
            '<div class="text text-medium"></div>',
            '</div>',
            '<div class="body flex-grid flex-v-center opacity80">',
            '<div class="icon icon-round-small"></div>',
            '<div class="text text-medium"></div>',
            '</div>',
            '<div class="body flex-grid flex-v-center opacity55">',
            '<div class="icon icon-round-small"></div>',
            '<div class="text text-medium"></div>',
            '</div>',
            '<div class="body flex-grid flex-v-center opacity25">',
            '<div class="icon icon-round-small"></div>',
            '<div class="text text-medium"></div>',
            '</div>',
            '</div>',
            '<div class="lead-insights-footer flex-grid">',
            '<div class="button button-full-width-small"></div>',
            '<div class="button button-full-width-small"></div>',
            '</div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_lead_insights_record_home: function() {
        return [
            '<div class="card">',
            '<div class="score-container flex-grid flex-v-center slds-p-around--x-small">',
            '<div class="icon icon-round-large"></div>',
            '<div class="text text-short text-thick"></div>',
            '<div class="actions flex-grow slds-text-align--right">',
            '<div class="icon icon-small">',
            '<div class="icon icon-x-small"></div>',
            '</div>',
            '<div class="icon icon-small">',
            '<div class="icon icon-x-small"></div>',
            '</div>',
            '</div>',
            '</div>',
            '<div class="lead-insights-title">',
            '<div class="text text-medium text-thick"></div>',
            '</div>',
            '<div class="lead-insights-body">',
            '<div class="body flex-grid flex-v-center">',
            '<div class="icon icon-round-small"></div>',
            '<div class="text text-medium"></div>',
            '</div>',
            '<div class="body flex-grid flex-v-center opacity80">',
            '<div class="icon icon-round-small"></div>',
            '<div class="text text-medium"></div>',
            '</div>',
            '<div class="body flex-grid flex-v-center opacity55">',
            '<div class="icon icon-round-small"></div>',
            '<div class="text text-medium"></div>',
            '</div>',
            '<div class="body flex-grid flex-v-center opacity25">',
            '<div class="icon icon-round-small"></div>',
            '<div class="text text-medium"></div>',
            '</div>',
            '</div>',
            '<div class="lead-insights-footer flex-grid">',
            '<div class="button button-full-width-small"></div>',
            '<div class="button button-full-width-small"></div>',
            '</div>',
            '</div>',
        ].join('');
    },

    template_assistant_card: function() {
        return [
            '<div class="body flex-grid flex-v-center">',
            '<div class="icon icon-small"></div>',
            '<div class="text-body">',
            '<div class="text text-long"></div>',
            '<div class="text text-short"></div>',
            '<div class="text text-medium"></div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_notes_products_generic: function() {
        return [
            '<div class="body dark">',
            '<div class="text-body-no-col">',
            '<div class="text text-long"></div>',
            '</div>',
            '<div class="text-body-no-col">',
            '<div class="text text-short"></div>',
            '</div>',
            '<div class="text-body-col">',
            '<div class="text text-medium"></div>',
            '<div class="text text-tiny"></div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_notes_products_generic_alt: function() {
        return [
            '<div class="body">',
            '<div class="text-body-no-col">',
            '<div class="text text-long"></div>',
            '</div>',
            '<div class="text-body-no-col">',
            '<div class="text text-short"></div>',
            '</div>',
            '<div class="text-body-col">',
            '<div class="text text-medium"></div>',
            '<div class="text text-tiny"></div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_activity_discussion: function() {
        return [
            '<div class="body flex-grid">',
            '<div class="icon icon-small"></div>',
            '<div class="text-body">',
            '<div class="text text-long text-thick"></div>',
            '<div class="text-body-no-col">',
            '<div class="text text-medium"></div>',
            '<div class="text text-tiny"></div>',
            '</div>',
            '<div class="text-body-no-col">',
            '<div class="text text-short"></div>',
            '<div class="text text-short"></div>',
            '</div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_activity_expand: function() {
        return [
            '<div class="body flex-grid">',
            '<div class="text-body">',
            '<div class="text text-long text-thick"></div>',
            '<div class="text-body-no-col">',
            '<div class="text text-medium"></div>',
            '<div class="text text-tiny"></div>',
            '</div>',
            '<div class="text-body-no-col">',
            '<div class="text text-short"></div>',
            '<div class="text text-short"></div>',
            '</div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_activity_composer: function() {
        return [
            '<div class="placeholder detail">',
            '<div class="left-column">',
            this.times(3,
                this.field('text-shorter text-thin',
                    'text-medium text-thin',
                    'border-bottom')),
            '</div>',
            '<div class="right-column">',
            this.times(3,
                this.field('text-shorter text-thin',
                    'text-medium text-thin',
                    'border-bottom')),
            '</div>',
            '</div>'
        ].join('');
    },

    template_activity_composer_small: function() {
        return [
            '<div class="placeholder detail">',
            '<div class="">',
            this.times(3,
                this.field('text-shorter text-thin',
                    'text-medium text-thin',
                    'border-bottom')),
            '</div>',
            '</div>'
        ].join('');
    },

    template_object_home_list_anchor_alt: function() {
        return [
            '<div class="body dark">',
            '<div class="text-body-no-col">',
            '<div class="text text-shorter"></div>',
            '</div>',
            '<div class="text-body-no-col">',
            '<div class="text text-medium"></div>',
            '</div>',
            '<div class="text-body-col">',
            '<div class="text text-shorter"></div>',
            '<div class="text text-tiny"></div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_object_home_list_anchor: function() {
        return [
            '<div class="body dark">',
            '<div class="entity">',
            '<div class="text text-shorter"></div>',
            '</div>',
            '<div class="title">',
            '<div class="text text-medium text-thick"></div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_object_home_list_summary: function() {
        return [
            '<div class="body dark">',
            '<div class="text-body-col">',
            '<div class="text text-tiny"></div>',
            '<div class="text text-tiny"></div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_table_list_line_item: function() {
        return [
            '<div class="body border-bottom">',
            '<div class="text-body-col">',
            this.times(5,
                '<div class="text text-short"></div>'),
            '</div>',
            '</div>'
        ].join('');
    },

    template_event_card: function() {
        return [
            '<div class="body flex-grid">',
            '<div class="icon icon-small"></div>',
            '<div class="text-body">',
            '<div class="text-body">',
            '<div class="text text-thick text-long"></div>',
            '</div>',
            '<div class="text-body-no-col">',
            '<div class="text text-medium"></div>',
            '<div class="text text-tiny"></div>',
            '</div>',
            '<div class="text-body-no-col">',
            '<div class="text text-short"></div>',
            '<div class="text text-short"></div>',
            '</div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_top_deals: function() {
        return [
            '<div class="body">',
            '<div class="icon icon-small"></div>',
            '<div class="text-body">',
            '<div class="text-body-no-col">',
            '<div class="text text-long"></div>',
            '<div class="text text-short"></div>',
            '<div class="text text-medium"></div>',
            '</div>',
            '<div class="text-body-no-col">',
            '<div class="text text-medium"></div>',
            '<div class="text text-short"></div>',
            '</div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_recent_records: function() {
        return [
            '<div class="body flex-grid flex-v-center">',
            '<div class="icon icon-small"></div>',
            '<div class="text-body">',
            '<div class="text-body-col">',
            '<div class="text text-long"></div>',
            '<div class="text text-short"></div>',
            '</div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_stencil_account_news: function() {
        return [
            '<div class="body flex-grid">',
            '<div class="image flex-none">',
            '<div class="image-block image-mega flex-grid flex-v-center flex-h-center card">',
            '<div class="image-icon"><svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52"><path fill="#eef1f6" d="m50 10c0-2.2-1.8-4-4-4h-40c-2.2 0-4 1.8-4 4v32c0 2.2 1.8 4 4 4h40c2.2 0 4-1.8 4-4v-32z m-10.4 28h-29c-1.2 0-1.9-1.3-1.3-2.3l8.8-15.3c0.4-0.7 1.3-0.7 1.7 0l5.3 9.1c0.4 0.6 1.3 0.7 1.7 0.1l4.3-6.2c0.4-0.6 1.3-0.6 1.7 0l7.9 12.6c0.6 0.9 0 2-1.1 2z m-2.6-18c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"></path></svg></div>',
            '</div>',
            '</div>',
            '<div class="flex-grow">',
            '<div class="text-body-no-col title">',
            '<div class="text text-medium"></div>',
            '</div>',
            '<div class="text-body-no-col">',
            '<div class="text text-long"></div>',
            '<div class="text text-long"></div>',
            '<div class="text text-medium"></div>',
            '</div>',
            '<div class="text-body-col">',
            '<div class="text text-tiny"></div>',
            '<div class="text text-tiny"></div>',
            '</div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_stencil_account_news_compact: function() {
        return [
            '<div class="body">',
            '<div>',
            '<div class="text-body-col">',
            '<div class="text text-medium"></div>',
            '</div>',
            '</div>',
            '<div class="image">',
            '<div class="image-block image-mega flex-grid flex-h-center flex-v-center card">',
            '<div class="image-icon"><svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52"><path fill="#eef1f6" d="m50 10c0-2.2-1.8-4-4-4h-40c-2.2 0-4 1.8-4 4v32c0 2.2 1.8 4 4 4h40c2.2 0 4-1.8 4-4v-32z m-10.4 28h-29c-1.2 0-1.9-1.3-1.3-2.3l8.8-15.3c0.4-0.7 1.3-0.7 1.7 0l5.3 9.1c0.4 0.6 1.3 0.7 1.7 0.1l4.3-6.2c0.4-0.6 1.3-0.6 1.7 0l7.9 12.6c0.6 0.9 0 2-1.1 2z m-2.6-18c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"></path></svg></div>',
            '</div>',
            '</div>',
            '<div>',
            '<div class="text-body-col">',
            '<div class="text text-tiny"></div>',
            '<div class="text text-tiny"></div>',
            '</div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_setup_card: function() {
        return [
            '<div class="body card">',
            '<div class="text-body">',
            '<div class="icon icon-round-large"></div>',
            '<div class="text text-long"></div>',
            '<div class="text text-short"></div>',
            '<div class="text text-medium"></div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_app_detail: function() {
        var build_line = function(helper, n) {
            var list = [];
            var opacity;
            for (var i = 0; i < n; i++) {
                opacity = (n - i) / n;
                list.push('<div class="' + helper.getOpacityClass(opacity) + '">');
                list.push(helper.template_table_list_line_item());
                list.push('</div>');
            }
            return list.join('');
        };

        return [
            '<div class="body">',
            '<div class="icon icon-huge"></div>',
            '<div class="text-body">',
            '<div class="text text-thick text-long"></div>',
            '</div>',
            '</div>',
            '<div class="sidebar">',
            this.template_notes_products_generic(),
            '</div>',
            '<div class="main">',
            build_line(this,
                10),
            '</div>'
        ].join('');
    },

    template_empty_chart: function() {
        return [
            '<div class="body">',
            '<div class="axis-y axis-x"></div>',
            '</div>'
        ].join('');
    },

    template_twitter_bird: function() {
        return [
            '<div class="body dark"><div class="svg flex-grid flex-v-center flex-h-center">',
            '<svg version="1.2" baseProfile="tiny" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 72 72" xml:space="preserve" width="48px" height="48px">',
            '<path fill="#FFFFFF" d="M71.4,13.9c-2.6,1.2-5.5,2-8.4,2.3c3-1.8,5.3-4.7,6.4-8.1c-2.8,1.7-6,2.9-9.3,3.6C57.5,8.8,53.7,7,49.4,7c-8.1,0-14.7,6.6-14.7,14.7c0,1.1,0.1,2.3,0.4,3.3C23,24.4,12.2,18.5,5,9.7c-1.3,2.2-2,4.7-2,7.4c0,5.1,2.6,9.6,6.5,12.2c-2.4-0.1-4.7-0.7-6.6-1.8c0,0.1,0,0.1,0,0.2c0,7.1,5.1,13,11.8,14.4c-1.2,0.3-2.5,0.5-3.9,0.5c-0.9,0-1.9-0.1-2.8-0.3c1.9,5.8,7.3,10.1,13.7,10.2c-5,3.9-11.3,6.3-18.2,6.3c-1.2,0-2.3-0.1-3.5-0.2C6.5,62.6,14.2,65,22.5,65c26.9,0,41.7-22.3,41.7-41.7c0-0.6,0-1.3,0-1.9C67,19.4,69.4,16.8,71.4,13.9z"></path>',
            '</svg></div></div>'
        ].join('');
    },

    template_social_service: function() {
        return [
            '<div class="flex-grid flex-v-center">',
            '<div class="icon icon-round-large"></div>',
            '<div class="text-body">',
            '<div class="text text-medium text-thinner"></div>',
            '<div class="text text-shorter text-thinner"></div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_dashboard_card: function() {
        return [
            '<div class="body card">',
            '<div class="text-body">',
            '<div class="text text-short"></div>',
            '<div class="svg flex-grid flex-v-center flex-h-center"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 100 100" style="background:#FFF"><path fill="#e0e5ee" width="32px" height="32px" d="m50 20c-16.5 0-30 13.5-30 30s13.5 30 30 30 30-13.5 30-30-13.5-30-30-30z m0 8c12.1 0 22 9.9 22 22 0 1-0.1 2-0.2 3h-8.9c-1 0-1.8 0.7-2 1.7-0.8 5.2-5.4 9.3-10.9 9.3s-10.1-4.1-10.9-9.3c-0.1-1-1-1.7-2-1.7h-8.9c-0.1-1-0.2-2-0.2-3 0-12.1 9.9-22 22-22z m-2.3 29.4c2.4 1.3 5.5 0.3 6.8-2.1 1.9-3.5 5.5-18.9 4.6-19.3-0.9-0.5-11.6 11.1-13.4 14.7-1.4 2.4-0.5 5.4 2 6.7z"></path></svg></div>',
            '</div>',
            '</div>'
        ].join('');
    },

    template_pipelineView: function() {
        var buildPipelineViewCard = function(helper, opacity) {
            return [
                '<div class="flex-grid flex-v-center">',
                '<div class="text-body ' + helper.getOpacityClass(opacity) + '">',
                '<div class="text text-long"></div>',
                '<div class="text text-short"></div>',
                '<div class="text text-medium"></div>',
                '<div class="text text-shorter"></div>',
                '</div>',
                '</div>'
            ].join('');
        };

        var buildPipelineViewHeader = function(helper) {
            return [
                '<div>',
                '<div class="stageHeader"></div>',
                '<div class="stageAggregateValue"></div>',
                '</div>'
            ].join('');
        };

        var buildPipelineViewList = function(helper, numOfCards) {
            var result = ['<ul>'];
            var opacity;
            for (var i = 0; i < numOfCards; i++) {
                opacity = (numOfCards - i) / numOfCards;
                result.push('<li>' + buildPipelineViewCard(helper, opacity) + '</li>');
            }
            result.push('</ul>');
            return result.join('');
        };

        var buildPipelineViewColumn = function(helper, numOfCards) {
            return [
                '<div class="flex-grow pipelineView-column">',
                '<section>',
                buildPipelineViewHeader(helper),
                '<div class="listContent">',
                buildPipelineViewList(helper,
                    numOfCards),
                '</div>',
                '</section>',
                '</div>'
            ].join('');
        };

        return [
            '<div class="flex-grid flex-v-start">',
            this.times(5,
                buildPipelineViewColumn(this,
                    4)),
            '</div>'
        ].join('');
    },

    template_fieldMapping: function() {
        var buildLeftColumn = function(numberOfRows) {
            var result = ['<div class="left-column">'];

            result.push(buildHeader());

            var opacity;
            for (var i = 1; i <= numberOfRows; i++) {
                opacity = (numberOfRows - i) * 10;
                result.push('<div class="opacity' + opacity + ' field border-bottom">');
                result.push('<div class="text text-primary text-medium text-thin"></div>');
                result.push('</div>');
            }
            result.push('</div>');
            return result.join('');
        };

        var buildRightColumn = function(numberOfRows) {
            var result = ['<div class="right-column">'];

            result.push(buildHeader());

            var opacity;
            for (var i = 0; i <= numberOfRows; i++) {
                opacity = (numberOfRows - i) * 10;
                result.push('<div class="opacity' + opacity + ' field border-bottom">');
                result.push('<div class="text text-primary text-medium text-thin"></div>');
                result.push('<div class="text text-secondary text-action text-thin"></div>');
                result.push('</div>');
            }
            result.push('</div>');
            return result.join('');
        };

        var buildHeader = function() {
            return [
                '<div class="anchor flex-grid flex-v-center">',
                '<div class="icon icon-square flex-none"></div>',
                '<div class="field flex-grow">',
                '<div class="text text-short text-thin text-primary"></div>',
                '</div>',
                '</div>'
            ].join('');
        };

        return [
            '<div class="placeholder fieldMapping detail">',
            '<div class="content-tabs body border-bottom">',
            '<div class="text-body-col">',
            '<div class="text text-tiny"></div>',
            '<div class="text text-tiny"></div>',
            '</div>',
            '</div>',
            '<div class="intro body border-bottom">',
            '<div class="text-body-col">',
            '<div class="text text-long"></div>',
            '</div>',
            '<div class="text-body-col">',
            '<div class="text text-medium"></div>',
            '</div>',
            '</div>',
            buildLeftColumn(10), buildRightColumn(10),
            '</div>'
        ].join('');
    },
})
