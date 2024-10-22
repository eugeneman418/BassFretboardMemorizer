// Variables for the strings and notes
const strings = ["E", "A", "D", "G"];
const notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];

// DOM elements
const stringDisplay = document.getElementById('string');
const noteDisplay = document.getElementById('note');
const timerLabel = document.getElementById('timerLabel');
const timeSlider = document.getElementById('timeSlider');
const startPauseButton = document.getElementById('startPauseButton');

// Default interval time
let intervalTime = parseInt(timeSlider.value) * 1000;
let intervalId;
let isRunning = false; // To track if the practice is running

// Web Audio API setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let clickSoundBuffer;

function noteFrequency(s, n) {
  //string s fret/note n
  openE = 41;
  openA = 41 * 2**(5/12);
  openD = 41 * 2**(10/12);
  openG = 41 * 2**(15/12);
  E = notes.indexOf("E");
  A = notes.indexOf("A");
  D = notes.indexOf("D");
  G = notes.indexOf("G");
  N = notes.indexOf(n);
  console.log("string: ",s);
  console.log("note: ",n);
  if (s === "E") {
    diff = (12 + N - E) % 12
    freq = openE * 2**(diff/12);
    console.log("frequency: ",freq);
    return freq;
  }
  if (s === "A") {
    diff = (12 + N - A) % 12;
    freq = openA * 2**(diff/12);
    console.log(freq);
    return freq;
  }
  if (s === "D") {
    diff = (12 + N - D) % 12
    freq = openD * 2**(diff/12);
    console.log(freq);
    return freq;
  }
  if (s === "G") {
    diff = (12 + N - D) % 12
    freq = openG * 2**(diff/12);
    console.log(freq);
    return freq;
  }
}

// Fetch or create the click sound
async function loadClickSound(frequency, duration=1) {
  // This is a simple "click" sound created with a sine wave and noise
  // Length of the click sound
  
  const scale = 1; //scale freqeuncy by a few octaves so it can be played on device
  
  // Create a short beep sound using oscillator
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = "triangle"; // Sine doesn't work for 41 Hz for some reason
  oscillator.frequency.value = frequency * scale;

  gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime); // Start at a very low volume (silent)
  gainNode.gain.exponentialRampToValueAtTime(1, audioContext.currentTime + 0.1); // Quick attack to full volume (0.1 seconds)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration); // Decay over the duration of the note
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration); // Stop after duration
}

// Play the click sound
function playClickSound(frequency, duration=1) {
  loadClickSound(frequency, duration);
}

// Update slider value display
timeSlider.addEventListener('input', () => {
  timerLabel.innerText = timeSlider.value;
  intervalTime = parseInt(timeSlider.value) * 1000;
  
  if (isRunning) {
    restartRandomizer(); // If the practice is running, adjust the interval time immediately
  }
});

// Randomly select a string and note
function randomizeNote() {
  randomString = strings[Math.floor(Math.random() * strings.length)];
  randomNote = notes[Math.floor(Math.random() * notes.length)];

  stringDisplay.textContent = `String: ${randomString}`;
  noteDisplay.textContent = `Note: ${randomNote}`;
  return {randomString, randomNote};
}

// Start the randomizer
function startRandomizer() {
  var {randomString, randomNote} = randomizeNote(); // Show the first note immediately
  frequency = noteFrequency(randomString, randomNote)
  playClickSound(frequency, intervalTime/1000/2); // Play click sound

  intervalId = setInterval(() => {
    var {randomString, randomNote} = randomizeNote(); // Change note every interval
    frequency = noteFrequency(randomString, randomNote)
    playClickSound(frequency, intervalTime/1000/2); // Play click sound
  }, intervalTime); // Randomize every 'intervalTime' milliseconds
}

// Stop the randomizer
function stopRandomizer() {
  clearInterval(intervalId);
}

// Restart the randomizer with a new interval time
function restartRandomizer() {
  stopRandomizer();
  startRandomizer();
}

// Start/Pause button functionality
startPauseButton.addEventListener('click', () => {
  if (isRunning) {
    stopRandomizer(); // Pause the practice
    startPauseButton.textContent = "Start Practice"; // Change button text to "Start"
  } else {
    startRandomizer(); // Start or resume the practice
    startPauseButton.textContent = "Pause Practice"; // Change button text to "Pause"
  }
  isRunning = !isRunning; // Toggle the running state
});
