inlets = 2;
outlets = 1;

var events = [];
// detonate's outlets
var eventKeys = [
  'time',
  'pitch',
  'velocity',
  'duration',
  'channel',
  'track',
  'extra1',
  'extra2'
];

// @todo add README.md
//   list dependencies

function Utility () {}
Utility.prototype.out = function (noteEvent) {
  var noteEventArray = [];
  for (var i = 0, l = eventKeys.length; i < l; i++) {
    noteEventArray.push(noteEvent[eventKeys[i]]);
  }
  outlet(0, noteEventArray);
};
Utility.prototype.log = function (l, x) {
  if (x) {
    return post(l + ': ' + x + '\n');
  }
  post(l + '\n');
};

var utility = new Utility();


// message callbacks
function dump () {
  for (var i = 0, l = events.length; i < l; i++) {
    events[i].post();
  }
}

function normalize (key, limit) {
  var highest = 0;
  // default, normalize velocity, limit 127
  if (!key) {
    key = 'velocity';
  }
  if (!limit) {
    limit = 127;
  }

  _.each(events, function (noteEvent) {
    if (noteEvent[key] > highest) {
      highest = noteEvent[key];
    }
  });
  _.each(events, function (noteEvent) {
    // value / highest = newValue / limit
    noteEvent[key] = Math.ceil((limit * noteEvent[key]) / highest);
  });
}


function NoteEvent (eventArray, eventKeys) {
  // parse array into object properties according to keys
  for (var i = 0, l = eventArray.length; i < l; i++) {
    this[eventKeys[i]] = eventArray[i];
  }
}

NoteEvent.prototype.transpose = function (offset) {
  this.pitch += offset;
};

NoteEvent.prototype.toString = function () {
  var str = '{\n';
  for (var key in this) {
    if (this.hasOwnProperty(key)) {
      str += '\n  ' + key + ': ' + this[key] + ',';
    }
  }
  str = str.slice(0, -1) + '\n}\n';
  return str;
};

NoteEvent.prototype.post = function () {
  post(this.toString() + '\n');
};

// receive midi event
function list () {
  var noteEvent = new NoteEvent(arrayfromargs(arguments), eventKeys);
  // store event
  events.push(noteEvent);
  utility.out(noteEvent);
}
