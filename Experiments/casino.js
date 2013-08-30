var casinoDiv = document.getElementById("casino");

var mouseX = 0;
var mouseY = 0;
var cursorX = 0;
var cursorY = 0;
var somethingAtCursor = false;

var maxWidth = parseInt(casinoDiv.style.width, 10);
var maxHeight = parseInt(casinoDiv.style.height, 10);

var casinoOffsetX =  parseInt(casinoDiv.style.left, 10);
var casinoOffsetY =  parseInt(casinoDiv.style.top, 10);
var doorX = 320;
var doorY = 450;

var startingAttendance = 1;

var gameCosts = new Array();
gameCosts['slots'] = 100;
gameCosts['blackjack'] = 250;
gameCosts['craps'] = 500;
gameCosts['roulette'] = 150;
gameCosts['poker'] = 150;

//Events
var goodEvents = new Array(2);
goodEvents[0] = "You have won an award!  Here's your prize!";
goodEvents[1] = "You are the most fun casino around!  Here's a bonus!";

var badEvents = new Array(3);
badEvents[0] = "Someone broke in and stole money!";
badEvents[1] = "A slot machine malfunctioned and emptied its contents.";
badEvents[2] = "A fee is being charged by the state.";

casinoDiv.addEventListener("mousemove", function (e) {
    if (e.pageX < maxWidth + casinoOffsetX - 16)
        mouseX = e.pageX;

    if (e.pageY < maxHeight + casinoOffsetY - 16)
        mouseY = e.pageY;
   
    var cursorDiv = document.getElementById("cursor");
    cursorX = (Math.round((mouseX - casinoOffsetX)/ 16) * 16);
    cursorY = (Math.round((mouseY - casinoOffsetY)/ 16) * 16)
    cursorDiv.style.left =  cursorX + "px";
    cursorDiv.style.top = cursorY  + "px";
    
    if (casinoSim.cursorMode == "create") {
        cursorDiv.style.display = "block";
    } else {
        cursorDiv.style.display = "none";
    }
}, false);

casinoDiv.addEventListener('mousedown', function (e) {

    if (casinoSim.cursorMode == "create" && somethingAtCursor == false && (Math.round(mouseX / 16) * 16) - casinoOffsetX < 624 && (Math.round(mouseY / 16) * 16) - casinoOffsetY < 448) {
        if (isNumber(casinoSim.creating))
            casinoSim.addDoodad();
        else
            casinoSim.addGame();
    }
    if (somethingAtCursor == false) {
		hideInfo();
        casinoSim.unselectAll();
    }
    somethingAtCursor = false;
}, false);

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

