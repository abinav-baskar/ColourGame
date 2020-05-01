// Dependencies
//var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
/*var app = express();
var server = http.Server(app); 
var io = socketIO(server); 

//App Setup
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8082;
}

app.set('port',port); 
app.use('/static',express.static(__dirname + '/Static'));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
}); 

app.listen( app.get( 'port' ), function() {
    console.log( 'Node server is running on port ' + app.get( 'port' ));
    });
    
  //server.listen(port, function () {
   // console.log(`(2)Listening on ${server.address().port}`);
 // });
 */
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

app.use('/static',express.static(__dirname + '/static'));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
}); 

http.listen( (process.env.PORT || 3000),function(){
    console.log("http listening to to port ");
});
server.listen(process.env.PORT || 3000);

const gameStages = {
	newGame: 0,
    main_choosing_firsthalf: 2, //later we can add more distinctions 
    main_choosing_secondhalf: 3,
	mainResults: 4
}; 

const pointValues = {
    correctColour: 2,
    correctDoublerColour: 4,
    showScore: 1
    //maybe something like, loss for wrong colour
}; 

let currentGameStage = gameStages.newGame;

//Player Variables
var players = {};
var numberOfPlayers = 0; //don't ever reduce this value
var freePlayerNumbers = [];
var assignedNumber;
var randomColour;
//var orderedScores = [];
var leaderboard = [];

//Time Variables
var timeElapsed = 0;
var firstBarTime = 6, restTime = 4;
var increaseBar = true;

//Colour Setup
var colours = ["red","blue","green","yellow","placeHolder"];
var newColours = {};
  for (i = 0; i < 5; i++) {
    newColours[i] = {
      name: colours[i],
      totalChosen: 0
    }
}
console.log("ok we're fine at this stage");

io.on('connection', function(socket) { //must happen every time a socket connects
    console.log("FINALLY!");
  io.sockets.emit('firstBarTime',firstBarTime);
  //playerSimulation();

  //new player function
	socket.on('newPlayer', function(data) {
    	if(freePlayerNumbers.length > 0 ) {
      		assignedNumber = freePlayerNumbers.shift();
    	}
    	else {
            numberOfPlayers +=1;
      		assignedNumber = numberOfPlayers;
    		}

    	players[socket.id] = {
      		number: assignedNumber,
      		id: socket.id,
      		choice: 4,
      		score: 0,
            name: "Player "+assignedNumber,
            displayColour: false
      		};
    	/*	console.log("New Player! Player number " + players[socket.id].number
    			+ " Player id " + socket.id);*/
  	});

  	socket.on('nameGiven',function(data) {
    	if (data !== "") {
            players[socket.id].name = "" + data;
            
          }
          else {
            for(var f in players) {
                io.to(`${f}`).emit('updateName',players[f].name); //updates the game.js number for score
                }
          }
      console.log("New Player! Player no. " + players[socket.id].number + " with ID " + socket.id + " and name " + players[socket.id].name);
      if(currentGameStage == gameStages.newGame) {
          currentGameStage = gameStages.main_choosing_firsthalf;
          startTimer();
      }
      io.sockets.emit('newGame',getRandom());
      determineLeaderboard();
  		});

	//button pressed function
	  socket.on('buttonPressed',function(data)  {
  		if (numberOfPlayers > 0 && increaseBar && !players[socket.id].displayColour) {
    		try {
  				newColours[players[socket.id].choice].totalChosen -=1;
				}
        catch(error) {
  console.log("DANGEROUS ERROR WATCH OUT LINE 79");
}
  players[socket.id].choice = data;
  newColours[data].totalChosen +=1;
    
    }
});

//display totals when 'a' is pressed


//when a player closes or reloads a tab
socket.on('disconnect', function() {
  try {
    disposePlayer(players[socket.id].number, socket.id);
  }
  catch(err) {
    console.log("The disconnecting player was not assigned an id");
  }
});

socket.on('showColourPressed', function(data) {
    if(currentGameStage == gameStages.main_choosing_firsthalf) {
    players[socket.id].displayColour = true; 
    players[socket.id].score += pointValues.showScore; 
    //Add points 
    determineLeaderboard();
    }
});
}); //<--------------------------------------------------

//function startGameLoop() { 
  //cant put an if statement here because it is not constantly called 

