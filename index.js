var express = require('express');

var app = express();
var portapp = 3000;
var server = app.listen(portapp, () => { //Start the server, listening on port 3000.
    console.log("Listening to requests on port "+ portapp+" ...");
})

var io = require('socket.io')(server); //Bind socket.io to our express server.
app.use(express.static('public')); //Send index.html page on GET /

const SerialPort = require('serialport'); 
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('COM4'); //Connect serial port to port COM3. Because my Arduino Board is connected on port COM3. See yours on Arduino IDE -> Tools -> Port
let parser;
SerialPort.list((err, ports) => {
  if (err) {
    return console.log(err);
  }

  ports.forEach((path) => {
    console.log(path);

    let { comName } = path;

    const port = new SerialPort(comName, {baudRate: 9600}, console.log);
	port.on('data', console.log);
    parser = port.pipe(new Readline({delimiter: '\r\n'})); //Read the line only when new line comes.
    parser.on('data', (temp) => { //Read data    
		console.clear();
		var today = new Date();        		
		let hora = (today.getHours())+":"+(today.getMinutes())+":"+today.getSeconds();		   
		io.sockets.emit('temp', {time: hora, temp:temp}); //emit the datd i.e. {date, time, temp} to all the connected clients.    
		console.log( hora ); 
		//io.sockets.emit('temp', {date: today.getDate()+"/"+(today.getMonth()+1)+"/"+today.getFullYear(), time: (today.getHours())+":"+(today.getMinutes()), temp:temp}); //emit the datd i.e. {date, time, temp} to all the connected clients.    
		//io.sockets.emit('temp', {date: 10+"/"+(today.getMonth()+1)+"/"+today.getFullYear(), time: (11)+":"+(today.getMinutes()), temp:temp}); //emit the datd i.e. {date, time, temp} to all the connected clients.
	});

	io.on('connection', (socket) => {
		console.log("Someone connected."); //show a log as a new client connects.
	})
  });
});


