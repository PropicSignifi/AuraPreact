import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import Preactlet from '../preactlet/preactlet';
import Utils from '../utils/utils';
import createLoadingIndicator from '../busyloading/busyloading';
import App from '../app/app';
import styles from './mapViewer.less';

import FeatureViewer from './featureViewer';
import ControlPanelView from './controlPanelView';
import RegionViewer from './regionViewer';
import ListView from './listView';

export const isMarkerInsidePolygon = (marker, poly) => {
    let inside = false;
    const x = marker.getLatLng().lat;
    const y = marker.getLatLng().lng;

    for(let ii=0; ii<poly.getLatLngs().length; ii++){
        const polyPoints = poly.getLatLngs()[ii];
        for(let i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
            let xi = polyPoints[i].lat, yi = polyPoints[i].lng;
            let xj = polyPoints[j].lat, yj = polyPoints[j].lng;

            let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) {
                inside = !inside;
            }
        }
    }

    return inside;
};

export const getFeatureId = feature => {
    if(feature.properties) {
        return _.isNil(feature.properties.id) ? feature.properties.name : feature.properties.id;
    }
};

export const traverse = (data, filter, collector) => {
    if(!data) {
        return;
    }

    if(_.isArray(data)) {
        _.forEach(data, feature => traverse(feature, filter, collector));
    }
    else if(data.type === 'FeatureCollection') {
        _.forEach(data.features, feature => traverse(feature, filter, collector));
    }
    else if(data.type === 'Feature') {
        let matched = true;
        if(_.isFunction(filter)) {
            matched = filter(data);
        }

        if(matched && _.isFunction(collector)) {
            collector(data);
        }
    }
};

export const getFeatureIcon = (feature, featureSchema) => {
    const type = feature.properties && feature.properties.type;
    const schema = featureSchema[type];
    const icon = _.get(schema, 'icon', {});
    icon.name = icon.name || 'default';
    return icon;
};

export const filter = (data, filterBy, doFilter) => {
    if(!data) {
        return;
    }

    if(_.isEmpty(filterBy)) {
        return data;
    }

    if(_.isArray(data)) {
        return _.map(data, item => filter(item, filterBy, doFilter));
    }
    else if(data.type === 'FeatureCollection') {
        return _.assign({}, data, {
            features: _.chain(data.features)
                .map(f => {
                    if(f.type === 'Feature') {
                        if(doFilter(f, filterBy)) {
                            return f;
                        }
                        else {
                            return null;
                        }
                    }
                    else {
                        return f;
                    }
                })
                .compact()
                .value(),
        });
    }
};

export const getFeatures = data => {
    const features = [];
    traverse(data, null, feature => features.push(feature));

    return features;
};

export const findFeaturesInPolygon = (data, polygon) => {
    const features = [];
    traverse(data, feature => isMarkerInsidePolygon(feature.$layer, polygon), feature => features.push(feature));

    return features;
};

