//Serial Initialization
var SerialPort = require("serialport");
var serialPort = SerialPort;

//Set up Express & Sockets
var express = require('express');
var path = require('path');
var app = express();
var db = require('./db.js');
var bodyParser = require('body-parser');
// var refreshItem = ["0:0:0, 0:1:0, 0:2:0, 0:3:0, 0:4:0, 0:5:0, 0:6:0, 0:7:0, 1:0:0, 1:1:0, 1:2:0, 1:3:0, 1:4:0, 1:5:0, 1:6:0, 1:7:0, 2:0:0, 2:1:0, 2:2:0, 2:3:0, 2:4:0, 2:5:0, 2:6:0, 2:7:0, 3:0:0, 3:1:0, 3:2:0, 3:3:0, 3:4:0, 3:5:0, 3:6:0, 3:7:0, 4:0:0, 4:1:0, 4:2:0, 4:3:0, 4:4:0, 4:5:0, 4:6:0, 4:7:0, 5:0:0, 5:1:0, 5:2:0, 5:3:0, 5:4:0, 5:5:0, 5:6:0, 5:7:0, 6:0:0, 6:1:0, 6:2:0, 6:3:0, 6:4:0, 6:5:0, 6:6:0, 6:7:0, 7:0:0, 7:1:0, 7:2:0, 7:3:0, 7:4:0, 7:5:0, 7:6:0, 7:7:0"];
var counter = 0;

//Define a port to run on 
app.set ('port', 8080);

//Middleware 
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//listen for requests
var server = app.listen(app.get('port'), function(){
	let port = server.address().port;
	console.log("Its running on port " + port);
});

var initialPeople = [];

//Api for Connection test, prints success on the Client
app.use('/test' , function(req,res){
  res.json({message:"success"});
} );

app.get('/people' , function(req,res){
	let initial = db.getPeople();
  res.json(initial);
  console.log(initial);
  db.people = initial;
});

app.post('/addPerson', function(req, res){
   console.log(req.body);
   db.people.push(req.body);
   console.log(db.people);
   res.json(db.people);
   db.savePeople(db.people);
  console.log("db is" + db.people);

});

app.get('/refresh' , function(req,res){
 res.json({message:"success"});	

var sendChar = ('z');
console.log(sendChar);
port.write(sendChar);	


});

app.get('/loadDesign' , function(req,res){
let initial = db.getPeople();
let first = initial[0].id;
let current = initial[counter];
res.json(current);
console.log("current is: " + current);

var theLeds = current.savedLEDs;
for (item of theLeds) {
	console.log(item);
	itemMod = item + '\0';
	console.log(itemMod);
	port.write(itemMod);
}
counter = counter + 1;
if (counter == initial.length){
	counter = 0;
}

// let current = initial[(Math.floor(Math.random() * parseInt(initial.length))+2)];
// res.json(current);
// console.log(current);
// var theLeds = current.savedLEDs;

// for (item of theLeds) {
// console.log(item);
// itemMod = item + '\0';
// console.log(itemMod);
// port.write(itemMod);	
// }
// let send = "5:1:1";
// let dataMod = send + '\0';
// console.log("data to send is" + send);
// port.write(dataMod);
});

//Set up Web Sockets
var io = require('socket.io')(server);

//Set up the Columns for the LEDs
var cols_state = new Array();
cols_state[0] = [1, 1, 1, 1, 1, 1, 1, 1];
cols_state[1] = [1, 1, 1, 1, 1, 1, 1, 1];
cols_state[2] = [1, 1, 1, 1, 1, 1, 1, 1];
cols_state[3] = [1, 1, 1, 1, 1, 1, 1, 1];
cols_state[4] = [1, 1, 1, 1, 1, 1, 1, 1];
cols_state[5] = [1, 1, 1, 1, 1, 1, 1, 1];
cols_state[6] = [1, 1, 1, 1, 1, 1, 1, 1];
cols_state[7] = [1, 1, 1, 1, 1, 1, 1, 1];

//Connect the State of the Columns to Web Socket on Load

//On Socket Connection
io.on('connection', function(socket){
	socket.emit('start', cols_state);
	console.log('connected');
//Update if Receive a Button Click
socket.on('click', function(data) {
	// console.log("The data is " + data);
	socket.broadcast.emit('waiting', data);
	let dataMod = data + '\0';
	console.log(dataMod);
	port.write(dataMod); //send the data to serial port
});

//when user disconnects, do this
socket.on('fdisconnect', function(){
	socket.disconnect('unauthorized');
});

//handle errors
socket.on('error', function(er) {
	console.log("There was an error: " + er)
});


});

io.sockets.on('error', function(er) { console.log('A big error: ' + error) });

//Set up the Serial Port
var port = new SerialPort("/dev/tty.usbmodem1411", { ///dev/tty.SLAB_USBtoUART ttyACMO
    parser: serialPort.parsers.readline("\n"),
    baudrate: 9600
});

port.on("open", function () {
  console.log('open');
  port.on('data', function(data) {
    console.log('data received: ' + data);
	
	if (data != 'z') {
			io.sockets.emit('update', data);

if (data.length < 5) {
	var holder = data.split(":");
	holder[2] = parseInt(holder[2]);
	switch (holder[2]){
		case 0:
			cols_state[holder[0]][holder[1]] = 1;
			break;
		case 1:
			cols_state[holder[0]][holder[1]] = 0;
			break;
		case 2:
			return;
			break;
		case 3:
			return;
			break;
		case 4:
			return;
			break;
		case 5:
			return;
			break;
		case 6:
			return;
			break;
	}
}
}
	
  });

  port.write("ls\n", function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
  });
});

