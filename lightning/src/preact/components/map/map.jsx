import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import styles from './map.less';

export default class Map extends BaseComponent {
    constructor() {
        super();

        this.map = null;
        this.marker = null;
        this.node = null;
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.latitude !== nextProps.latitude ||
            this.props.longitude !== nextProps.longitude ||
            this.props.zoom !== nextProps.zoom ||
            this.props.address !== nextProps.address;
    }

    setNode(node) {
        this.node = node;
    }

    updateMap() {
        const [{
            latitude,
            longitude,
            zoom,
            address,
        },] = this.getPropValues();

        // tapping not supported on mobile in lightning
        const container = L.DomUtil.get(this.node);
        if(container !== null){
            container._leaflet_id = null;
        }
        this.map = this.map || L.map(this.node, { tap: false });
        this.map.setView([latitude, longitude], zoom);

        L.tileLayer(
            this.prop('tileUrl'),
            {
                attribution: this.prop('tileAttribution')
            }).addTo(this.map);

        if(this.marker) {
            this.marker.remove();
        }

        this.marker = L.marker([latitude, longitude]).addTo(this.map);
        this.marker.bindPopup(address).openPopup();
    }

    componentDidMount() {
        window.$Utils.requireLibrary(this.getPreactContainerName(), 'Leaflet').then(() => {
            this.updateMap();
        });
    }

    componentDidUpdate() {
        this.updateMap();
    }

    render(props, state) {
        const [{
            className,
        }, rest] = this.getPropValues();

        return (
            <div ref={ node => this.setNode(node) } className={ `${styles.defaultStyle} ${className}` } data-type={ this.getTypeName() } {...rest}></div>
        );
    }
}

Map.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    latitude: PropTypes.isNumber('latitude').required().demoValue(-26.40524639),
    longitude: PropTypes.isNumber('longitude').required().demoValue(153.05156809),
    zoom: PropTypes.isNumber('zoom').defaultValue(15).demoValue(15),
    address: PropTypes.isString('address').demoValue('test address'),
    tileUrl: PropTypes.isString('tileUrl').defaultValue('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}').demoValue('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'),
    tileAttribution: PropTypes.isString('tileAttribution').defaultValue('Tiles © Esri').demoValue('Tiles © Esri'),
};

Map.propTypesRest = true;
Map.displayName = "Map";
