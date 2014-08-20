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



// w
// var myval=0;

// if (jsarguments.length>1)
//     myval = jsarguments[1];

// function bang()
// {
//     outlet(0,"myvalue","is",myval);
// }

// function msg_int(v)
// {
//     post("received int " + v + "\n");
//     myval = v;
//     bang();
// }

// function msg_float(v)
// {
//     post("received float " + v + "\n");
//     myval = v;
//     bang();
// }

// function list()
// {
//     var a = arrayfromargs(arguments);
//     post("received list " + a + "\n");
//     myval = a;
//     bang();
// }

// function anything()
// {
//     var a = arrayfromargs(messagename, arguments);
//     post("received message " + a + "\n");
//     myval = a;
//     bang();
// }


// outlets = 6;

// tempo = 120;
// lengthOfPiece = 1;
// weights = { 1 : Array(), 2 : Array(), 3 : Array(), 4 : Array() }

// // CHANGE ALL DEFAULTS TO AVERAGE OF CHOSENS
// function setDefaults( t ) {
//     var chosenCount = 1;
//     var chosenTotal = 0;
//     var w = weights[ t ];
//     for ( var i = 0; i < 16; i++ ) {
//         if ( w[ i ] > 1 ) {
//             chosenTotal = chosenTotal + w[ i ];
//             chosenCount++;
//         }
//     }

//     var avg = Math.round( chosenTotal / ( chosenCount - 1 ) );
//     for ( var i = 0; i < 16; i++ ) {
//         if ( w[ i ] == 1 ) {
//             w[ i ] = avg;
//         }
//     }

// } // end setDefaults()

// function setWeights ( t , i, v ) {
//     var w = weights[ t ];
//     w[ i ] = v;
//     setDefaults( t );
//     /*    DEBUG */
//     outlet( 5, weights[1] + ' - ' + weights[2] + ' - ' + weights[3] + ' - ' + weights[4] );
//     outlet( t, w );
// } // end setWeights()

// function length( l ) {
//     lengthOfPiece = l;
// }

// function buildTracks() {
//     outlet( 5, 'Running' );
//     var tempoFactor = 60 / tempo;
//     // GET GREATEST WEIGHT AND SET RANDOM(MAX) TO 10 PERCENT ABOVE
//     var greatestWeight = { 1 : '1' , 2 : '1' , 3 : '1' , 4 : '1' }

//     for (var t = 1; t <= 4; t++ ) {
//         var w = weights[ t ];
//         for ( var s = 0; s < 16; s++ ) {

//             if ( w[ s ] > greatestWeight[ t ] ) {
//                 greatestWeight[ t ] = w[ s ];
//             }
//         }
//     }

//     // FOR EACH BAR, CYCLE THROUGH BEATS COMPARING WEIGHTS TO RANDOM NUMBER
//     var previousOntime = 0;
//     for( var b = 0; b < lengthOfPiece; b++ ) {

//         for ( var s = 0; s < 16; s++ ) {

//             for ( var t = 1; t <= 4; t++ ) {
//                 var w = weights[ t ];
//                 var randomVal = Math.round( Math.random() * ( greatestWeight[ t ] * 1.1 ) );
//                 if ( randomVal < w[ s ] ) {
//                     // CREATE EVENT
//                     var ontime = Math.round( ( b * ( tempoFactor * 4000) ) + ( s * ( tempoFactor * 250 ) ) );
//                     var dT = ontime - previousOntime;
//                     previousOntime = ontime;
//                     var vel = Math.round( ( ( w[ s ] - randomVal ) / w[ s ] ) * 127 );
//                     var dur =  Math.round( ( ( w[ s ] - randomVal ) / w[ s ] ) * ( tempoFactor * 500 ) );
//                     outlet( 0, Array( dT, t * 30, vel, dur, t) );
//                 } // end if
//             } // end for 4
//         } // end for 16
//     } // end for length
//     outlet( 5, 'Done' );
// } // end buildTrack()

// /*
// There are 16 steps. Each one is assigned a weight. The greatest weight becomes the range for a random number generator. A random number is generated, if it is less than the weight of the step, the step is on. The greatest weight is guaranteed to be on. The default weight for any step is the average of all the chosen weights. For the interface, a weight of 1 is default and a weight of 0 is off.
// */
