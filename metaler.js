// detailed color algorithm
// * evaluate 3 colors to a macro rhythm
// * example:
//   * B , F,0,0,0,0, 7, F,0,0,0,0, F,F,0,0,0,0, 4,0,0,0,0,0, E,5,0,0,0,0
//   * 12,15,0,0,0,0, 7,15,0 ...
//   * ^ that become a macro beat that every intstrument hits on, like: hit -> rest 11 beats, hit, rest 14 beats, hit, hit, hit ...
// * pick a different color scheme and use it to dirty-up the macro beat for the drum part
// * repeat for bass
// * repeat for guitar
var  _ = require('lodash');
var Colors = require('./Colors');
var EventList = require('./EventList');
var NoteEvent = require('./NoteEvent');
var timeUnit = 100;
var carryPitchInToMacroBeat = Math.random > .6;

require('./lodash-mixins');

// compose
function createMacroRhythmMap (self, colors) {
  var repeat = 10;
  var deltas = [];
  // delta times
  _.each(colors, function (color) {
    deltas = deltas.concat(self.toDeltas(color));
  });
  // convert macro to on times
  var count = 0;
  var accumulated = [0];
  while (repeat--) {
    _.each(deltas, function (delta) {
      count += delta + self.timeUnit;
      accumulated.push(count);
    });
  }
  // assign back to the object
  self.macro = accumulated;
}

function createBassLine (self, colors) {
  var repeat = 10;
  var onTimes = [];
  var pitches = [];
  var velocities = [];
  var lastOnTime = 0;

  _.each(colors, function (color) {
    // on times
    onTimes = onTimes.concat(self.toOnTimes(color, lastOnTime));
    lastOnTime = onTimes[onTimes.length - 1];
    // pitches
    pitches = pitches.concat(self.toPitches(color, 20, 40));
  });
  // create note events
  var onTimesClone = _.clone(onTimes);
  var pitchesClone = _.clone(pitches);
  var macroClone = _.clone(self.macro);

  var events = new EventList();
  events.accumulate(onTimesClone, pitchesClone, macroClone, carryPitchInToMacroBeat);
  events.repeat(10);

  self.events.bass = events;
}

function createDrums (self, colors) {
  // repeat below as many times as possible between macro beats
  // perhaps add drum-specific colors accents, but first try without
  // hh: x   x   x   x   x   x   x     x
  //  s:   x     x   x x   x     x   x   x
  //  b: x   x x   x     x   x     x
  var events = new EventList();
  //console.info('self.macro', self.macro); // @test
  for (var i = 0; i < 10000; i = i + self.timeUnit) {
    // @todo ready to make rhythm map for drum and compare with it in this loop to make the note events
  }
}

function createMetronome (self, colors) {
  var events = new EventList();
  var metronomeUnit = self.timeUnit * 4;
  // count total time units
  var clicks = Math.ceil(self.events.bass.getEvent(self.events.bass.length() - 1).time / metronomeUnit) + 1;
  while (clicks--) {
    events.push(new NoteEvent(clicks * metronomeUnit, 80, 70, 100, 1, 2, 0, 0));
  }

  self.events.metronome = events;
}

var callbacks = [
  createMacroRhythmMap,
  createBassLine,
  createDrums,
  createMetronome
];

var colorsSets = [
  // reds
  ['BF0000', '7F0000', 'FF0000', '400000', 'E50000'],
  // analogous
  ['2DFF63', 'E86429', '3AA3FF', 'E8D25F', 'B62DFF'],
  ['2DFF63', 'E86429', '3AA3FF', 'E8D25F', 'B62DFF']
];

var colors = new Colors(callbacks, colorsSets, timeUnit, 6);
var events = new EventList();

events.merge(colors.events.bass, colors.events.metronome);
events.dump();

