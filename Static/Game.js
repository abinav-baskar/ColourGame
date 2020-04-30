var socket = io();
var firstBarTime; //seconds (maybe change to loadTime)
var canvasSize = 0;
var canvas =	document.getElementById("loadCanvas");
var doubler = document.getElementById('doubler');
var rgba = "rgba(0,0,0,0.1)";
var name = "";
var lockedChoice = false; 
var chosen = false; 

const gameStages = {
	newGame: 0,
	writingName: 1,
    main_choosing_firsthalf: 2, //later we can add more distinctions 
    main_choosing_secondhalf: 3,
	mainResults: 4
}; 
const buttonColours = {
	red: "rgba(100,0,0,0.5)",
	blue: "rgba(0,0,100,0.5)",
	green: "rgba(0,200,0,0.5)",
	yellow: "rgba(255,255,0,0.5)"
}
var buttonColoursArray = [
    "rgba(100,0,0,0.8)",
    "rgba(0,0,100,0.4)",
    "rgba(0,200,0,0.6)",
    "rgba(255,255,0,0.5)"
]

const shadowColours = {
	red: "0 0 0 0 rgba(100, 0, 0, 0.1)",
	blue: "rgba(0,0,100,0.1)",
	green: "rgba(0,200,0,0.1)",
	yellow: "rgba(255,255,0,0.1)"
}

let currentGameStage = gameStages.newGame; 
resizeFunction();
setUpHover();

var userScore = 0; 

//socket.emit('newPlayer'); //maybe we should only do this once the player has logged in 

socket.on('firstBarTime', function(fb) { //include gamemode here so we know 
		firstBarTime = fb;
	});

socket.on('updateLeaderboard', function(names) {
	
	updateLeaderboardLocally(names); 
});

socket.on('updateScore', function(newScore) {
	userScore = newScore; 
	drawScore(newScore);
    });

    socket.on('updateName', function(name) {
        document.getElementById('username').innerHTML = ""+ name;
        });

socket.on('gameStageChange', function(mCurrentGameStage) { //include gamemode here so we know 

		if(mCurrentGameStage == 2) {
           
            currentGameStage = gameStages.main_choosing_firsthalf;
           // document.getElementById('tempShowColourButt').className = 'showColour_On'; 
        }
        else if(mCurrentGameStage == 3) {
         
            currentGameStage = gameStages.main_choosing_secondhalf;
            document.getElementById('eyeIcon').style.visibility = 'hidden';
            document.getElementById('revealDiv').style.visibility = 'hidden';
            
           
        }
	});

document.getElementById('goBack').addEventListener("click",function(event) {
	afterLogin(); 
});

document.getElementById("colourShower").addEventListener("click", function(event) {
   
    if(currentGameStage == gameStages.main_choosing_firsthalf && chosen) {
        lockedChoice = true;
        socket.emit("showColourPressed", null); //Sending choice is technically not needed
        document.getElementById("lockIcon").style.visibility = "visible";
        document.getElementById("eyeIcon").style.visibility = "hidden";
        document.getElementById("revealDiv").style.visibility = "hidden";
        }
});

function afterLogin() {
	name = "" + document.getElementById("ph").value;
	
	document.getElementById('btn').style.display = "none";
	document.getElementById('nameAsker').style.display = "none";

	document.getElementById('loadCanvas').style.display = "flex"; //this is for circular loading bar 
	//document.getElementById('scoreCanvas').style.display = "flex"; //it works fine just do it for canvas TODO
	document.getElementById('labele').style.display = "none";
    document.getElementById("colourShower").style.display="flex";
    
	socket.emit('newPlayer'); 
	socket.emit('nameGiven',name);
	document.getElementById('username').innerHTML = name;

	currentGameStage = gameStages.main_choosing; //qq
	}

document.getElementById('labele').addEventListener("click",function(event) {
	document.getElementById('ph').focus();
	currentGameStage = gameStages.writingName;
});

