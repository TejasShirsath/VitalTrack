const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const io = require('socket.io')(3001, { cors: { origin: '*' } });

const port = new SerialPort({ path: 'COM5', baudRate: 9600 }); // note: 'path' is needed
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
console.log("Listening...")
parser.on('data', (data) => {
  const pulseValue = parseInt(data.trim());
  io.emit('pulseData', pulseValue);
});