const getUrl = url => {
    if(!url) {
        return;
    }

    if(url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    else {
        return Utils.getResource(`/static/${url}.png`);
    }
};

export const getSystemIcon = (icon = {}) => {
    return {
        iconUrl:       getUrl(icon.iconUrl) || Utils.getResource(`/lib/images/marker-${icon.name}-icon.png`),
        iconRetinaUrl: getUrl(icon.retinaUrl) || getUrl(icon.iconUrl) || Utils.getResource(`/lib/images/marker-${icon.name}-icon-2x.png`),
        shadowUrl:     getUrl(icon.shadowUrl) || Utils.getResource(`/lib/images/marker-shadow.png`),
        iconSize:    icon.size || [25, 41],
        iconAnchor:  icon.anchor || [12, 41],
        popupAnchor: icon.popupAnchor || [1, -34],
        tooltipAnchor: icon.tooltipAnchor || [16, -28],
        shadowSize:  icon.shadowSize || [41, 41]
    };
};

class Wrapper extends Component {
    constructor() {
        super();

        this.state = {
            data: {},
        };
    }

    componentDidMount() {
        const map = this.props.map;

        this.removeReloadListener = map.$addReloadListener(data => {
            this.setState({
                data,
            });
        });
    }

    componentWillUnmount() {
        if(_.isFunction(this.removeReloadListener)) {
            this.removeReloadListener();
        }
    }

    render(props, state) {
        const {
            cmp,
            cmpProps,
        } = props;

        const Comp = cmp;

        return (
            <App
                globalData={ this.context.globalData }
                applyTopSpace="false"
                applyBottomSpace="false"
            >
                <Comp
                    { ...this.state.data }
                    { ...cmpProps }
                >
                </Comp>
            </App>
        );
    }
}

export default class MapViewer extends BaseComponent {
    constructor() {
        super();

        this.map = null;
        this.node = null;
        this.geoJSONLayer = null;
        this.batchSelectionLayer = null;

        this.$data = null;
        this.$schema = null;
        this.$reloadListeners = [];
        this.$batchSelectionActive = false;
        // in geoJSON coordinate format
        this.$batchSelection = null;
        this.$filterBy = null;
        this.$showListView = false;
        this.$indicator = createLoadingIndicator(false);
        this.$markers = {};
        this.$loaded = false;

        this.state = _.assign({}, super.state, {
            selectedIds: [],
        });

        this.bind([
            'setNode',
            'onMapClicked',
            'onAddToSelection',
            'onRemoveFromSelection',
            'onDeleteRegion',
        ]);
    }

    isDataManaged() {
        return _.isFunction(this.prop('loadData'));
    }

    loadData(newFilterBy, oldFilterBy, oldData) {
        return this.$indicator.until(this.prop('loadData')(newFilterBy, oldFilterBy, oldData));
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.isDataManaged()) {
            if(nextProps.schema !== this.$schema) {
                const filterBy = this.getFilterBy();
                this.loadData(filterBy, filterBy, this.$data).then(data => {
                    this.$data = data;
                    this.$schema = nextProps.schema;
                    this.reload();
                });
            }
        }
        else {
            if(nextProps.data !== this.$data || nextProps.schema !== this.$schema) {
                this.$data = nextProps.data;
                this.$schema = nextProps.schema;
                this.reload();
            }
        }

        return false;
    }

    componentDidMount() {
        window.$Utils.requireLibrary(this.getPreactContainerName(), 'Leaflet').then(() => {
            const [{
                tileUrl,
                tileAttribution,
                schema,
                controlPanelComp,
                controlPanelClassName,
                listViewComp,
                listViewClassName,
            },] = this.getPropValues();

            this.$schema = schema;

            this.defaultMarkerIcon = L.icon(getSystemIcon({ name: 'default' }));
            this.selectedMarkerIcon = L.icon(getSystemIcon({ name: 'selected' }));

            L.Control.ControlPanel = L.Control.extend({
                onAdd: function(map) {
                    const div = document.createElement('div');
                    div.classList.add(controlPanelClassName || styles.controlPanel);
                    div.innerHTML = "";
                    render((
                        <Wrapper
                            map={ map }
                            cmp={ controlPanelComp || ControlPanelView }
                        >
                        </Wrapper>
                    ), div);

                    return div;
                },

                onRemove: function(map) {
                    if(_.isFunction(this.removeReloadListener)) {
                        this.removeReloadListener();
                    }
                },
            });

            L.Control.ListView = L.Control.extend({
                onAdd: function(map) {
                    const div = document.createElement('div');
                    div.classList.add(listViewClassName || styles.listView);
                    div.innerHTML = "";
                    render((
                        <Wrapper
                            map={ map }
                            cmp={ listViewComp || ListView }
                        >
                        </Wrapper>
                    ), div);

                    return div;
                },

                onRemove: function(map) {
                    if(_.isFunction(this.removeReloadListener)) {
                        this.removeReloadListener();
                    }
                },
            });

            const container = L.DomUtil.get(this.node);
            if(container != null){
                container._leaflet_id = null;
            }

            // tapping not supported on mobile in lightning
            this.map = this.map || L.map(this.node, _.assign({
                tap: false,
                zoomControl: false,
            }, this.prop('options')));
            this.map.on('click', this.onMapClicked);
            this.map.$addReloadListener = listener => {
                this.$reloadListeners.push(listener);

                return () => {
                    _.pull(this.$reloadListeners, listener);
                };
            };

            L.tileLayer(
                tileUrl,
                {
                    attribution: tileAttribution,
                }).addTo(this.map);

            if(_.get(schema, 'controlPanel.visible')) {
                new L.Control.ControlPanel({
                    position: 'topleft',
                }).addTo(this.map);
            }

            L.control.zoom({
                position: 'topright',
            }).addTo(this.map);

            if(_.get(schema, 'listView.visible')) {
                new L.Control.ListView({
                    position: 'bottomleft',
                }).addTo(this.map);
            }

            if(this.isDataManaged()) {
                this.loadData(this.getFilterBy(), {}, this.$data).then(data => {
                    this.$data = data;
                    this.reload();
                });
            }
            else {
                this.$data = this.props.data;
                this.reload();
            }
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        if(this.map && this.map.remove) {
            this.map.off();
            this.map.remove();
        }
    }

    setNode(node) {
        this.node = node;
    }

    renderBySchema(feature, schema) {
        const featureProps = feature.properties;
        if(!featureProps) {
            return;
        }

        const featureSchema = _.get(schema, `features.${featureProps.type}`);
        if(!featureSchema) {
            return;
        }

        const style = {};
        if(featureSchema.width) {
            style.width = `${featureSchema.width}px`;
        }

        return (
            <div style={ style }>
                <FeatureViewer
                    feature={ feature }
                    schema={ schema }
                    onAddToSelection={ this.onAddToSelection }
                    onRemoveFromSelection={ this.onRemoveFromSelection }
                >
                </FeatureViewer>
            </div>
        );
    }

    getFilteredData() {
        const schema = this.prop('schema');
        return filter(this.$data, this.getFilterBy(), _.get(schema, 'controlPanel.doFilter'));
    }

    getFilterBy() {
        return this.$filterBy || _.get(this.prop('schema'), 'controlPanel.defaultValue');
    }

    setFilterBy(filterBy) {
        this.$filterBy = filterBy;

        if(_.isFunction(this.prop('onFilterUpdated'))) {
            this.prop('onFilterUpdated')(this.$filterBy);
        }

        if(this.isDataManaged()) {
            this.loadData(filterBy, this.$filterBy, this.$data).then(data => {
                this.$data = data;
                this.reload();
            });
        }
        else {
            this.reload();
        }
    }

    onAddToSelection(selected) {
        let features = _.isArray(selected) ? selected : [selected];

        const selectedIds = [];
        _.forEach(features, feature => {
            const id = getFeatureId(feature);
            if(!_.includes(this.state.selectedIds, id)) {
                const layer = feature.$layer;
                if(layer) {
                    layer.setIcon(this.selectedMarkerIcon);
                }

                selectedIds.push(id);
            }
        });

        this.setState({
            selectedIds: [
                ...this.state.selectedIds,
                ...selectedIds,
            ],
        }, () => {
            this.notifyReloaded();
        });
    }

    onRemoveFromSelection(selected) {
        let features = _.isArray(selected) ? selected : [selected];
        const schema = this.prop('schema');

        const selectedIds = [];
        _.forEach(features, feature => {
            const id = getFeatureId(feature);
            if(_.includes(this.state.selectedIds, id)) {
                const layer = feature.$layer;
                if(layer) {
                    const icon = L.icon(getSystemIcon(getFeatureIcon(feature, schema.features)));
                    layer.setIcon(icon);
                }

                selectedIds.push(id);
            }
        });

        this.setState({
            selectedIds: _.without(this.state.selectedIds, ...selectedIds),
        }, () => {
            this.notifyReloaded();
        });
    }

    clickOnMarker(marker, feature, open = true) {
        if(open) {
            marker.openPopup();
        }

        const popup = marker.getPopup();

        const schema = this.prop('schema');
        const processor = this.prop('processor');
        let vdom = null;
        if(schema.features) {
            vdom = this.renderBySchema(feature, schema);
        }
        else if(processor && _.isFunction(processor.render)) {
            vdom = processor.render(feature);
        }

        if(!vdom) {
            popup.closePopup();
            return;
        }

        const div = document.createElement('div');
        render(vdom, div);
        popup.setContent(div);
        popup.update();
    }

    onMarkerClick(e, feature) {
        return this.clickOnMarker(e.target, feature, false);
    }

    onRegionClick(e, features) {
        const popup = e.target.getPopup();

        const div = document.createElement('div');
        const schema = this.prop('schema');
        const style = {};
        if(schema.region && schema.region.width) {
            style.width = `${schema.region.width}px`;
        }
        render((
            <div style={ style }>
                <RegionViewer
                    features={ features }
                    onDelete={ this.onDeleteRegion }
                    onAddToSelection={ this.onAddToSelection }
                    onRemoveFromSelection={ this.onRemoveFromSelection }
                    schema={ schema }
                >
                </RegionViewer>
            </div>
        ), div);
        popup.setContent(div);
        popup.update();
    }

    onDeleteRegion() {
        this.$batchSelection = null;
        if(this.batchSelectionLayer) {
            this.map.removeLayer(this.batchSelectionLayer);
        }
    }

    notifyReloaded() {
        const schema = this.prop('schema');

        _.forEach(this.$reloadListeners, listener => {
            listener({
                viewer: this,
            });
        });
    }

    getAllFeatures() {
        return getFeatures(this.$data);
    }

    getFeatures() {
        return getFeatures(this.getFilteredData());
    }

    showListView() {
        return this.$showListView;
    }

    setShowListView(show) {
        this.$showListView = show;

        this.notifyReloaded();
    }

    focusOnFeature(featureId, zoomLevel) {
        const features = this.getFeatures();
        const feature = _.find(features, f => getFeatureId(f) === featureId);
        if(!feature) {
            return;
        }

        if(this.map) {
            const coordinates = feature.geometry.coordinates;
            this.map.flyTo([coordinates[1], coordinates[0]], zoomLevel);

            const marker = this.$markers[featureId];
            if(marker) {
                this.clickOnMarker(marker, feature);
            }
        }
    }

    reload() {
        if(this.geoJSONLayer) {
            this.map.removeLayer(this.geoJSONLayer);
        }

        if(this.$data && window.L) {
            const processor = this.prop('processor');
            const schema = this.prop('schema');

            this.geoJSONLayer = L.geoJSON(this.getFilteredData(), {
                style: feature => {
                    if(processor && _.isFunction(processor.style)) {
                        return processor.style(feature);
                    }
                    else {
                        return feature.properties && feature.properties.style;
                    }
                },

                pointToLayer: (feature, latlng) => {
                    if(processor && _.isFunction(processor.pointToLayer)) {
                        return processor.pointToLayer(feature, latlng);
                    }
                    else {
                        const id = getFeatureId(feature);
                        const icon = L.icon(getSystemIcon(getFeatureIcon(feature, schema.features)));
                        const marker = _.includes(this.state.selectedIds, id) ? L.marker(latlng, { icon: this.selectedMarkerIcon }) : L.marker(latlng, { icon });
                        this.$markers[id] = marker;
                        return marker.on('click', e => this.onMarkerClick(e, feature));
                    }
                },

                onEachFeature: (feature, layer) => {
                    if(processor && _.isFunction(processor.onEachFeature)) {
                        return processor.onEachFeature(feature, layer);
                    }
                    else {
                        let popup = null;

                        if(feature.properties && feature.properties.popupContent) {
                            popup = feature.properties.popupContent;
                        }
                        else {
                            popup = 'Loading...';
                        }

                        layer.bindPopup(popup, {
                            keepInView: true,
                            minWidth: 300,
                            maxWidth: 600,
                        });
                        feature.$layer = layer;
                    }
                },
            }).addTo(this.map);

            const features = this.getFeatures();
            if(!_.isEmpty(features)) {
                if(!this.$loaded) {
                    this.map.fitBounds(this.geoJSONLayer.getBounds());
                    this.$loaded = true;
                }
                else {
                    if(this.prop('reloadBehavior') === 'fitBounds') {
                        this.map.fitBounds(this.geoJSONLayer.getBounds());
                    }
                    else {
                        this.map.setView(this.map.getCenter(), this.map.getZoom());
                    }
                }
            }

            this.notifyReloaded();
        }
    }

    getSelectedIds() {
        return this.state.selectedIds;
    }

    setSelectedIds(selectedIds) {
        const features = getFeatures(this.$data);
        const schema = this.prop('schema');
        const newSelectedIds = selectedIds;
        const oldSelectedIds = this.state.selectedIds;

        _.forEach(newSelectedIds, id => {
            if(!_.includes(oldSelectedIds, id)) {
                const feature = _.find(features, f => getFeatureId(f) === id);

                if(!feature) {
                    return;
                }

                const layer = feature.$layer;
                if(layer) {
                    layer.setIcon(this.selectedMarkerIcon);
                }
            }
        });

        _.forEach(oldSelectedIds, id => {
            if(!_.includes(newSelectedIds, id)) {
                const feature = _.find(features, f => getFeatureId(f) === id);

                if(!feature) {
                    return;
                }

                const layer = feature.$layer;
                if(layer) {
                    const icon = L.icon(getSystemIcon(getFeatureIcon(feature, schema.features)));
                    layer.setIcon(icon);
                }
            }
        });

        this.setState({
            selectedIds: newSelectedIds,
        }, () => {
            this.notifyReloaded();
        });
    }

    onMapClicked(e) {
        const schema = this.prop('schema');
        if(_.get(schema, 'region.visible') === false) {
            return;
        }

        let triggered = false;
        if(e.originalEvent.shiftKey) {
            if(!this.$batchSelectionActive && !this.$batchSelection) {
                this.$batchSelectionActive = true;
                this.$batchSelection = [];
                triggered = true;
            }
        }

        if(this.$batchSelectionActive) {
            this.$batchSelection.push([e.latlng.lng, e.latlng.lat]);

            if(this.batchSelectionLayer) {
                this.map.removeLayer(this.batchSelectionLayer);
            }

            this.batchSelectionLayer = L.geoJSON({
                type: 'LineString',
                coordinates: this.$batchSelection,
            }).addTo(this.map);
        }

        if(e.originalEvent.shiftKey) {
            if(!triggered && this.$batchSelection) {
                this.$batchSelectionActive = false;

                if(this.batchSelectionLayer) {
                    this.map.removeLayer(this.batchSelectionLayer);
                }

                if(_.size(this.$batchSelection) >= 3) {
                    this.batchSelectionLayer = L.geoJSON({
                        type: 'Polygon',
                        coordinates: [this.$batchSelection],
                    }).addTo(this.map);

                    this.batchSelectionLayer.bindPopup('Loading...', {
                        keepInView: true,
                        minWidth: 300,
                        maxWidth: 600,
                    });
                    const polygon = L.polygon(_.map(this.$batchSelection, L.GeoJSON.coordsToLatLng));
                    const features = findFeaturesInPolygon(this.getFilteredData(), polygon);
                    this.batchSelectionLayer.on('click', e => this.onRegionClick(e, features));
                }
                else {
                    this.$batchSelection = null;
                }
            }
        }
    }

    getSchema() {
        return this.prop('schema');
    }

    render(props, state) {
        const [{
            containerClassName,
            className,
            height,
        }, rest] = this.getPropValues();

        const style = {
            height,
        };

        const LoadingZone = this.$indicator.Zone;

        return (
            <LoadingZone className={ containerClassName }>
                <div
                    ref={ this.setNode }
                    className={ `${styles.defaultStyle} ${className}` }
                    data-type={ this.getTypeName() }
                    style={ style }
                    {...rest}
                >
                </div>
            </LoadingZone>
        );
    }
}

MapViewer.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    containerClassName: PropTypes.isString('containerClassName').demoValue(''),
    tileUrl: PropTypes.isString('tileUrl').defaultValue('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}').demoValue('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'),
    tileAttribution: PropTypes.isString('tileAttribution').defaultValue('Tiles © Esri').demoValue('Tiles © Esri'),
    data: PropTypes.isObject('data').description('GeoJSON data'),
    loadData: PropTypes.isFunction('loadData').description('function to load GeoJSON data'),
    processor: PropTypes.isObject('processor').shape({
        style: PropTypes.isFunction('style'),
        pointToLayer: PropTypes.isFunction('pointToLayer'),
        onEachFeature: PropTypes.isFunction('onEachFeature'),
        render: PropTypes.isFunction('render'),
    }),
    schema: PropTypes.isObject('schema'),
    height: PropTypes.isString('height').defaultValue('400px').demoValue('400px'),
    onFilterUpdated: PropTypes.isFunction('onFilterUpdated'),
    options: PropTypes.isObject('options'),
    reloadBehavior: PropTypes.isString('reloadBehavior').values([
        'fitBounds',
        'fixed',
    ]).defaultValue('fitBounds').demoValue('fitBounds'),
    controlPanelComp: PropTypes.isObject('controlPanelComp'),
    controlPanelClassName: PropTypes.isString('controlPanelClassName'),
    listViewComp: PropTypes.isObject('listViewComp'),
    listViewClassName: PropTypes.isString('listViewClassName'),
};

MapViewer.propTypesRest = true;
MapViewer.displayName = "MapViewer";
