var _ = require('lodash');

module.exports = Colors;

// @todo make this inherit a CompositionObect interface or something to standardize a way of writing
function Colors (callbackSet, colorsSet, timeUnit) {
  this.deltas = [];
  this.durations = [];
  this.pitches = [];
  this.velocities = [];
  this.colorsSet = colorsSet;
  this.timeUnit = timeUnit;
  this.accumulatedDelta = 0;
  this.events = {};
  // waterfall through composition callbacks
  var self = this;
  _.each(callbackSet, function (callback, index) {
    callback(self, colorsSet[index]);
  });
}

Colors.prototype.toDeltas = function (hex) {
  var self = this;
  return _.map(hex, function (hexValue) {
    return parseInt(hexValue, 16) * self.timeUnit;
  });
}

Colors.prototype.toOnTimes = function (hex, offset) {
  var self = this;
  hex = _.map(hex, function (hexValue) {
    var delta = parseInt(hexValue, 16) * self.timeUnit;
    var onTime = delta + offset;
    offset += delta;
    return onTime;
  });

  return hex;
}

Colors.prototype.toPitches = function (hex, limit, offset) {
  return _.map(hex, function (hexValue) {
    return _.normalize(parseInt(hexValue, 16), 12, limit, offset);
  });
}
