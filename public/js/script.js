var baseURL = "http://localhost:8080";
var socket = io.connect(baseURL); // Use a dynamic dns service like noip.com to make it public available
var savedItems = [];
var savedLEDs = [];


//Web Socket Stuff
  socket.on('update', function ( data ) {
    var holder = data.split(':');
    $updatethis = $('.table-control a[data-row=' + holder[0] + '][data-col=' + holder[1] + ']');
    holder[2] = parseInt(holder[2]);

    switch( holder[2]) {
      case 0:
        $updatethis
          .removeClass('waiting')
          .removeClass('on')
          .addClass('off')
          .data('state', '1');
          console.log('case 0 ')
        break;
      case 1:
        $updatethis
          .removeClass('waiting')
          .removeClass('off')
          .addClass('on')
          .data('state', '0');
          console.log("case 1)");
        break;
    }
    
  });

  socket.on('start', function( data ) {
    console.log(data);
    //window.da = data;
    for(var r = 0; r<data.length; r++) {
      for (var c = 0; c<data[r].length; c++) {
        var $statebutton = $('.table-control a.button[data-row=' + r + '][data-col=' + c + ']');
        switch (data[r][c]) {
          case 0:
            $statebutton
              .removeClass('on')
              .removeClass('off')
              .removeClass('waiting')
              .addClass('on')
              .data('state', 0);
            break;
          case 1:
            $statebutton
              .removeClass('on')
              .removeClass('off')
              .removeClass('waiting')
              .addClass('off')
              .data('state', 1);
            break;
        }
      
      }
    }
  });

  socket.on('waiting', function (data) {
    var holder = data.split(':');
    $updatethis = $('.table-control a[data-row=' + holder[0] + '][data-col=' + holder[1] + ']');
    $updatethis.addClass('waiting');
    console.log("in waiting state);")

  });


//functions for API Calls
//Test the Connection
function testConnection() {
    $.ajax({
        method: "GET",
        url: baseURL + `/test`
    }).done(function(res) {
        console.log("Test result is " + res.message);

    })
}

function getPeople() {
    $.ajax({
        method: "GET",
        url: baseURL + `/people`
    }).done(function(res) {
        console.log('Got the people');
        console.log(res);
        for (i = 0; i < res.length; i++) {
            console.log(res[i]);
            savedItems.push(res[i]);
        }
        // createList();
    })
};

// //Create the List Upon Load or Reload
// function createList() {
//     console.log("creatinglist...");
//     var list = document.querySelector('ul');
//     // var li = document.createElement('li');
//     for (item of savedItems) {
//         list.innerHTML += "<li id=' " + item.id + "'>" + "Name: " + item.name + "</li>";
//     }
// }

function addLED(message){
  savedLEDs.push(message);
  console.log("adding: " + message);
  console.log("SavedLEDs are now: " + savedLEDs);
}

function addPerson(data) {
    $.ajax({
        method: "POST",
        url: baseURL + `/addPerson`,
        data: data
    }).done(function(res) {
        console.log(data + " was sent to server");
    });
}


function savePerson() {
  var name = document.getElementById("myInput").value;
  var confirm = document.getElementById("confirm");
  var newID = savedItems.length + 1;
  var newPerson = { id: newID, name: name, savedLEDs: savedLEDs};
  if (name === '') {
        alert("You must put a name!");
    } else {
      addPerson(newPerson);
      confirm.innerHTML = "Saved! Check Saved Designs to see what others made.";
}
}

function refresh() {
    $.ajax({
        method: "GET",
        url: baseURL + `/refresh`
    }).done(function(res) {
        console.log("Refresh is " + res.message);
    })
}

// on page load
$(function(){
refresh();
testConnection();
getPeople();

  var active = true;

  function activateButton() {
    active = true;
  }
  
  // when the client clicks SEND
  $('.table-control a.button').click( function(e) {
    $this = $(this);
    if ( active == true && $.isNumeric( $this.data('row') ) && $.isNumeric( $this.data('col') ) && $.isNumeric( $this.data('state') ) ) {
      // console.log('isnum');
      active = false;
      setTimeout(activateButton, 0); // props to @coutoantisocial for preventing multiple clicks
      if ( $this.hasClass('waiting') ){
        console.log('do not send waiting');
        e.preventDefault();
        return false;
      } else {
        var message = $this.data('row') + ':' + $this.data('col') + ":" + $this.data('state');
        $(this).removeClass('on').removeClass('off');
        $(this).addClass('waiting');
        // tell server to execute 'click' and send along one parameter
        socket.emit('click', message);
        addLED(message);
      }
    } else {
      console.log('not numeric');
      e.preventDefault();
      return false;
    }
  });        

});


window.onbeforeunload = function(e) {
    socket.emit('fdisconnect');
};