function startTimer() {  
setInterval(function() {  //has been rejigged. In fact setInterval need not be called till that person arrrives
  if (numberOfPlayers > 0) {
      
    timeElapsed +=1/60;
    if (increaseBar) { 
              io.sockets.emit('time', timeElapsed);
              if(timeElapsed>firstBarTime/2 && currentGameStage == gameStages.main_choosing_firsthalf) {
                  console.log("its biggar");
                  currentGameStage = gameStages.main_choosing_secondhalf;
                  io.sockets.emit('gameStageChange', currentGameStage);
              } //else has not been added just in case 
			  if (timeElapsed > firstBarTime) {
				  endGameLoop();
				  io.sockets.emit('endGame',false);
			    }
  		}
	  else {
    	if (timeElapsed > restTime) {
        newGame();
      		io.sockets.emit('newGame', randomColour);
   	 	}
    }
  }
else {
  timeElapsed = 0; 
}
 }, 1000/60);
}

function newGame() {
    currentGameStage = gameStages.main_choosing_firsthalf;
  increaseBar = true;
  timeElapsed = 0;
  console.log("");
  for(var q in players) {
    players[q].displayColour = false; 
  }
}

function endGameLoop() {
//	if (runOnce) {
		//console.log("Time (" + firstBarTime + "s) has ended");
		runOnce = false;
		increaseBar = false;
	//	io.sockets.emit('removeFour',trianPosses);
    givePoints(decideWinner());
    updateValues(); //make new NEW GAME function TODO
    determineLeaderboard(); 
    timeElapsed = 0;
//	}
}



function decideWinner() {
  var justColours = [];
  for (var i = 0; i < 4; i++) {
    if (newColours[i].totalChosen > 0) {
    justColours.push(newColours[i].totalChosen);
  }
  }

  var lowestTotal = Math.min(...justColours);

  var lowestColours = [];

  //console.log("The least popular colour(s) (that are chosen) is/are");
  for (var i in newColours) {
  if ((newColours[i].totalChosen == lowestTotal)/* && newColours[i].totalChosen > 0*/) {
    lowestColours.push(i)
  }
}
//console.log("with " + lowestTotal + " picks");

return lowestColours;

}

function givePoints( lowestColours) {

  for (var s in players) {
    for (var d in lowestColours) {
    //  console.log("lowestColour for " + d + " is " + lowestColours[d]);
      //console.log("player " + s + "'s choice is " + players[s].choice);
    if(players[s].choice == lowestColours[d]) {
      if(lowestColours[d] == randomColour) {
        console.log("yes we got a double pointer");
        players[s].score += pointValues.correctDoublerColour;
        break; //TODO MAKE SURE THIS DOESNT FAIL
      }
      else {
      players[s].score += pointValues.correctColour;
      break;
    }
  }

}
console.log("Player " + players[s].number + " named " + players[s].name + " has " + players[s].score + " points.");

  }
}


function updateValues() {

  for (var f in players) {

        players[f].choice = 4;
    
//  io.sockets.emit('updateScore',players[f].score);
  io.to(`${f}`).emit('updateScore',players[f].score); //updates the game.js number for score
  }


  for (var f in newColours) {
    newColours[f].totalChosen = 0;
  }

}

function getRandom() {
  randomColour = Math.floor(Math.random()*4);
  return randomColour;
}






function determineLeaderboard() { 

  var orderedScores = [];
  var place = 11;
  var i = 0;

  for (var a in players) {
    leaderboard[i] = {
      name: players[a].name,
      points: players[a].score,
    colour: players[a].choice
      //later add some boolean to say whether to display or no 
      };
      if(players[a].displayColour) {
          leaderboard[i].colour = players[a].choice;
      }
      else {
          leaderboard[i].colour = 4; 
      }
    i++
  }
  leaderboard.sort(compare);


  console.log("\nLEADERBOARD");
  for(var b in leaderboard) {
    console.log(leaderboard[b].name + " with score " + leaderboard[b].points);
  }

  io.sockets.emit('updateLeaderboard', leaderboard);
} 

  function compare(a, b) {
    // Use toUpperCase() to ignore character casing
    const scoreA = a.points/*.toUpperCase()*/;
    const scoreB = b.points/*.toUpperCase()*/;
  
    let comparison = 0;
    if (scoreA > scoreB) {
      comparison = 1;
    } else if (scoreA < scoreB) {
      comparison = -1;
    }
    return comparison*-1;
  }
  




function disposePlayer(playerNumber, socketID) {
freePlayerNumbers.push(players[socketID].number);
console.log("Player " + players[socketID].number + " with id " + players[socketID].id + " has left");
  delete (players[socketID]);
}