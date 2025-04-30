const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const io = require('socket.io')(3001, { cors: { origin: '*' } });

const port = new SerialPort({ path: 'COM5', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

console.log("Monitoring...");

let lastPulse = 0;
let beatCount = 0;
let startTime = Date.now();

const threshold = 850; 
let previousPulseAboveThreshold = false;

parser.on('data', (data) => {
  const pulseValue = parseInt(data.trim());
  if (isNaN(pulseValue)) return;

  const currentTime = Date.now();

  // Detect rising edge (beat detected)
  if (pulseValue > threshold && !previousPulseAboveThreshold) {
    beatCount++;
    previousPulseAboveThreshold = true;
  } else if (pulseValue < threshold) {
    previousPulseAboveThreshold = false;
  }

  // Emit pulse value continuously for your graph
  io.emit('pulseData', pulseValue);

  // Every 15 seconds, calculate BPM
  if (currentTime - startTime >= 5000) { 
    const bpm = beatCount * 12; // scale to 60 seconds
    console.log(`BPM: ${bpm}`);
    io.emit('bpmData', bpm); // Send BPM to frontend if needed

    // Reset counters
    beatCount = 0;
    startTime = currentTime;
  }
});
