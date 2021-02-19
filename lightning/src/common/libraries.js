(function(w) {
    const Libraries = {
        'Leaflet': {
            styles: [
                '/lib/leaflet.css',
            ],
            scripts: [
                '/lib/leaflet.js',
            ],
            validate: () => {
                return typeof L !== 'undefined';
            },
        },
        'Cropper': {
            styles: [
                '/lib/cropper.min.css',
            ],
            scripts: [
                '/lib/cropper.min.js',
            ],
            validate: () => {
                return typeof Cropper !== 'undefined';
            },
        },
        'd3': {
            scripts: [
                '/lib/d3.v3.js',
            ],
            validate: () => {
                return typeof d3 !== 'undefined';
            },
        },
        'Chart': {
            styles: [
                '/lib/Chart.css',
            ],
            scripts: [
                '/lib/Chart.js',
            ],
            validate: () => {
                return typeof Chart !== 'undefined';
            },
        },
        'fullcalendar': {
            styles: [
                '/lib/fullcalendar.min.css',
            ],
            scripts: [
                '/lib/fullcalendar.js',
            ],
            validate: () => {
                return typeof $.fullCalendar !== 'undefined';
            },
        },
    };

    w.$CustomLibraries = Libraries;
})(window);
