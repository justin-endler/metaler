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

function NoteEvent (eventArray, eventKeys) {
  // parse array into object properties according to keys
  for (var i = 0, l = eventArray.length; i < l; i++) {
    this[eventKeys[i]] = eventArray[i];
  }
}

NoteEvent.prototype.transpose = function transpose (offset) {
  this.pitch += offset;
}

NoteEvent.prototype.toString = function toString () {
  var str = '{\n';
  for (var key in this) {
    if (this.hasOwnProperty(key)) {
      str += '\n  ' + key + ': ' + this[key] + ',';
    }
  }
  str = str.slice(0, -1) + '\n}\n';
  return str;
}

NoteEvent.prototype.post = function eventPost () {
  post(this.toString() + '\n');
}

// receive midi event
function list () {
  var noteEvent = new NoteEvent(arrayfromargs(arguments), eventKeys);
  noteEvent.transpose(14); // @test
  // store event
  events.push(noteEvent);
  out(noteEvent);
}

function out (noteEvent) {
  var noteEventArray = [];
  for (var i = 0, l = eventKeys.length; i < l; i++) {
    noteEventArray.push(noteEvent[eventKeys[i]]);
  }
  outlet(0, noteEventArray);
}

function log (l, x) {
  if (x) {
    return post(l + ': ' + x + '\n');
  }
  post(l + '\n');
}

function dump () {
  for (var i = 0, l = events.length; i < l; i++) {
    events[i].post();
  }
}
