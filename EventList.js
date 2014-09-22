module.exports = EventList;
var NoteEvent = require('./NoteEvent');
var _ = require('lodash');
var fs = require('fs');

function EventList (name) {
  this.name = name;
  // @todo make this truly private
  this.events = [];
}

EventList.prototype.push = function (noteEvent) {
  this.events.push(noteEvent);
};

EventList.prototype.getEvent = function (index) {
  return this.events[index];
};

EventList.prototype.push = function (noteEvent) {
  this.events.push(noteEvent);
};

EventList.prototype.length = function () {
  return this.events.length;
};

EventList.prototype.repeat = function (repetitions) {
  var base = 0;
  var repeated = [];
  for (var i = 0; i < repetitions; i++) {
    repeated = repeated.concat(_.map(this.events, function (e) {
      // @todo this can be native after moving out of max and in to node
      var eClone = _.create(e, e);
      eClone.time += base;
      return eClone;
    }));
    base = repeated[repeated.length - 1].time;
  }
  this.events = repeated;
};

EventList.prototype.normalize = function (key, limit) {
  var self = this;
  // default, normalize velocity, limit 127
  if (!key) {
    key = 'velocity';
  }
  if (!limit) {
    limit = 127;
  }
  // ensure collection has objects containing key
  if (!(this.events.length && this.events[0][key])) {
    return this.events;
  }
  var highest = _.max(this.events, key)[key];

  this.events = _.map(this.events, function (noteEvent) {
    // value / highest = newValue / limit
    noteEvent[key] = Math.ceil((limit * noteEvent[key]) / highest) + (offset || 0);
  });
};

EventList.prototype.merge = function () {
  // concat all events
  var i = arguments.length;
  while (i--) {
    this.events = this.events.concat(arguments[i].events);
  }
  // sort
  this.events = this.events.sort(function (eventA, eventB) {
    return eventA.time - eventB.time;
  });
};

EventList.prototype.accumulate = function (name, onTimes, pitches, macro, carryPitchToMacro) {
  if (!(onTimes.length && pitches.length)) {
    return this.events;
  }
  var onTime = onTimes.shift();
  var pitch = pitches.shift();
  var currentMacro = macro.shift();
  // add macro event
  if (currentMacro !== undefined && onTime >= currentMacro) {
    this.events.push(new NoteEvent({
      name: name,
      time: currentMacro,
      pitch: pitch,
      velocity: 100,
      duration: 90,
      channel: 1,
      track: 1,
      extra1: 0,
      extra2: 0
    }));
    if (onTime !== currentMacro) {
      onTimes.unshift(onTime);
      if (carryPitchToMacro) {
        pitches.unshift(pitch);
      }
    }
    return this.accumulate(name, onTimes, pitches, macro, carryPitchToMacro);
  }
  // add instrument event
  if (onTime !== currentMacro) {
    this.events.push(new NoteEvent({
      name: name,
      time: onTime,
      pitch: pitch,
      velocity: 100,
      duration: 90,
      channel: 1,
      track: 1,
      extra1: 0,
      extra2: 0
    }));
    macro.unshift(currentMacro);
  }
  return this.accumulate(name, onTimes, pitches, macro, carryPitchToMacro);
}

// utility
EventList.prototype.log = function (label) {
  if (label) {
    console.log('************* ' + label.toUpperCase() + ' **************\n');
  }

  for (var i = 0, l = this.events.length; i < l; i++) {
    this.events[i].log();
  }
};

EventList.prototype.dump = function () {
  var self = this;
  var dump = '';
  _.each(this.events, function (noteEvent, index) {
    var e = noteEvent.clone();
    // on-time to delta
    var previous = (self.events[index - 1] || {time: 0}).time;
    e.time -= previous;
    dump += e;
  });
  fs.writeFile('./output/eventlist.txt', dump, function () {
    console.log('DUMPED FILE');
  });
}

