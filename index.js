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
          connection.fetchStructure(function (done) {

            setupMonitor();
          });
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
        updateGraph(events);

    });

    // get notified when data changes
    monitor.addEventListener(pryv.MESSAGES.MONITOR.ON_EVENT_CHANGE, function (changes) {
        updateGraph(changes.created);
    });

    // start monitoring
    monitor.start(function (err) {
    });
}


var graphs = {};


function getDateString(timestamp) {
  var date = new Date(timestamp);
  return date.toISOString().substring(0, 10) + ' '
    + date.toISOString().substring(11, 19) + '.' + date.getMilliseconds();
}

function createGraph(event) {
  var graphKey = event.streamId + '_' + event.type;

  if (! pryv.eventTypes.isNumerical(event)) {
    graphs[graphKey] = { ignore : true};
    return;
  }

  var extraType = pryv.eventTypes.extras(event.type);

  var titleY = extraType.symbol ? extraType.symbol : event.type;


  var title = '';
  event.stream.ancestors.forEach(function (ancestor) { 
     title += ancestor.name + '/';
  });
  title += event.stream.name;


  graphs[graphKey] = {
    type: event.type,
    streamId: event.streamId + ' ' + titleY,
    trace: {
      x: [],
      y: [],
      mode: 'lines',
      name: event.stream.name,
      type: 'scatter'
    },
    layout : {
      title: title,
      xaxis1: {
        title: 'Time',
        showticklabels : true
      },
      yaxis1: {
        title: titleY,
        showticklabels : true
      }
    }
  };
  if (document.getElementById(graphKey) === null) {
    var graph = document.createElement('div');
    graph.setAttribute('id', graphKey);
    container.appendChild(graph);
  };
  Plotly.newPlot(graphKey, [graphs[graphKey].trace], graphs[graphKey].layout);
}



// GRAPHS
function updateGraph(events) {
    // needed ?
    events = events.sort(function (a, b) {
      return a.time - b.time;
    });

    var toRedraw = {};

    events.map(function (event) {
      var graphKey = event.streamId + '_' + event.type;
      if (! graphs[graphKey]) { // create New Trace
        createGraph(event);
      }

      if (! graphs[graphKey].ignore) {
        graphs[graphKey].trace.x.push(getDateString(event.timeLT));
        graphs[graphKey].trace.y.push(event.content);

        toRedraw[graphKey] = true;
      }


    });

     Object.keys(toRedraw).forEach(function (graphKey) {
         Plotly.redraw(graphKey);
     });


};


function resetGraphs() {
    if (monitor) {
        monitor.destroy();
    }
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}