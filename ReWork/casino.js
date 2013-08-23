var casinoDiv = document.getElementById("casino");


function CasinoSim() {
	this.people = [];
	this.people[0] = new Person();
	this.people[0].init(0,5,"person");
	this.people[1] = new CasinoGame();
	this.people[1].init(0,1,"casinoGame");
	
	this.init = function()
	{
		console.log("Init");
	}
	
	this.update = function() {
		console.log("Update");
		return true;
	}
}



function Entity()
{
	this.x = 0;
	this.y = 0;
	this.element = 0;
	
	this.init = function(x,y,myClass)
	{
		this.x = x;
		this.y = y;
		
		this.element = document.createElement("div");
		this.element.className = myClass;
		this.element.setAttribute("name",myClass);
		this.setPosition(x,y);
		casinoDiv.appendChild(this.element);
		
		var that = this;
		this.element.addEventListener("mousedown",function(e){that.onMouseDown(e)},false);
		this.element.addEventListener("mousemove",function(e){that.onMouseUp(e)},false);
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
		var y = parseInt(this.element.style.left, 10);
		return {x: x,y:y};
	}
	
	this.remove = function()
	{
		casinoDiv.removeChild(this.element);
	}
	
	this.onMouseDown = function(e){
		alert("Ouch I've been clicked! X="+this.x+" Y="+this.y);
	}
	
	this.onMouseUp = function(e){
		
	}
	
	this.onMouseMove = function(e){
		
	}
}

function Person() {
	this.onMouseDown = function(e){
		alert("I'm a person!");
	}
}
Person.prototype = new Entity();

function CasinoGame() {
	this.onMouseDown = function(e){
		alert("I'm a Casino game!");
	}
}
CasinoGame.prototype = new Entity();



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