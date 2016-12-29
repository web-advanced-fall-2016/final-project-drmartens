# D'Light 
## Proof of Concept Prototype

![D'Light screen shot](https://github.com/web-advanced-fall-2016/final-project-drmartens/blob/master/dLight.jpg =250x)


[D'Light Prototype Video - Creating & Loading Designs](https://www.youtube.com/watch?v=CmKSsmvMHNY)

This project was created for my Web Advanced: Javascript class at Parsons School of Design.

D'Light is a technical proof of concept for my Thesis project, D'Art, exploring the intersection of emerging decentralizing technologies and artistic practice/speculative design. The final project will allow users to purchase a block of LED lights in a large interactive sculpture using an existing or created blockchain protocol(e.g. [Ethereum](https://www.ethereum.org/), [21.co](https://21.co/), [Bitcoin](https://bitcoin.org/en/). Owners can programm their group of LEDs however they like and work to create larger designs with neighboring owners, or not.

This Proof of Concept project, D'Light, explores the functionality needed to allow users to program a LED matrix from a web interface, save their design, and browse saved designs that show up on the LED matrix.

For this first prototype, I decided to honor some of cryptography, encryption roots in the cypherpunk and cyberpunk movements in fiction. This aesthetic represents the power of decentralization through technology, using tech to create new ways to collaborate, share resources and value, and ultimately understand the notion of power in a rapidly changing world.


### Core Functionality
* Program a design on an 8x8 pixel LED matrix using a web interface
* Users can enter their name and save their design to a database
* The database is saved ensuring stored data can be retrieved even if page is refreshed or server fails
* Users can browse saved designs from other users on a separate page. They can see the name of the user on the website and their design on the LED matrix. 


### Materials
 * [LED Matrix Module](https://www.tindie.com/products/rajbex/easy-matrix-a-cascadable-led-matrix-module-kit/) -  (Integrated circuit containing 8x8 Red LED Matrix and MAX7219 chip that is cascadable and can chain several LED matrixes together.)
 * [Arduino Uno] (https://www.arduino.cc/en/Main/ArduinoBoardUno)
 * [Female-Female Craft Wires] (https://www.adafruit.com/products/1951?gclid=Cj0KEQiAv4jDBRCC1IvzqqDnkYYBEiQA89utoiyUbkkT5Y6ciG9qhX8rwzOj3houWIJCFyaAdefRgTwaAnCQ8P8HAQ)
 * 9 x 12 canvas
 * Gold spray paint
 * Assorted wires, circuits, parts from the electronics trash bin on D12 at Parsons
 
### How to Run this Code
Clone or download and unzip the contents of this folder onto your computer. 

##### Set Up the LED Matrix
For this project, I used an [buildable LED matrix kit](https://www.tindie.com/products/rajbex/easy-matrix-a-cascadable-led-matrix-module-kit/) from Tindie.com. It comes with a Max7219 chip, an integrated circuit board and necessary resistors, pins etc. 

1. Assemble the LED matrix according to the [instructions](https://d3s5r33r268y59.cloudfront.net/datasheets/3519/2014-11-01-02-54-42/AssemblyInstructions_EasyMatrix_V1.0.pdf)
2. Connect the LED Matrix to an Arduino Uno. 
	+ pin 12 is connected to the DataIn 
	+ pin 11 is connected to the CLK 
	+ pin 10 is connected to LOAD 
	+ 5v is connected to VCC
	+ Ground is connected to Gnd


##### Setup the Arduino
Open the ledMatrixController.ino file using the Arduino IDE.
Download and include the LEDControl library referenced below. 
Compile the code and upload it to your Arduino Uno board.

Plug your Arduino Uno into the Serial Port on your computer or Raspberry Pi (note if using a raspberry Pi, 'let' commands in javascript must all be changed to 'var' in order for it to work).

Make sure the port you have your Arduino plugged into is the same port in the Server.js file. For my project the port was `/dev/tty.usbmodem1411`. 

##### Setup & Run the Server
Before trying to run the code, you must download the following dependencies from NPM using the `npm -install` command.

+ serialport
+ socket.io
+ express    
+ bodyParser
+ path
+ fs

When all dependencies have been installed, navigate to the folder in terminal and type `node server.js` to start the server on `localhost:8080`.


##### Access the Web Client to Create/See Saved Designs
Open a web browser of your choice and navigate to 
`http://localhost:8080`. This will bring you to the Index page of the website where you can program your LED Matrix. Click the cells on the table and make sure they turn red and that the correct LED is lighting up on your Matrix (you may have to rotate it clockwise or counterclockwise depending on your assembly).

Type your name into the input box and click save when you are finished with your design. A confirmation pop-up will appear.

Navigate to the Saved Designs page to see your design and load other users designs by clicking on the "next" button.

 
 
### Libraries, References & Styling
 Below are the the references, libraries, and examples I used for this project, sorted by the part of the client-server-database-electronic interface they were used for. 

#### Arduino Libraries & Examples
* [Arduino 1.8.0 IDE for Mac](https://www.arduino.cc/en/Main/Software)
* [LED Control Library for Arduino](http://playground.arduino.cc/Main/LedControl)
* [Adrafruit GFX Library for Arduino](https://github.com/adafruit/Adafruit-GFX-Library)

#### Client/Server Libraries & Examples
* Libraries for Node.js are included in the "How to Run this Code" section above and must be installed as dependencies.
* [LED Matrix Web Controller Example](https://binaryunit.com/work/led-matrix-web-controller) 
* [Wifi LED Matrix Example](http://embedded-lab.com/blog/wifi-enabled-scrolling-led-matrix-display/)


### Client/Server Interaction

This project uses both Websockets and APIs to communicate different information on the site.
 
##### Socket Endpoints 
The websockets are used to program the initial design. A table with 64 cells is connected to each of the 64 LEDs on the matrix using the websockets. 

If a table cell is clicked on, it turns red, and the corresponding LED lights up. If clicked again, it turns back to its normal grey and the corresponding LED on the matrix shuts off. 

This is accomplished by communicating the state of a table cell (either on/off 1/0) and its row and column number to the server, and then through the serial port to the Arduino. 

The arduino interprets this string, `{Row#: Col#: On/Off}`, and turns the correct LED on or off.

| Verb	        | URL           | Description  | Response Structure
| ------------- |:-------------:| :-----:|:-----------:|
| EMIT  		    | 'start'		    | Connects socket and sends initial state of the interface table (all off) | Structure with table data as arrays |
| ON	        | 'click'     |   Takes data of which table cell was clicked and writes to Arduino through Serial port. Emits back the 'waiting' message. | Structure with {row#, col#, on/off} |
| ON	        | 'waiting'    |  Prepares data to send to server by creating string object for sending. | Command  |
| ON	        | 'disconnect'    |  Disconnects the sockets. | Command  |
| ON	    | 'error'    |   Logs the error message. | Error Handling |

 
 
##### API Endpoints 
The API endpoints are used for two purposes.
1. Save users information and designs to the local database attached to the server on Index page.
2. Load and navigate through saved designs from other users on the Saved page. Designs will appear on the LED matrix, users name will appear on the site.
 
###### Add a Design
The  `/addPerson ` endpoint receives the users name (typed into an input box on client site) and the state of the LED's the user modified as an array of objects with the structure  `{row#, col#, LEDState ` e.g.  `{1, 0, 0} `. Each time an LED is turned on/off, an object is created and stored on the client side. When the user clicks the 'Save' button, the  `/addPerson ` POST request is triggered, saving the iformation to the database on the server and writing it to a JSON file.

###### Load Designs
The  `/loadDesign ` endpoint is used to access the saved designs from the database on the Saved page. It is called on page load and when users click the 'Next' button on the Saved page. It sends back the users name as an object to be displayed on the website and also sends the array of LED objects described above to the serial port. The arduino interprets this stream through the serial and lights up the corresponding design on the LED matrix.

###### Refresh
The  `/refresh ` endppoint is used to refresh the LED matrix when navigating between pages or refreshing the page. The LED matrix must be manually cleared when navigating between the create a design and browse saved designs pages. This endpoint is called when this navigation occurs (on page load or refresh) and causes the server to send a character  `'z' ` throught the Serial port to the Arduino. The arduino runs a  `lc.clearDisplay() ` command that clears the current data in the display.

You can see a more detailed breakdown of each endpoint below.
 
 
| Verb	        | URL           | Description  | Response Structure
| ------------- |:-------------:| :-----:|:-----------:|
| USE  		    | /test		    | Sends a test message to the client | Object |
| GET	        | /people     |   Gets the saved list of all designs users have programed from the databse for testing. | Structure with Array containing ID, Name, Sub-Array with Row #, Column # and State of all lights modified by the user |
| GET	        | /loadDesign     |  Gets the most recently created design in the database. When next is clicked, gets the next design. | Structure with Array containing ID, Name, Sub-Array with Row #, Column # and State of all lights modified by the current user |
| GET 		    | /refresh    |   Refreshes the LED matrix. Used when navigating between pages or hitting refresh button. Sends character through serial port that clears the LED Matrix when initiated | Object |
| POST 		    | /addPerson      |    Adds a person's name and design to the databse when the Save button is pressed | Structure with Persons information and saved design |


#### Website Hosting
The full website is hosted by the server over a website wide API located at '/' where it does a USE command to publish everything in our "public folder" (CSS, HTML, client-side javascript etc.)

### Bugs & Things to Improve
The code for parsing the incoming data on the Arduino is a bit buggy and complicated since parsing strings isn't quite as easy in that language. As a result, the matrix can get overwhelmed when the data is coming in too fast and not light up the full design. I need to find a way to crate a delay between each object written to the port so that this won't occur.

Also there is a mirroring issue going on which isn't code related, but I think is an issue between the library and the board used. I need to try rewiring the circuit so that this issue is fixed.

Need to improve the overall interface for the site. The table works very well, but I need to do alot of design work down the road to make this a better experience for users.

Need to use an online database for security and consistency. While writing a JSON file is great for small amounts of data, I will need to use a real database service to securely store information and payments from users in the future. 

I tried redoing this project with Mongo.DB but had issues incorporating everything as I'm still learning Mongo's functionality. I decided to leave it off for this project since the websockets and serial communication were complicated enough during the busy finals period.