document.addEventListener('keydown',function(event) { //should be keydown for the first one; thats it i think 
	if (event.keyCode==13) {
		
		switch(currentGameStage) {
			case gameStages.newGame: 
		//	alert('border');
			document.getElementById('labele').style.borderColor = "RGBa(0,0,0,0.1)"; 
			break; 
			case gameStages.writingName: 
			document.getElementById('goBack').style.backgroundColor = "#e0e0e0";
			//alert('calmingtons');
			break; 
			case gameStages.main_choosing_firsthalf:  
			
            break; 
            case gameStages.main_choosing_secondhalf:  
               // alert("waiting for previous round to finish. Try again");
            break;
			case gameStages.mainResults:
		
			break;
			//
			default: alert("default "+currentGameStage);
		}
	}
});


document.addEventListener('keyup',function(event) { //should be keydown for the first one; thats it i think 
	if (event.keyCode==13) {
		switch(currentGameStage) {
			case gameStages.newGame: 
				//document.getElementById('btn').checked = true; 
				document.getElementById('labele').style.borderColor = "RGBa(0,0,0,0)"; 
				document.getElementById('btn').checked = true; 
				document.getElementById('ph').focus();
								 currentGameStage = gameStages.writingName; 

				//alert("we are in newgame");
				break;
			case gameStages.writingName: 
			//alert('we are in writingName');
				afterLogin(); 
				break; 
				
			case gameStages.main_choosing_firsthalf:  
            break; 
            case gameStages.main_choosing_secondhalf:
            break;
			case gameStages.mainResults:
		
			break;
			//
			default: alert("default "+currentGameStage);
		}
	}
});

function setUpHover() {
	for (var i = 0; i < 4; i++) {
		var butName =  "but" + i;

 //document.getElementById("row1").style.backgroundColor = "RGBa(200,100,0,1)";

		document.getElementById(butName).addEventListener("mouseover", function(event) {
		if(( currentGameStage == gameStages.main_choosing_firsthalf || currentGameStage == gameStages.main_choosing_secondhalf)  && (!lockedChoice ) ) {
			var str = this.getAttribute('id');
			var elemID = parseInt(str.substr(3));
			str = "vis" + elemID;
			document.getElementById(str).style.opacity= 0.7;

			for (var j = 0; j < 4; j++) {
				if (j != elemID) {
					var opacOne = "vis" + j;
					document.getElementById(opacOne).style.opacity = 1;
				}
			}
		}
		else {
			for (var k = 0; k < 4; k++) {
				var opacTwo = "vis" + k;
				document.getElementById(opacTwo).style.opacity = 1;
				}
            }
            document.getElementById('eyeIcon').style.visibility = 'hidden'; //IS CRUCIAL THAT Z-INDEX FOR COLOURSHOWER IS HIGHER 
            document.getElementById('revealDiv').style.visibility = 'hidden';
        });
    }
    document.getElementById("colourShower").addEventListener("mouseover", function(event) {
        if(currentGameStage == gameStages.main_choosing_firsthalf && !lockedChoice) {
        document.getElementById("eyeIcon").style.visibility = "visible";
        document.getElementById('revealDiv').style.visibility = 'visible';
        }
        //document.getElementById("eyeIcon").className = "fadeIn";
    });
   
}
function onMarginMouseover() {
    for (var k = 0; k < 4; k++) {
        var opacTwo = "vis" + k;
        document.getElementById(opacTwo).style.opacity = 1;
        }
}

document.getElementById("but0").addEventListener("click", function(event) {
    if(!lockedChoice) {
    setChoice(0);
    
	//rgba = "rgba(100,0,0,0.5)";
    rgba = buttonColours.red;
    }
});

document.getElementById("but1").addEventListener("click", function(event){
    if(!lockedChoice) {
  setChoice(1);

    rgba = buttonColours.blue;
    }
	
});

document.getElementById("but2").addEventListener("click", function(event){
    if(!lockedChoice) {
  setChoice(2);
    
    rgba = buttonColours.green;
    }

});

document.getElementById("but3").addEventListener("click", function(event){
    if(!lockedChoice) {
  setChoice(3);
    
    rgba = buttonColours.yellow
    }

}); //Later we could put all this in a for loop, change the enum to use number labels 

function setChoice(choice) {
    
    chosen = true; 
    socket.emit('buttonPressed', choice);
}

/*document.getElementById('tempShowColourButt').addEventListener("click", function(event) {
    if(currentGameStage == gameStages.main_choosing_firsthalf && chosen) {
    lockedChoice = true;
    socket.emit("showColourPressed", null); //Sending choice is technically not needed
    document.getElementById("lockIcon").style.visibility = "visible";
    }
});*/