//Classes
function CasinoSim() {
    var people = [];
    this.casinoGames = [];
    this.doodads = [];
    
    var ticks = 0;
    var paused = false;

    this.cash = 200000;
    this.popularity = 50;
    this.cursorMode = "select";
    this.creating = 0;
    this.editing = 0;

    this.init = function () {
        for (var i = 0; i < startingAttendance; i++) {
            addPerson();
        }
    }

    this.update = function () {
        ticks++;
		
		if (this.popularity > 100) {
			this.popularity = 100;
		}
        if (paused)
            return true;

        for (i in people) {
            people[i].update();
            if (people[i].gone == true) {
                this.removeFromArray(people, people[i]);
            }
        }

        for (i in this.casinoGames) {
            this.casinoGames[i].update();
        }

        for (i in this.doodads) {
            this.doodads[i].update();
        }

        //Check to see if player has lost.
        if (this.cash <= 0) {
            alert("You have gone bankrupt!");
            return false;
        }

        //Add new people
        if (ticks % 180 == 0) {
            var roll = Math.random() * 100;
            if (this.popularity > roll) {
                addPerson();
            }
        }
        
        //Roll a random number to trigger an event.
        if (Math.random() < .0001)
        {
          var extraCash = Math.ceil(Math.random() * 200);
          if (Math.random() > .5) {
            alert(goodEvents[Math.floor(Math.random() * 2)]);
            this.cash += extraCash;
            alert("You gained $"+extraCash+"!");
          }
          else
          {
            alert(badEvents[Math.floor(Math.random() * 3)]);
            this.cash -= extraCash;
            alert("You lost $"+extraCash+"!");
          }
        }
        
        document.getElementById("casinoCash").innerHTML = "$" + this.cash;
        document.getElementById("casinoAttendance").innerHTML = people.length;
        document.getElementById("casinoPopularity").innerHTML = this.popularity + "%";

        return true;
    }

    this.unselectAll = function () {
        for (i in people) {
            people[i].selected = false;
            people[i].element.className = people[i].element.className.replace(" selected", '');
        }

        for (i in this.casinoGames) {
            this.casinoGames[i].selected = false;
            this.casinoGames[i].element.className = this.casinoGames[i].element.className.replace(" selected", '');
			this.casinoGames[i].beingMoved = false;
        }

        for (i in this.doodads) {
            this.doodads[i].selected = false;
            this.doodads[i].element.className = this.doodads[i].element.className.replace(" selected", '');
			this.doodads[i].beingMoved = false;
        }
    }

    this.addDoodad = function () {
        if (10 < this.cash) {
            var doodad = new Doodad();
            doodad.init(cursorX,cursorY,"doodad");//((Math.round(mouseX / 16) * 16) - casinoOffsetX, (Math.round(mouseY / 16) * 16) - casinoOffsetY, "doodad");

            doodad.setType(this.creating);
            this.doodads.push(doodad);
            this.cash -= 10;
        } else {
            alert("You will go bankrupt if you place anymore of these.");
        }
    }

    function addPerson() {
        var newPerson = new Person();
        newPerson.init(doorX, doorY, "person");
        newPerson.personInit();
        people.push(newPerson);
    }

    this.addGame = function () {
        if (gameCosts[this.creating] < this.cash) {
            var newGame = new CasinoGame();
            newGame.init(cursorX,cursorY,"person");//((Math.round(mouseX / 16) * 16) - casinoOffsetX, (Math.round(mouseY / 16) * 16) - casinoOffsetY, "person");
            newGame.setType(this.creating);
            this.casinoGames.push(newGame);
            this.cash -= gameCosts[this.creating];
        } else {
            alert("You will go bankrupt if you place anymore of these.");
        }
    }

    this.saveCasinoGame = function () {
        this.editing.winRate = parseFloat(document.getElementById("gameWinRate").value);
        this.editing.cashOut = parseFloat(document.getElementById("gameCashOut").value);
        this.editing.costToPlay = parseFloat(document.getElementById("gameCostToPlay").value);
    }
    this.setCreateMode = function (itemType) {
        this.creating = itemType;
        this.changeCursor("create");
    }

    this.pauseGame = function () {
        if (paused == true) {
            paused = false;
        } else {
            paused = true;
        }
    }

    this.changeCursor = function (cursorMode) {
        this.unselectAll();
		hideInfo();
        this.cursorMode = cursorMode;
        document.getElementById("move").className = "button";
        document.getElementById("sell").className = "button";
        document.getElementById("select").className = "button";

        if (cursorMode == "move")
            document.getElementById("move").className = "buttonSelected";
        else if (cursorMode == "sell")
            document.getElementById("sell").className = "buttonSelected";
        else if (cursorMode == "select")
            document.getElementById("select").className = "buttonSelected";
    }

    this.removeFromArray = function (array, item) {
        index = array.indexOf(item);
        if (index != -1) {
            array.splice(index, 1);
        }
    }
}

function Entity() {
    this.element = 0;
    this.selected = false;
    this.width = 16;
    this.height = 16;
    this.beingMoved = false;
    this.isCollidable = false;

    this.init = function(x, y, myClass) {
        this.element = document.createElement("div");
        
        if (this.element.className == '') {
            this.element.className = myClass;
        }
        else
        {
            alert(this.element.className);
        }
    
		x = Math.round(x/16)*16;
		y = Math.round(y/16)*16;
        this.setPosition(x, y);
        casinoDiv.appendChild(this.element);

        var that = this;
        this.element.addEventListener("mousedown", function (e) {
            that.onMouseDown(e)
        }, false);
        this.element.addEventListener("mousemove", function (e) {
            that.onMouseUp(e)
        }, false);
    }
    
    this.setClass = function (newClass) {
        this.element.className = newClass;
    }

    this.setPosition = function (x, y) {
        this.element.style.left = x + "px";
        this.element.style.top = y + "px";
        this.element.style.zIndex = y;
    }

    this.getPosition = function () {
        var x = parseInt(this.element.style.left, 10);
        var y = parseInt(this.element.style.top, 10);
        return {
            x: x,
            y: y
        };
    }

    this.remove = function () {
        casinoDiv.removeChild(this.element);
    }


    this.onMouseUp = function (e) {

    }

    this.onMouseMove = function (e) {

    }

    this.update = function (e) {

    }
}
    

