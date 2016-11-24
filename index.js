var connection;
var streams = ['biovotion-bpm', 'biovotion-test'];
var container = document.getElementById("pryvGraphs");
var monitor;

// AUTH

// Preliminary step: use staging environment (remove for use on production infrastructure)
pryv.Auth.config.registerURL = {host: 'reg.pryv.me', 'ssl': true};

// Authenticate user
var authSettings = {
    requestingAppId: 'biovotion-webapp',
    requestedPermissions: [
        {
            streamId: '*',
            level: 'manage'
        }
    ],
    // set this if you don't want a popup
    returnURL: false,
    // use the built-in auth button (optional)
    spanButtonID: 'pryv-button',
    callbacks: {
        initialization: function () {
            // optional (example use case: display "loading" notice)
        },
        needSignin: function (popupUrl, pollUrl, pollRateMs) {
            resetGraphs();
        },
        needValidation: null,
        signedIn: function (connect, langCode) {
            connection = connect;
            loadGraphs();
        },
        refused: function (reason) {
        },
        error: function (code, message) {
        }
    }
};

pryv.Auth.setup(authSettings);

// MONITORING

// Setup monitoring for remote changes
function setupMonitor() {
    var filter = new pryv.Filter({streamsIds: streams});
    monitor = connection.monitor(filter);

    // should be false by default, will be updated in next lib version
    // to use fullCache call connection.ensureStructureFetched before
    monitor.ensureFullCache = false;
    monitor.initWithPrefetch = 0; // default = 100;

    // get notified when monitoring starts
    monitor.addEventListener(pryv.MESSAGES.MONITOR.ON_LOAD, function (events) {
        updateGraph(monitor.getEvents());
    });

    // get notified when data changes
    monitor.addEventListener(pryv.MESSAGES.MONITOR.ON_EVENT_CHANGE, function (changes) {
        updateGraph(monitor.getEvents());
    });

    // start monitoring
    monitor.start(function (err) {
    });
}

// GRAPHS

function loadGraphs() {
    streams.forEach(function(stream) {
        // Initialize graphs
        var graph = document.createElement('div');
        graph.setAttribute("id", stream);
        container.appendChild(graph);
    });

    // Initialize monitor
    setupMonitor();
}

function updateGraph(events) {
    streams.forEach(function(stream) {
        var time = events.map(function (e) {
            if(e.getData().streamId==stream) return e.getData().time;
        });
        var data = events.map(function (e) {
            if(e.getData().streamId==stream) return e.getData().content;
        });
        var traceA = {x: time, y: data, mode: "lines", name: "Trace1", type: "scatter"};
        var layoutA = {
            title: stream,
            xaxis1: {
                title: "Time (seconds)",
                showticklabels : false
            },
            yaxis1: {
                title: stream,
                showticklabels : false
            }};

        Plotly.newPlot(stream, [traceA], layoutA);
    });
}

function resetGraphs() {
    if (monitor) {
        monitor.destroy();
    }
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}