//emit basically means server must do this function


	socket.on('time', function(timeElapsed) { //<--------------------------------------------
        _draw(timeElapsed);
        //we'll have it return the enums because we don't know how long the looptime will be
        
        //any boolean we can put here? yes to then lock the thingy
    });
    //create a separate getter/setter pair here/server.js to also get the game stage - perhaps we don't need this

	socket.on('newGame', function(randomColour){
			var leftPct;
			var topPct;
			//make vars for left and top % so we only see the document.get bit once TODO
			if (randomColour == 0) {
			/*	document.getElementById("doubler").style.left = '25%';
				document.getElementById("doubler").style.top = '25%';*/
				leftPct = 18.75; //was 20
				topPct = 25;
				doubler.style.backgroundColor = buttonColours.red; 
	doubler.style.boxShadow = shadowColours.red;
			}
			else if (randomColour == 1) {
			/*	document.getElementById("doubler").style.left = '70%';
				document.getElementById("doubler").style.top = '20%';*/
				leftPct = 56.25; // was 70
				topPct = 25;
				doubler.style.backgroundColor = buttonColours.blue; 
	doubler.style.boxShadow = shadowColours.blue;
			}
			else if (randomColour == 2) {
				leftPct = 18.75;
				topPct = 75;
				doubler.style.backgroundColor = buttonColours.green; 
				doubler.style.boxShadow = shadowColours.green;
				/*document.getElementById("doubler").style.top = '70%';
				document.getElementById("doubler").style.left = '20%';*/
			}
			else if(randomColour ==3 ) {
			/*	document.getElementById("doubler").style.top = '70%';
				document.getElementById("doubler").style.left = '70%';*/
				leftPct = 56.75;
				topPct = 75;
				doubler.style.backgroundColor = buttonColours.yellow; 
				doubler.style.boxShadow = shadowColours.yellow;
			}
			else {
				doubler.style.backgroundColor = buttonColours.black; 
				doubler.innerHTML = "" + randomColour;
			}

		document.getElementById("doubler").style.visibility = "visible";
		document.getElementById("doubler").style.left = leftPct + "%";
//		document.getElementById("doubler").style.left = "25%";

		document.getElementById("doubler").style.top = topPct + "%";
		document.getElementById("doubler").style.display = "flex";
		document.getElementById("doubler").style.position = "absolute";
		if (document.body.clientWidth < document.body.clientHeight) {
			document.getElementById("doubler").style.width = document.body.clientWidth*0.1;
			document.getElementById("doubler").style.height = document.body.clientWidth*0.1;
		}
		else {
			document.getElementById("doubler").style.width = document.body.clientHeight*0.1;
			document.getElementById("doubler").style.height = document.body.clientHeight*0.1;
		}

        
        chosen = false; 
    lockedChoice = false; 
    //document.getElementById("tempShowColourButt").className = 'showColour_On';
	if(currentGameStage != gameStages.writingName) { //IF IF STATEMENT COMMENTED IS NOT BAD: MEANS YOU CAN'T LOGIN DURING MAIN
	currentGameStage = gameStages.main_choosing_firsthalf; 
	}

	rgba = "rgba(0,0,0,0.1)";
	_draw(0);
	drawScore(0);

		});

	socket.on('endGame', function(choosable){
		
		currentGameMode = gameStages.mainResults; 
		document.getElementById("doubler").style.display = "none";
		rgba = "rgba(0,0,0,0.1)";
		_draw(0);
		document.getElementById("lockIcon").style.visibility = "hidden";

		var whatToAlert = document.getElementById('placeholder').value;
	//	alert(document.getElementById('placeholder').value + "no");
	alert("line 159");
		//the draw function doesnt run!!
	});

/*setTimeout(function(),1000 {
  document.getElementById("sM").innerHTML = startTime;
});*/