Entity.prototype.onMouseDown = function (e) {
    var coords = this.getPosition();
    somethingAtCursor = true;
    switch (casinoSim.cursorMode) {
    case "select":
        this.selected = true;
        this.element.className = this.element.className + " selected";
        break;
    case "move":
        if (this.element.className != "person") {
            if (this.beingMoved == true) {
                this.selected = false;
                this.beingMoved = false;
				this.element.className = this.element.className.replace(" selected", '');
            } else {
                this.element.className = this.element.className + " selected";
                this.selected = true;
                this.beingMoved = true;
            }
        }

        break;
    }
}


Person.prototype = new Entity();
Person.prototype.parent = Entity.prototype;

function Person() {
    this.isCollidable = false;
    this.goalX = Math.round(Math.random() * 624 / 16) * 16;
    this.goalY = Math.round(Math.random() * 464 / 16) * 16;//Math.floor((Math.random() * 464));
	
    this.thought = "wandering";
    this.gone = false;
    this.gameImPlaying = 0;
    this.playerNumber = 0;
    this.temperament = Math.ceil(Math.random() * 3);
    this.cash = Math.ceil(Math.random()*500);
    
    if (Math.random() < casinoSim.popularity/100 && casinoSim.popularity > 70) {
      this.cash += 2000; //High roller boost
    }
    var frame = 1;
    var ticks = Math.floor(Math.random()*1000);
    this.mood = 100;
	this.moving = false;
    
    var oldPos = {x:0,y:0};
	
	var nextBlock = {horz:0,vert:0};
    
    this.personInit = function()
    {
        if (Math.random() > .5) {
            this.element.className = "person";
        }
        else
        {
            this.element.className = "personFemale";
        }
        
        if (this.cash > 500) {
        this.element.className = "highRoller";
        this.temperament = 5;}  
    }

    this.onMouseDown = function (e) {
        this.parent.onMouseDown.call(this);
        if (casinoSim.cursorMode == "select") {
            showInfo();
            document.getElementById("gameInfo").style.display = "none";
            document.getElementById("personInfo").style.display = "block";
            document.getElementById("personMood").innerHTML = this.mood + "%";
            document.getElementById("personCash").innerHTML = "$" + this.cash;
            document.getElementById("personThought").innerHTML = this.thought;
            document.getElementById("personTemp").innerHTML = this.temperament;
        }
    }

    this.update = function () {
        ticks++;
        this.element.style.backgroundPosition = (-frame * this.width) + "px 0px";
		if (this.gameImPlaying != 0)
		{
			if (this.gameImPlaying.sold == true || this.gameImPlaying.beingMoved == true) {
				this.gameImPlaying.currentPlayers--;
				this.gameImPlaying = 0;
				this.thought = "wandering";
			}
		}

        if (this.mood <= 0) {
            this.thought = "leave";
        }
        
        if (this.mood > 100) {
            this.mood = 100;
        }
        
        switch (this.thought) {
        case "wandering":
            this.move();
            if (this.closeToGoal()) {
                this.goalX = Math.round(Math.random() * 624 / 16) * 16;
                this.goalY = Math.round(Math.random() * 464 / 16) * 16;
                this.thought = "findGameToPlay";
            }
			if (ticks % 180 == 0)
			{
				this.mood -= this.temperament;
			}
            if (this.cash <= 0) {
                this.thought = "leave";
            }
            break;
        case "findGameToPlay":
            for (var i in casinoSim.casinoGames) {
                if (casinoSim.casinoGames[i].currentPlayers < casinoSim.casinoGames[i].maxPlayers && casinoSim.casinoGames[i].costToPlay <= this.cash && casinoSim.casinoGames[i].beingMoved == false) {
                    this.gameImPlaying = casinoSim.casinoGames[i];
                    this.thought = "movetogame";
                    break;
                }
            }
            if (this.gameImPlaying == 0) {
                this.thought = "wandering";
                this.mood -= this.temperament; //I'm upset because I couldn't find a game to play.
            }
            break;
        case "movetogame":
            this.goalX = this.gameImPlaying.getPosition().x;
            this.goalY = this.gameImPlaying.getPosition().y;
            this.move();

            if (this.gameImPlaying.currentPlayers >= this.gameImPlaying.maxPlayers) {
                this.thought = "findGameToPlay";
                this.gameImPlaying = 0;
                this.goalX = Math.round(Math.random() * 624 / 16) * 16;
                this.goalY = Math.round(Math.random() * 464 / 16) * 16;
            } else if (this.closeToGoal()) {
                this.thought = "playgame";
                this.playerNumber = this.gameImPlaying.currentPlayers;
                this.gameImPlaying.currentPlayers++;
            }
            break;
        case "playgame":
            frame = 1;
            if (this.gameImPlaying.height > 16) {
                this.setPosition(this.gameImPlaying.getPosition().x + 16 * this.playerNumber, this.gameImPlaying.getPosition().y + 16);
            } else {
                this.setPosition(this.goalX, this.goalY + 1);
            }
            if (ticks % 60 == 0) {
                this.cash -= this.gameImPlaying.costToPlay;
                if (this.gameImPlaying.didIWin()) {
                    casinoSim.cash -= this.gameImPlaying.cashOut;
                    this.cash += this.gameImPlaying.cashOut;
                    this.mood += 10;
                    if (this.mood > 70) {
                        casinoSim.popularity++;
                    }
                } else {
                    this.mood -= this.temperament;
                }
            }
            if (this.cash < this.gameImPlaying.costToPlay) {
                this.thought = "findGameToPlay";
                this.gameImPlaying.currentPlayers--;
                this.gameImPlaying = 0;
            }

            break;

        case "leave":
            this.goalX = doorX;
            this.goalY = doorY;
            this.move();

            if (this.closeToGoal()) {
                if (this.gone == false) {
                    this.remove();
                    if (this.mood > 70) {
                        casinoSim.popularity += 1;
                    } else {
                        casinoSim.popularity -= this.temperament;
                    }
                    this.gone = true;
                }
            }
            break;
        }

    }
	
	this.findNextBlock = function(coords)
	{
		if (ticks%12 == 0)
		{
			nextBlock = {horz:0,vert:0};
			//Simple movement
			if (coords.x > this.goalX) {
				//coords.x -= 1;
				nextBlock.horz = -1;
				frame = 2;
			} else if (coords.x < this.goalX) {
				nextBlock.horz = 1;
				frame = 3;
			}
			else if (coords.y > this.goalY) {
				nextBlock.vert = -1;
				frame = 1;
			} else if (coords.y < this.goalY) {
				nextBlock.vert = 1;
				frame = 0;
			}

			this.moving = true;
		}
		else
		{
			this.moving = false;
		}
	}

    this.move = function () {
        var coords = this.getPosition();
		
		if (coords.x%16 == 0 && coords.y%16 == 0)
		{
			this.findNextBlock(coords);
			//this.moving = false;
			coords.x = Math.floor(coords.x/16)*16;
			coords.y = Math.floor(coords.y/16)*16;
		}
		
		if (this.moving == true) 
		{
			coords.x += nextBlock.horz;
			coords.y += nextBlock.vert;
		}
        this.setPosition(coords.x, coords.y);
    }

    this.closeToGoal = function () {
        var coords = this.getPosition();
        return (Math.abs(coords.x - this.goalX) < 16 && Math.abs(coords.y - this.goalY) < 16);
    }
}


