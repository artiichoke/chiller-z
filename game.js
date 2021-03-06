function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }
    throw new Error("Unable to copy obj! Its type isn't supported.");
}

var game;
var MAP_WIDTH = 21;
var MAP_HEIGHT = 11;
textures = [];

function Point(x, y) {
	this.x = x;
	this.y = y;

	this.addPoints = function(point) {
		newPoint = new Point();
		newPoint.x = this.x + point.x;
		newPoint.y = this.y + point.y;
		return newPoint;
	}
}

function Game() {
	this.map;
	this.center;
	this.currentContext;
}

function isoTo2D(point) {
	var tempPt = new Point(0, 0);
	tempPt.x = (2 * point.y + point.x) / 2;
	tempPt.y = (2 * point.y - point.x) / 2;
	return(tempPt);
}

function twoDToIso(point) {
	var tempPt = new Point(0, 0);
	tempPt.x = point.x - point.y;
	tempPt.y = (point.x + point.y) / 2;
	return(tempPt);
}

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();


function loadTextures(next) {
	textures = [];
	var numLoaded = 0;
	function imageLoaded() { //this looks hacky because the calls are asynchronus. not my fault-ish -jack
		if (numLoaded >= 1) {
			next(textures);
		}
		numLoaded++;
	}
	var grassImage = new Image();
	grassImage.src = "grass.png";
	textures[0] = grassImage;
	var gravelImage = new Image()
	gravelImage.src = "gravel.jpg";
	grassImage.onload = function() {
		textures[0] = grassImage;
		imageLoaded();
	}
	gravelImage.onload = function() {
		textures[1] = gravelImage;
		imageLoaded();
	}
}

function generateMap() {
	map = [];
	for (i=-200; i<200; i++) {
		map[i] = []
		for (j=-200; j<200; j++) {
			if (Math.random() < 0.9) 
	    		map[i][j] = 0;
	    	else 
	    		map[i][j] = 1;
		}
	}
	return map;
}

function animate() {
    requestAnimFrame( animate );
    draw();
}


function draw() {

    var squareSideLength = game.currentContext.canvas.width / 20;

    centerInTiles = clone(game.center);
    centerInTiles.x = Math.floor(centerInTiles.x / squareSideLength);
    centerInTiles.y = Math.floor(centerInTiles.y / squareSideLength);

	for (i=0 - centerInTiles.x - 1; i<MAP_WIDTH - centerInTiles.x - 1; i++) {
		for (j=-MAP_HEIGHT - (centerInTiles.y + 1); j<MAP_HEIGHT - (centerInTiles.y + 1); j++) {
	    	game.currentContext.beginPath();
	    	rectPoint = new Point((i * squareSideLength) + game.center.x, (j * squareSideLength) + game.center.y);
	    	points = new Array(4);
	    	points[0] = new Point(rectPoint.x, rectPoint.y);
	    	points[1] = new Point(rectPoint.x, rectPoint.y+squareSideLength);
	    	points[2] = new Point(rectPoint.x + squareSideLength, rectPoint.y + squareSideLength);
	    	points[3] = new Point(rectPoint.x + squareSideLength, rectPoint.y);
	    	for (k=0; k<4; k++) {
	    		points[k] = twoDToIso(points[k]);
	    	}

			game.currentContext.moveTo(points[0].x, points[0].y); //constants chosen experimentally
			game.currentContext.lineTo(points[1].x, points[1].y);
			game.currentContext.lineTo(points[2].x, points[2].y);
			game.currentContext.lineTo(points[3].x, points[3].y);
	    	


			//drawing code
	    	var grassPattern = game.currentContext.createPattern(textures[0], 'repeat');
    		var gravelPattern = game.currentContext.createPattern(textures[1], 'repeat');
	    	if (game.map[i][j] == 0) 
	    		game.currentContext.fillStyle = grassPattern;
	    	else
	    		game.currentContext.fillStyle = gravelPattern;
	    	game.currentContext.lineWidth = 1.5;
	    	game.currentContext.strokeStyle = 'black';
	    	game.currentContext.fill();
	    	game.currentContext.stroke();
    	}
    } 

    /*
    //for (i=centerInTiles.x; i<MAP_WIDTH + centerInTiles.x; i++) {
		//for (j=-MAP_HEIGHT + centerInTiles.y; j<MAP_HEIGHT+centerInTiles.y; j++) {
			//debug information
			ctx.beginPath();
			rectPoint = new Point((i + centerInTiles) * squareSideLength, (j + centerInTiles) * squareSideLength);
	    	points = new Array(4);
	    	points[0] = new Point(rectPoint.x, rectPoint.y);
	    	points[1] = new Point(rectPoint.x, rectPoint.y+squareSideLength);
	    	points[2] = new Point(rectPoint.x + squareSideLength, rectPoint.y + squareSideLength);
	    	points[3] = new Point(rectPoint.x + squareSideLength, rectPoint.y);
	    	for (k=0; k<4; k++) {
	    		points[k] = twoDToIso(points[k]);
	    	}
			ctx.fillStyle = 'black';
	        ctx.font="16px Arial";
	    	ctx.fillText(21*j + i + " ", points[0].x + 2, points[0].y + 70);
	    	//end debug info
		}
	}
	*/
}


$(function() { //jquery loaded
	game = new Game();
	game.center = new Point(0, 0);
	game.map = generateMap();
	var ctx = $("#canvas")[0].getContext('2d');
	var ctx2 = $("#canvas2")[0].getContext('2d');
	game.currentContext = ctx;
	game.otherContext = ctx2;
	game.currentContext.canvas.width  = window.innerWidth;
    game.currentContext.canvas.height = window.innerHeight;
    game.otherContext.canvas.width  = window.innerWidth;
    game.otherContext.canvas.height = window.innerHeight;
	loadTextures(function(textures) { //load textures, then:
		animate()
	});

	$(document).keydown(function(e){
		var ctx = $("#canvas")[0].getContext('2d');
		ctx.canvas.width  = window.innerWidth;
    	ctx.canvas.height = window.innerHeight;
    	var squareSideLength = ctx.canvas.width / 20;
    	if (e.keyCode == 37) { 
    		game.center = game.center.addPoints(isoTo2D(new Point(-10, 0)));
    		return false;
    	}
    	if (e.keyCode == 38) {
    		game.center = game.center.addPoints(isoTo2D(new Point(0, -10)));
    		return false;
    	}
    	if (e.keyCode == 39) {
    		game.center = game.center.addPoints(isoTo2D(new Point(10, 0)));
    		return false;
    	}
    	if (e.keyCode == 40) {	
    		game.center = game.center.addPoints(isoTo2D(new Point(0, 10)));
    		return false;
    	}
	});

});