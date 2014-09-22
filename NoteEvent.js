var _ = require('lodash');
var eventKeys = [
  'name',
  'time',
  'pitch',
  'velocity',
  'duration',
  'channel',
  'track',
  'extra1',
  'extra2'
];
var keysLength = eventKeys.length;

module.exports = NoteEvent;

function NoteEvent (params) {
  var key;
  for (var i = 0; i < keysLength; i++) {
    key = eventKeys[i];
    if (!params.hasOwnProperty(key)) {
      return {};
    }
    this[key] = params[key];
  }
}

// NoteEvent.prototype.clone = function () {
//   // @todo this not working on the prototype like you want, think of something else
//   var clone = {};
//   _.forOwn(this, function (value, key) {
//     clone[key] = value;
//   });
//   clone.prototype = {};
//   for (var key in this.prototype) {
//     clone.prototype[key] = this.prototype[key];
//   }
//   return clone;
// };

NoteEvent.prototype.transpose = function (offset) {
  this.pitch += offset;
};

NoteEvent.prototype.toString = function () {
  // @todo use util.format() to make it pretty if max/msp accepts it all spaced out like that
  var str = '';
  _.forOwn(this, function (value, key) {
    str += value + ' ';
  });
  str += '\n';
  return str;
};

NoteEvent.prototype.toStringLog = function () {
  var str = '{\n';
  _.forOwn(this, function (value, key) {
    str += '\n  ' + key + ': ' + value + ',';
  });
  str = str.slice(0, -1) + '\n}\n';
  return str;
};

NoteEvent.prototype.clone = function () {
  var clone = Object.create(NoteEvent.prototype);

  for (var key in this) {
    if (this.hasOwnProperty(key)) {
      clone[key] = this[key];
      continue;
    }
  }
  return clone;
}

NoteEvent.prototype.log = function () {
  console.log(this);
};
