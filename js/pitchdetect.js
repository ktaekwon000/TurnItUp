/*
The MIT License (MIT)

Copyright (c) 2014 Chris Wilson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const MAX_ROUND = 5;

// define quotes to be used
let quotes_array = [
  "Push your limit",
  "Success is on the way",
  "Wake up bro",
  "It is showtime",
  "Learning is so fun",
  "The man turned around"
];

// let quotes_array = [
//   "A",
//   "B",
//   "C",
//   "D",
//   "E",
//   "F",
//   "G"
// ];

// selecting required elements
let timer_text = document.querySelector(".curr_time");
let accuracy_text = document.querySelector(".curr_accuracy");
let error_text = document.querySelector(".curr_errors");
let cpm_text = document.querySelector(".curr_cpm");
let wpm_text = document.querySelector(".curr_wpm");
let quote_text = document.querySelector(".quote");
let input_area = document.querySelector(".input_area");
let restart_btn = document.querySelector(".restart_btn");
let cpm_group = document.querySelector(".cpm");
let wpm_group = document.querySelector(".wpm");
let error_group = document.querySelector(".errors");
let accuracy_group = document.querySelector(".accuracy");
let round_text = document.querySelector(".curr_round");

let timeElapsed = 0;
let total_errors = 0;
let errors = 0;
let accuracy = 0;
let characterTyped = 0;
let current_quote = "";
let quoteNo = 0;
let roundNo = 0;
let game_timer = null;
let isPlayingGame = false;

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = null;
var isPlaying = false;
var sourceNode = null;
var analyser = null;
var theBuffer = null;
var DEBUGCANVAS = null;
var mediaStreamSource = null;
var canvasContext = null;
var WIDTH = 30;
var HEIGHT = 220;
var slider, sliderValElem;
var timer = 0;
var randomVowel;

// https://stackoverflow.com/a/12646864
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

window.onload = function () {
  //activate microphone
  toggleLiveInput();

  let randomVal = Math.random();
  if (randomVal <= 0.2) {
    randomVowel = "a";
  } else if (randomVal <= 0.4) {
    randomVowel = "e";
  } else if (randomVal <= 0.6) {
    randomVowel = "i";
  } else if (randomVal <= 0.8) {
    randomVowel = "o";
  } else if (randomVal <= 1.0) {
    randomVowel = "u";
  }
  document.getElementById("vowelIndicator").innerText =
    "The random vowel chosen is " + randomVowel + ".";

  canvasContext = document.getElementById("meter").getContext("2d");

  slider = document.getElementById("myRange");
  sliderValElem = document.getElementById("sliderVal");
  sliderValElem.innerHTML = slider.value;
  slider.oninput = function () {
    sliderValElem.innerHTML = this.value;
  };

  this.addEventListener("keydown", (event) => {
    if (event.keyCode >= 65 && event.keyCode <= 90) {
      if (event.key != randomVowel) {
        let origString = document.getElementById("maininput").value;
        document.getElementById("maininput").value =
          origString.substring(0, origString.length - 22) +
          event.key +
          origString.substring(origString.length - 22);
          processCurrentText();
      }
      
    }
  });

  shuffleArray(quotes_array);
};

function updateQuote() {
 if (quoteNo >= MAX_ROUND) {
    finishGame();
    return;
  }

  quote_text.textContent = null;
  current_quote = quotes_array[quoteNo];

  // separate each character and make an element
  // out of each of them to individually style them
  current_quote.split("").forEach((char) => {
    const charSpan = document.createElement("span");
    charSpan.innerText = char;
    quote_text.appendChild(charSpan);
  });

  // roll over to the first quote
  quoteNo++;
  roundNo++;
}

function processCurrentText() {
  console.log('calling processCurrentText');
  // get current input text and split it
  let curr_input = input_area.value;
  curr_input = input_area.value.substring(0, curr_input.length - 22);
  curr_input_array = curr_input.split('');

  // increment total characters typed
  characterTyped++;

  errors = 0;

  quoteSpanArray = quote_text.querySelectorAll('span');
  quoteSpanArray.forEach((char, index) => {
    let typedChar = curr_input_array[index]

    // characters not currently typed
    if (typedChar == null) {
      char.classList.remove('correct_char');
      char.classList.remove('incorrect_char');

      // correct characters
    } else if (typedChar === char.innerText) {
      char.classList.add('correct_char');
      char.classList.remove('incorrect_char');

      // incorrect characters
    } else {
      char.classList.add('incorrect_char');
      char.classList.remove('correct_char');

      // increment number of errors
      errors++;
    }
  });

  // display the number of errors
  error_text.textContent = total_errors + errors;

  // update accuracy text
  let correctCharacters = (characterTyped - (total_errors + errors));
  let accuracyVal = ((correctCharacters / characterTyped) * 100);
  accuracy_text.textContent = Math.round(accuracyVal);

  console.log(curr_input)
  console.log(current_quote)

  // if current text matches the quote
  if (curr_input==current_quote) {
    updateQuote();

    // update total errors
    total_errors += errors;

    // clear the input area
    input_area.value = "←(Your cursor is here)";
    
    // increment round no
    round_text.textContent = roundNo;
  }
}

function updateTimer() {
    // increase the time elapsed
    timeElapsed++;

    // update the timer text
    timer_text.textContent = timeElapsed + "s";
  //}
}

function finishGame() {
  // stop the timer
  clearInterval(game_timer);

  // disable the input area
  input_area.disabled = true;

  // show finishing text
  quote_text.textContent = "Click on restart to start a new game.";

  // display restart button
  restart_btn.style.display = "block";

  // calculate cpm and wpm
  cpm = Math.round(((characterTyped / timeElapsed) * 60));
  wpm = Math.round((((characterTyped / 5) / timeElapsed) * 60));

  // update cpm and wpm text
  cpm_text.textContent = cpm;
  wpm_text.textContent = wpm;

  // display the cpm and wpm
  cpm_group.style.display = "block";
  wpm_group.style.display = "block";
  
  shuffleArray(quotes_array);
}

function startGame() {
  if (!isPlayingGame) {
    resetValues();
    updateQuote();
  }
  isPlayingGame = true;

  // clear old and start a new timer
  clearInterval(game_timer);
  game_timer = setInterval(updateTimer, 1000);
}

function resetValues() {
  timeElapsed = 0;
  errors = 0;
  total_errors = 0;
  accuracy = 0;
  characterTyped = 0;
  quoteNo = 0;
  roundNo = 0;
  isPlayingGame = false;
  input_area.disabled = false;

  input_area.value = "←(Your cursor is here)";
  quote_text.textContent = 'Click on the area below to start the game.';
  accuracy_text.textContent = 100;
  timer_text.textContent = timeElapsed + 's';
  error_text.textContent = 0;
  restart_btn.style.display = "none";
  cpm_group.style.display = "none";
  wpm_group.style.display = "none";
  round_text.textContent = 1;

  shuffleArray(quotes_array);
}

function error() {
  alert("Stream generation failed.");
}

function getUserMedia(dictionary, callback) {
  try {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    navigator.getUserMedia(dictionary, callback, error);
  } catch (e) {
    alert("getUserMedia threw exception :" + e);
  }
}

function gotStream(stream) {
  // Create an AudioNode from the stream.
  mediaStreamSource = audioContext.createMediaStreamSource(stream);

  // Connect it to the destination.
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  mediaStreamSource.connect(analyser);
  updatePitch();
}

function toggleLiveInput() {
  audioContext = new AudioContext();
  MAX_SIZE = Math.max(4, Math.floor(audioContext.sampleRate / 1000)); // corresponds to a 1kHz signal

  if (isPlaying) {
    //stop playing and return
    sourceNode.stop(0);
    sourceNode = null;
    analyser = null;
    isPlaying = false;
    if (!window.cancelAnimationFrame)
      window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
    window.cancelAnimationFrame(rafID);
  } else {
    getUserMedia(
      {
        audio: {
          mandatory: {
            googEchoCancellation: "false",
            googAutoGainControl: "false",
            googNoiseSuppression: "false",
            googHighpassFilter: "false",
          },
          optional: [],
        },
      },
      gotStream
    );
  }
}

var rafID = null;
var tracks = null;
var buflen = 2048;
var buf = new Float32Array(buflen);

var noteStrings = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

function noteFromPitch(frequency) {
  var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  return Math.round(noteNum) + 69;
}

function frequencyFromNoteNumber(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function autoCorrelate(buf, sampleRate) {
  // Implements the ACF2+ algorithm
  var SIZE = buf.length;
  var rms = 0;

  for (var i = 0; i < SIZE; i++) {
    var val = buf[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < slider.value)
    // not enough signal
    return -1;

  var r1 = 0,
    r2 = SIZE - 1,
    thres = 0.2;
  for (var i = 0; i < SIZE / 2; i++)
    if (Math.abs(buf[i]) < thres) {
      r1 = i;
      break;
    }
  for (var i = 1; i < SIZE / 2; i++)
    if (Math.abs(buf[SIZE - i]) < thres) {
      r2 = SIZE - i;
      break;
    }

  buf = buf.slice(r1, r2);
  SIZE = buf.length;

  var c = new Array(SIZE).fill(0);
  for (var i = 0; i < SIZE; i++)
    for (var j = 0; j < SIZE - i; j++) c[i] = c[i] + buf[j] * buf[j + i];

  var d = 0;
  while (c[d] > c[d + 1]) d++;
  var maxval = -1,
    maxpos = -1;
  for (var i = d; i < SIZE; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }
  var T0 = maxpos;

  var x1 = c[T0 - 1],
    x2 = c[T0],
    x3 = c[T0 + 1];
  a = (x1 + x3 - 2 * x2) / 2;
  b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}

function updatePitch(time) {
  analyser.getFloatTimeDomainData(buf);
  var ac = autoCorrelate(buf, audioContext.sampleRate);

  canvasContext.clearRect(0, 0, WIDTH, HEIGHT);

  if (ac == -1) {
    canvasContext.fillRect(0, 0, WIDTH, 0);

    timer = 0;
  } else {
    pitch = ac;

    if (timer == 0) {
      let origString = document.getElementById("maininput").value;
      if (pitch < 130) {
        document.getElementById("maininput").value =
          origString.substring(0, origString.length - 23) +
          origString.substring(origString.length - 22);
        canvasContext.fillStyle = "#82e85b";
        processCurrentText();
      } else if (pitch >= 130 && pitch < 180) {
        document.getElementById("maininput").value =
          origString.substring(0, origString.length - 22) +
          " " +
          origString.substring(origString.length - 22);
        canvasContext.fillStyle = "#ffd135";
        processCurrentText();
      } else if (pitch >= 180) {
        document.getElementById("maininput").value =
          origString.substring(0, origString.length - 22) +
          randomVowel +
          origString.substring(origString.length - 22);
        canvasContext.fillStyle = "#ff351f";
        processCurrentText();
      }
    }

    canvasContext.fillRect(0, HEIGHT - pitch * HEIGHT / 200, WIDTH, pitch * HEIGHT / 200 - 80);

    timer++;
    timer = timer % 10;
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = window.webkitRequestAnimationFrame;
  rafID = window.requestAnimationFrame(updatePitch);
}
