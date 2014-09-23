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
  var repeat = 1;
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

  var events = new EventList('bass');
  events.accumulate('bass', onTimesClone, pitchesClone, macroClone, carryPitchInToMacroBeat);
  events.repeat(repeat);

  self.events.bass = events;
}

function createDrums (self, colors) {
  // repeat below as many times as possible between macro beats
  // perhaps add drum-specific colors accents, but first try without
  var events = {
    highHat: new EventList('highHat'),
    snare: new EventList('snare'),
    bassDrum: new EventList('bassDrum')
  };
  var rhythm = {
    highHat : 'x x x x x x x x x x x x x x x x x ',
    snare   : ' x  x xx x  x x x x  x xx x  x x x',
    bassDrum: 'x xx x  x x  x   x xx x  x x  x   '
  };
  var pitches = {
    highHat: '80',
    snare: '75',
    bassDrum: '60'
  };
  var velocities = {
    highHat: '84',
    snare: '95',
    bassDrum: '127'
  };
  // set limit for length of bass track
  var limit = getLastBassOnTime(self) / self.timeUnit;
  var rhythmIndex;
  // get the length of the seed rhythm
  var length = rhythm[_.findKey(rhythm, function () {
    return true;
  })].length;
  var onTime;;
  var limitIndex = 0;
  var currentMacroIndex = 0;
  var currentMacro = 0;
  var currentLimit;
  while (limitIndex < limit) {
    currentMacro = self.macro[currentMacroIndex] - currentMacro;
    console.info('currentMacro', currentMacro); // @test
    currentLimit = currentMacro / self.timeUnit;
    console.info('currentLimit', currentLimit); // @test
    console.info('limitIndex', limitIndex); // @test
    for (var i = 0; i < currentLimit; i++) {
      rhythmIndex = i % length;
      onTime = (i + limitIndex) * self.timeUnit;
      _.forOwn(rhythm, function (hits, instrument) {
        if (hits.charAt(rhythmIndex) === 'x') {
          events[instrument].push(new NoteEvent({
            name: instrument,
            time: onTime,
            pitch: pitches[instrument],
            velocity: velocities[instrument],
            duration: 50,
            channel: 1,
            track: 2,
            extra1: 0,
            extra2: 0
          }));
        }
      });
      limitIndex++;
    }
    currentMacroIndex++;
  }

  _.extend(self.events, events);
}

function createMetronome (self, colors) {
  var events = new EventList('metronome');
  var metronomeUnit = self.timeUnit * 4;
  // count total time units
  var clicks = Math.ceil(getLastBassOnTime(self) / metronomeUnit) + 1;
  while (clicks--) {
    events.push(new NoteEvent({
      name: 'metronome',
      time: clicks * metronomeUnit,
      pitch: 80,
      velocity: 1,
      duration: 100,
      channel: 1,
      track: 2,
      extra1: 0,
      extra2: 0
    }));
  }

  self.events.metronome = events;
}

var callbacks = [
  createMacroRhythmMap,
  createBassLine,
  createDrums,
  //createMetronome
];

var colorsSets = [
  // reds
  ['BF0000', '7F0000', 'FF0000', '400000', 'E50000'],
  // analogous
  ['2DFF63', 'E86429', '3AA3FF', 'E8D25F', 'B62DFF'],
  ['2DFF63', 'E86429', '3AA3FF', 'E8D25F', 'B62DFF'],
  //['2DFF63', 'E86429', '3AA3FF', 'E8D25F', 'B62DFF']
];

var colors = new Colors(callbacks, colorsSets, timeUnit, 6);
var events = new EventList();

events.merge(
  colors.events.bass,
  colors.events.highHat,
  colors.events.snare,
  colors.events.bassDrum
  //colors.events.metronome
);
//console.info('events', events); // @test
events.dump();

// convenience
function getLastBassOnTime (self) {
  return self.events.bass.getEvent(self.events.bass.length() - 1).time;
}