CasinoGame.prototype = new Entity();
CasinoGame.prototype.parent = Entity.prototype;

function CasinoGame() {
    var frame = 0;
    var maxFrame = 1;
    var ticks = 0;
    //Stat variables
    this.winRate = .5;
    this.cashOut = 100;
    this.costToPlay = 0;
    this.upKeep = 0;
    this.maxPlayers = 0;
    this.sold = false;
    this.currentPlayers = 0;
    this.type = "";
    this.isCollidable = true;

    this.onMouseDown = function (e) {
        this.parent.onMouseDown.call(this);
        if (casinoSim.cursorMode == "sell") {
            if (confirm("Do you want to sell this for $" + gameCosts[this.type] / 2 + "?")) {
                casinoSim.cash += gameCosts[this.type] / 2;
                this.sold = true;
                casinoSim.removeFromArray(casinoSim.casinoGames, this);
                this.remove();
            }
        } else if (casinoSim.cursorMode == "select") {
            showInfo();
            document.getElementById("gameInfo").style.display = "block";
            document.getElementById("personInfo").style.display = "none";
            casinoSim.editing = this;

            document.getElementById("gameWinRate").value = this.winRate;
            document.getElementById("gameCashOut").value = this.cashOut;
            document.getElementById("gameCostToPlay").value = this.costToPlay;
            document.getElementById("gameUpKeep").innerHTML = "$" + this.upKeep;
            document.getElementById("gameMaxPlayers").innerHTML = this.maxPlayers;
        }
    }

    this.update = function () {
        ticks++;
        if (ticks % 60 == 0) {
            frame++;
            casinoSim.cash -= this.upKeep;
        }
        if (frame >= frameCount || this.currentPlayers <= 0) {
            frame = 0;
        }
		

        this.element.style.backgroundPosition = (-frame * this.width) + "px 0px";

        if (this.selected == true && casinoSim.cursorMode == "move") {
			this.currentPlayers = 0;
            this.setPosition(cursorX,cursorY);//((Math.round(mouseX / 16) * 16) - casinoOffsetX, (Math.round(mouseY / 16) * 16) - casinoOffsetY);
        }
    }

    this.didIWin = function () {
        var roll = Math.random();
        if (this.winRate < roll) {
            return false;
        } else {
            return true;
        }
    }

    this.setType = function (type) {
        this.setClass(type);
        this.type = type;
        switch (type) {
        case "slots":
            frameCount = 1;
            this.maxPlayers = 1;
            this.upKeep = 1;
            this.costToPlay = 1;
            this.cashOut = 10;
            this.winRate = .1;
            break;
        case "roulette":
            frameCount = 2;
            this.maxPlayers = 5;
            this.width = 32;
            this.height = 32;
            this.upKeep = 4.5;
            this.costToPlay = 50;
            this.cashOut = 20;
            this.winRate = .3
            break;
        case "blackjack":
            frameCount = 2;
            this.maxPlayers = 3;
            this.width = 32;
            this.height = 32;
            this.upKeep = 2;
            this.costToPlay = 15;
            this.cashOut = 20;
            this.winRate = .3
            break;

        case "craps":
            frameCount = 2;
            this.maxPlayers = 6;
            this.width = 32;
            this.height = 32;
            this.upKeep = 3;
            this.costToPlay = 15;
            this.cashOut = 20;
            this.winRate = .3
            break;
        
        case "poker":
            frameCount = 2;
            this.maxPlayers = 6;
            this.width = 32;
            this.height = 32;
            this.upKeep = 3;
            this.costToPlay = 15;
            this.cashOut = 20;
            this.winRate = .3
            break;

        }
    }
}

