var casinoDiv = document.getElementById("casino");
var cursorDiv = document.getElementById("cursor");

var maxWidth = 640;
var maxHeight = 480;
var mouseX = 0;
var mouseY = 0;
var somethingAtCursor = false;
var doorX = 320;
var doorY = 456;

var startingAttendance = 10;


var gameCosts = new Array();
gameCosts['slots'] = 100;
gameCosts['blackjack'] = 250;
gameCosts['craps'] = 500;
gameCosts['roulette'] = 150;

casinoDiv.addEventListener("mousemove",function(e){
	if (e.clientX < maxWidth)
		mouseX = e.clientX;
	if (e.clientY < maxHeight) 
		mouseY = e.clientY;
		cursorDiv.style.left=(Math.round(mouseX/16)*16) + "px";
		cursorDiv.style.top=(Math.round(mouseY/16)*16) + "px";
	},false);

casinoDiv.addEventListener('mousedown',function(e){
	
	if (casinoSim.cursorMode == "create" && somethingAtCursor == false) {
		if  (isNumber(casinoSim.creating))
				casinoSim.addDoodad();
		else		
				casinoSim.addGame();
	}
	if (somethingAtCursor == false) {
		casinoSim.unselectAll();
	}
	somethingAtCursor = false;
	},false);

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

