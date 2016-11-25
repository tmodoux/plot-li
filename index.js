var connection;
var streams = ['biovotion-bpm'];
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
            setupMonitor();
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
function updateGraph(events) {

    //if(!events || events.length<1) return;

    streams.forEach(function(stream) {
        var types = events.map(function (e) {
            if(e.streamId==stream) return e.type;
        });

        var uniqueTypes = types.filter(function(elem, index, self) {
            return index == self.indexOf(elem);
        });

        //if(!uniqueTypes || uniqueTypes.length<1) return;

        // Update data
        uniqueTypes.forEach(function(type) {

            var graphName = stream + '_' + type;

            // Initialize graphs
            if(document.getElementById(graphName) === null) {
                var graph = document.createElement('div');
                graph.setAttribute("id", graphName);
                container.appendChild(graph);
            };

            var filteredEvents = events.map(function (e) {
                if(e.streamId==stream && e.type===type) return e;
            });

            //if(!filteredEvents || filteredEvents.length<1) return;

            filteredEvents = filteredEvents.sort(function (a, b) {
                return a.time - b.time;
            });

            var time = filteredEvents.map(function(e) {return e.time;});

            //if(!time || time.length<1) return;

            var data = filteredEvents.map(function(e) {return e.content;});

            //if(!data || data.length<1) return;

            var traceA = {x: time, y: data, mode: "lines", name: "Trace1", type: "scatter"};
            var layoutA = {
                title: stream + ' (' + type + ')',
                xaxis1: {
                    title: "Time",
                    showticklabels : false
                },
                yaxis1: {
                    title: type,
                    showticklabels : true
                }};

            Plotly.newPlot(graphName, [traceA], layoutA);
        });

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