function resizeFunction() {

	if (document.body.clientWidth < document.body.clientHeight) { //OK new thing is 25% for leaderboard 
		canvasSize = document.body.clientWidth*0.4;
		document.getElementById('loadCanvas').left = 30 + "%";
	//	document.getElementById('doubler').style.width = document.body.clientWidth*0.1;
	//	document.getElementById('doubler').style.height = document.body.clientWidth*0.1;
	var doublerSize = document.body.clientWidth*0.1;

alert(document.getElementById('placeHolder').value);

	/*	var canS = canvasSize * 0.8/2;
		scoreShower.width = canS*2;
		scoreShower.height = canS*2;*/

	}
	else {
        var doublerSize = document.body.clientHeight*0.1;
        /*
		 canvasSize = document.body.clientHeight*0.4;
		 var canS = canvasSize * 0.8/2;
		 scoreShower.width = canS*2;
		 scoreShower.height = canS*2;*/
	}
if(currentGameStage != gameStages.newGame && currentGameStage != gameStages.writingName) {//TODO Add the negative boolean with the relevant enums allowed only 

drawScore(userScore); 
}
else {
}
if(currentGameStage == gameStages.mainResults) {
	_draw(0);
}
	}


var options = {
    value: 0.75,
    size: 200,
    startAngle: -Math.PI,
    startColor: '#04b',
    endColor: '#07f',
    animation: {
        duration: 1200,
        easing: 'circleProgressEase'
    }
};

function drawDoubler() {
	document.getElementById("doubler")
}

function updateLeaderboardLocally(orderedNames) {
	var number = 0;
	
	for(var a in orderedNames) {
		if(number<10) {
		
		var nameId = "place"+number;
        var posId = "points"+number;
        var rowId = "row"+number;
		document.getElementById(nameId).innerHTML="" + (number+1) + "\xa0\xa0\xa0" + orderedNames[a].name;
        document.getElementById(posId).innerHTML=orderedNames[a].points;
        drawScore(orderedNames[a].points);
        document.getElementById(posId).style.textAlign = "center";
        if(orderedNames[a].colour != 4) {
            document.getElementById(rowId).style.backgroundColor=buttonColoursArray[orderedNames[a].colour];
       }
       else {
        document.getElementById(rowId).style.backgroundColor=""
       }
     
        
		}
		number+=1;
	}
}

function _draw(timeElapsed) {

	if (document.body.clientWidth < document.body.clientHeight) {
		canvasSize = document.body.clientWidth*0.4;
		}
	else {
		 canvasSize = document.body.clientHeight*0.4;
	}
    document.getElementById("colourShower").style.width = "" + canvasSize*0.8 + "px";
    document.getElementById("colourShower").style.height = "" + canvasSize*0.8 + "px";
    document.getElementById("colourShower").style.backgroundColor = rgba;
//var s = 350;
	var v = 0.75; // current value: from 0.0 to 1.0
	var    r = canvasSize / 2;        // radius
	var  t = canvasSize / 10; //percentage of circle that is part of progress bar/2

	canvas.width = canvasSize;
	canvas.height = canvasSize;
	var ctx = canvas.getContext('2d');

    // Clear frame
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    
    ctx.fillStyle = rgba;
    
	//	alert("fill" + fillR);

    // Draw background circle
    ctx.beginPath();
    ctx.arc(r, r, r, -Math.PI, Math.PI);
	ctx.fill();
	ctx.fillStyle = "rgba(218, 223, 225, 1)"; //outer bit
    ctx.arc(r, r, r - t, Math.PI, -Math.PI, true);
    ctx.closePath();
    ctx.fill(); // gray fill

    // Draw progress arc
    ctx.beginPath();
	ctx.fillStyle = "rgba(149, 165, 166, 1)";

  //  ctx.arc(r, r, r, -Math.PI, -Math.PI + Math.PI * 2 * barWidth/(firstBarTime*Math.PI*2*1.25));
    //ctx.arc(r, r, r - t, -Math.PI + Math.PI * 2 * barWidth/ (firstBarTime*Math.PI*2*1.25), -Math.PI, true);
		ctx.arc(r, r, r, -Math.PI, -Math.PI + Math.PI * 2 * timeElapsed/firstBarTime);
	    ctx.arc(r, r, r - t, -Math.PI + Math.PI * 2 * timeElapsed/firstBarTime, -Math.PI,true);
    ctx.closePath();

    ctx.save();
    ctx.clip();
    ctx.fillRect(0, 0, canvasSize, canvasSize); // gradient fill
    ctx.restore();
}

function drawScore(score) {
    document.getElementById("points").innerHTML = ""+score;
}