//Classes
function CasinoSim() {
	this.people = [];
	this.casinoGames = [];
	this.doodads = [];
	
	this.cursorMode = "create";
	this.creating = 0;
	
	this.cash = 100000;
	this.popularity = 50;
	
	this.init = function()
	{
		for (var i =0; i < startingAttendance; i++) {
			this.addPerson();
		}
	}
	
	this.update = function() {
		if (this.pause)
				return true;
		
		for (i in this.people)
		{
			this.people[i].update();
			if (this.people[i].gone == true)
			{
				this.removeFromArray(this.people,this.people[i]);
			}
		}
		
		for (i in this.casinoGames) {
			this.casinoGames[i].update();
		}
		
		for (i in this.doodads) {
			this.doodads[i].update();
		}
		
		if (this.cash <= 0) {
			alert("You have gone bankrupt!");
			return false;
		}
		return true;
	}
	
	this.unselectAll = function()
	{
		for (i in this.people)
		{
			this.people[i].selected = false;
			this.people[i].element.className = this.people[i].element.className.replace(" selected",'');
		}
		
		for (i in this.casinoGames)
		{
			this.casinoGames[i].selected = false;
			this.casinoGames[i].element.className = this.casinoGames[i].element.className.replace(" selected",'');
		}
		
		for (i in this.doodads)
		{
			this.doodads[i].selected = false;
			this.doodads[i].element.className = this.doodads[i].element.className.replace(" selected",'');
		}
	}
	
	this.addDoodad = function()
	{
		if (10 < this.cash)
		{
			var doodad = new Doodad();
			doodad.init(Math.round(mouseX/16)*16,Math.round(mouseY/16)*16,"doodad");
			doodad.setType(this.creating);
			this.doodads.push(doodad);
			this.cash -= 10;
		}
		else
		{
			alert("You will go bankrupt if you place anymore of these.");
		}
	}
	
	this.addPerson = function()
	{
		var newPerson = new Person();
		newPerson.init(doorX,doorY,"person");
		this.people.push(newPerson);
	}
	
	this.addGame = function()
	{
		if (gameCosts[this.creating] < this.cash)
		{
				var newGame = new CasinoGame();
				newGame.init(Math.round(mouseX/16)*16,Math.round(mouseY/16)*16,"person");
				newGame.setType(this.creating);
				this.casinoGames.push(newGame);
				this.cash -= gameCosts[this.creating];
		}
		else
		{
				alert("You will go bankrupt if you place anymore of these.");
		}
	}
	
	this.createCursor = function(itemType)
	{
		this.creating = itemType;
		this.changeCursor("create");
	}

	this.pauseGame = function()
	{
		if (this.pause == true) {
			this.pause = false;
		}
		else
		{
			this.pause = true;
		}
	}
	
	this.changeCursor = function(cursorMode)
	{
		this.unselectAll();
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

    this.removeFromArray = function(array,item)
	{
		index = array.indexOf(item);
		if (index != -1) {
			array.splice(index,1);
		}
	}
}

function Entity()
{
	this.element = 0;
	this.selected = false;
	this.width = 16;
	this.height = 16;
	this.moving = false;
	
	this.init = function(x,y,myClass)
	{	
		this.element = document.createElement("div");
		this.element.className = myClass;
		this.element.setAttribute("name",myClass);
		this.setPosition(x,y);
		casinoDiv.appendChild(this.element);
		
		var that = this;
		this.element.addEventListener("mousedown",function(e){that.onMouseDown(e)},false);
		this.element.addEventListener("mousemove",function(e){that.onMouseUp(e)},false);
	}
	
	this.setClass = function(newClass)
	{
		this.element.className = newClass;
	}
	
	this.setPosition = function(x,y)
	{
		this.element.style.left = x+"px";
		this.element.style.top = y+"px";
		this.element.style.zIndex = y;
	}
	
	this.getPosition = function()
	{
		var x = parseInt(this.element.style.left, 10);
		var y = parseInt(this.element.style.top, 10);
		return {x: x,y:y};
	}
	
	this.remove = function()
	{
		casinoDiv.removeChild(this.element);
	}
	
	
	this.onMouseUp = function(e){
		
	}
	
	this.onMouseMove = function(e){
		
	}
	
	this.update = function(e){
		
	}
}

Entity.prototype.onMouseDown = function(e)
{
	var coords = this.getPosition();
	somethingAtCursor = true;
	casinoSim.unselectAll();
	switch (casinoSim.cursorMode) {
		case "select":
			this.selected = true;
			this.element.className = this.element.className + " selected";
			break;
		case "move":
			if (this.element.className != "person") {
				if (this.moving == true)
				{
					this.selected = false;
					this.moving = false;
				}
				else
				{
					this.element.className = this.element.className + " selected";
					this.selected = true;
					this.moving = true;
				}
			}

			break;
	}
}


Person.prototype = new Entity();
Person.prototype.parent = Entity.prototype;
function Person() {
	this.goalX = Math.floor((Math.random()*640));
	this.goalY = Math.floor((Math.random()*480));
	this.thought = "wandering";
	this.gone = false;
	this.gameImPlaying = 0;
	this.playerNumber = 0;
	this.temperament  = Math.ceil(Math.random() * 3);
	this.cash = 100;//Math.ceil(Math.random()*500);
	var frame = 1;
	var ticks = 0;
	this.mood = 100;
	

	this.onMouseDown = function(e){
		this.parent.onMouseDown.call(this);
	}
	
	this.update = function()
	{
		if (this.cash > 500) {
				alert("TEST")
				this.element.className = "highRoller";
				this.temperament  = 5;
		}
		ticks++;
		this.element.style.backgroundPosition = (-frame * this.width) + "px 0px";

		if (this.gameImPlaying.sold == true || this.gameImPlaying.moving == true) {
				gameImPlaying.currentPlayers--;
				this.gameImPlaying = 0;
				this.thought = "wandering";
		}
		
		if (this.mood <= 0)
		{
				this.thought = "leave";
		}
		
		switch (this.thought)
		{
				case "wandering":
					this.move();
					if (this.closeToGoal()) {
						this.goalX = Math.floor((Math.random()*640));
						this.goalY = Math.floor((Math.random()*480));
						this.thought = "findGameToPlay";
					}
					if (this.cash <= 0)
					{
						this.thought = "leave";
					}
				break;
				case "findGameToPlay":
						for (var i in casinoSim.casinoGames) {
							if (casinoSim.casinoGames[i].currentPlayers < casinoSim.casinoGames[i].maxPlayers  && casinoSim.casinoGames[i].costToPlay < this.cash && casinoSim.casinoGames[i].moving == false) {
							  this.gameImPlaying = casinoSim.casinoGames[i];
							  this.thought = "movetogame";
							  break;
						  }
						}
					  if (this.gameImPlaying == 0)
					  {
						this.thought = "wandering";
						this.mood -= this.temperament ; //I'm upset because I couldn't find a game to play.
					  }
				break;
				case "movetogame":
						this.goalX = this.gameImPlaying.getPosition().x;
						this.goalY = this.gameImPlaying.getPosition().y;
						this.move();
						
						if (this.gameImPlaying.currentPlayers >= this.gameImPlaying.maxPlayers)
						{
								this.thought = "wandering";
								this.gameImPlaying = 0;
								this.goalX = Math.floor((Math.random()*640));
								this.goalY = Math.floor((Math.random()*480));
						}
						else if (this.closeToGoal()) {
								this.thought = "playgame";
								this.playerNumber = this.gameImPlaying.currentPlayers;
								this.gameImPlaying.currentPlayers++;
						}
				break;
				case "playgame":
						frame = 1;
						if (this.gameImPlaying.height > 16) {
								this.setPosition(this.gameImPlaying.getPosition().x+16*this.playerNumber,this.gameImPlaying.getPosition().y+16);
						}
						else
						{
								this.setPosition(this.goalX,this.goalY+1);
						}
						if (ticks%60 == 0)
						{
								this.cash -= this.gameImPlaying.costToPlay;
								if (this.gameImPlaying.didIWin())
								{
										casinoSim.cash -= this.gameImPlaying.cashOut;
										this.cash += this.gameImPlaying.cashOut;
										this.mood += 10;
								}
								else
								{
										this.mood -= this.temperament;
								}
						}
						if (this.cash < this.gameImPlaying.costToPlay) {
								this.thought = "wandering";
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
										this.gone = true;
								}
						}
				break;
		}

	}
	
	this.move = function()
	{
		var coords = this.getPosition();
		//Simple movement
		if (coords.x > this.goalX) {
			coords.x -= 1;
			frame = 2;
		}
		else if (coords.x < this.goalX) {
			coords.x += 1;
			frame = 3;
		}
	    
		if (coords.y > this.goalY) {
			coords.y -= 1;
			frame = 1;
		}
		else if (coords.y < this.goalY) {
			coords.y += 1;
			frame = 0;
		}
		this.setPosition(coords.x,coords.y);
	}	

	this.closeToGoal = function()
	{
		var coords = this.getPosition();
		return (Math.abs(coords.x - this.goalX) < 1 && Math.abs(coords.y - this.goalY) < 1);
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
    this.currentLoses = 0;
	this.currentWins = 0;
	this.type = "";
	
	this.onMouseDown = function(e){
		this.parent.onMouseDown.call(this);
		if (casinoSim.cursorMode == "sell") {
			if (confirm("Do you want to sell this for $"+gameCosts[this.type]/2+"?")) {
				casinoSim.cash += gameCosts[this.type]/2;
				this.sold = true;
				casinoSim.removeFromArray(casinoSim.casinoGames, this);
				this.remove();
			}
		}
	}
	
	this.update = function()
	{
		ticks++;
		if (ticks%60 == 0) {
			frame++;
			
			casinoSim.cash -= this.upKeep;
		}
		if (frame >= frameCount || this.currentPlayers == 0) {
			frame = 0;
		}
		
		this.element.style.backgroundPosition = (-frame * this.width) + "px 0px";
		
		if (this.selected == true && casinoSim.cursorMode == "move") {
			this.setPosition(Math.round(mouseX/16)*16,Math.round(mouseY/16)*16);
		}
	}
	
		this.didIWin = function()
		{
		  var roll = Math.random();
		  if (this.winRate < roll) {
			return false;
		  }
		  else
		  {
			return true;
		  }
		}
	
	this.setType = function(type)
	{
		this.setClass(type);
		this.type = type;
		switch (type)
		{
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
				
		}
	}
}

Doodad.prototype = new Entity();
Doodad.prototype.parent = Entity.prototype;
function Doodad() {
	var frame = 0;
	this.width = 16;
	this.height = 16;
	
	this.onMouseDown = function(e){
		this.parent.onMouseDown.call(this);
		if (casinoSim.cursorMode == "sell") {
			if (confirm("Do you want to sell this for $5?")) {
				casinoSim.cash +=5;
				this.remove();
			}
		}
	}
	
	this.update = function()
	{
		this.element.style.backgroundPosition = (-frame * this.width) + "px 0px";
		if (this.selected == true && casinoSim.cursorMode == "move") {
			this.setPosition(Math.round(mouseX/16)*16,Math.round(mouseY/16)*16);
		}
	}
	
	this.setType = function(type)
	{
		frame = type;
	}
}



//***************************
//****Initialize*************
//***************************
function StartGame() {
  casinoSim.init();
  Run();
}

/**
 * requestAnim shim layer by Paul Irish
 * Finds the first API that works to optimize the animation loop,
 * otherwise defaults to setTimeout().
 */
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame   ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      window.oRequestAnimationFrame      ||
      window.msRequestAnimationFrame     ||
      function(/* function */ callback, /* DOMElement */ element){
        window.setTimeout(callback, 1000 / 60);
      };
})();

function Run() {
  //Game running
  
  if (casinoSim.update())
  {
    requestAnimFrame( Run );
  }
}


//Start the game already!
var casinoSim = new CasinoSim();
StartGame();