Doodad.prototype = new Entity();
Doodad.prototype.parent = Entity.prototype;

function Doodad() {
    var frame = 0;
    this.width = 16;
    this.height = 16;
    this.isCollidable = true;

    this.onMouseDown = function (e) {
        this.parent.onMouseDown.call(this);
        if (casinoSim.cursorMode == "sell") {
            if (confirm("Do you want to sell this for $5?")) {
                casinoSim.cash += 5;
                this.remove();
            }
        }
    }

    this.update = function () {
        if (this.frame == 1) {
          this.isCollidable = false;
        } 
        this.element.style.backgroundPosition = (-frame * this.width) + "px 0px";
        if (this.selected == true && casinoSim.cursorMode == "move") {
            this.setPosition((Math.round(mouseX / 16) * 16) - casinoOffsetX, (Math.round(mouseY / 16) * 16) - casinoOffsetY);
        }
    }

    this.setType = function (type) {
        frame = type;
    }
}


function showInfo() {
    var info = document.getElementById("infoBox");
    info.style.width = "500px";
    info.style.left = "300px";
    info.style.opacity = 1;
}

function hideInfo() {
	casinoSim.unselectAll();
    var info = document.getElementById("infoBox");
    info.style.width = "0px";
    info.style.left = "500px";
    info.style.opacity = 0;
}

//***************************
//****Initialize*************
//***************************

function StartGame() {
    casinoSim.init();
    casinoSim.changeCursor("select");
    Run();
}

/**
 * requestAnim shim layer by Paul Irish
 * Finds the first API that works to optimize the animation loop,
 * otherwise defaults to setTimeout().
 */
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function ( /* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
    };
})();

function Run() {
    //Game running

    if (casinoSim.update()) {
        requestAnimFrame(Run);
    }
}

//Start the game already!
var casinoSim = new CasinoSim();
StartGame();