// assert code from http://aymanh.com/9-javascript-tips-you-may-not-know#assertion
function AssertException(message) { this.message = message; }
AssertException.prototype.toString = function() {
    return 'AssertException: ' + this.message;
}

function assert(exp, message) {
    if (exp === false) {
        throw new AssertException(message);
    }
}


var tiletype = Object.freeze({
    emptyspace: { name: "emptyspace" },
    flatground: { name: "flatground" },
});

var asteroid = {
    // set up with call to init
    width:0,
    height:0,

    getTileType: function(x, y) {
        assert(x >= 0 && x < this.width && y >= 0 && y < this.height, 
               "getTileType() x: 0 <= " + x + " < " + this.width + " y: 0 <= " 
               + y + " < " + this.height);
        return this._tiles[x][y].type;
    },

    getResource: function(x, y) {
        assert(x >= 0 && x < this.width && y >= 0 && y < this.height, 
               "getResource() x: 0 <= " + x + " < " + this.width 
               + " y: 0 <= " + y + " < " + this.height);
        return this._tiles[x][y].resource;
    },

    init: function(width, height) {
        this.width = width;
        this.height = height;

        this._tiles = new Array(this.width);

        for(var columnIndex = 0; columnIndex < this.width; ++columnIndex) {

            this._tiles[columnIndex] = new Array(this.height);

            for(var rowIndex = 0; rowIndex < this.height; ++rowIndex) {

                this._tiles[columnIndex][rowIndex] = { 
                    type: tiletype.emptyspace, 
                    resource: null 
                };
            }
        }

        this._makeAsteroid();
    },

    ////////////////// "private" ///////////////////

    _makeAsteroid: function() {
        var asteroidCenter = {x: this.width/2, y: this.height/2};
        var asteroidRadius = this.width*0.4;
        var asteroidRadiusSqd = asteroidRadius*asteroidRadius;

        for(var columnIndex = 0; columnIndex < this.width; ++columnIndex) {
            for(var rowIndex = 0; rowIndex < this.height; ++rowIndex) {

                var xDelta = (columnIndex - asteroidCenter.x) * 2;
                xDelta += xDelta > 0 ? -1 : 0; 

                var distSqdToCenter = Math.pow(xDelta, 2)
                    + Math.pow(rowIndex - asteroidCenter.y, 2);
                if (distSqdToCenter < asteroidRadiusSqd) {
                    this._tiles[columnIndex][rowIndex].type = tiletype.flatground;
                }
            }
        }
        this._tiles[asteroidCenter.x][asteroidCenter.y].type = tiletype.emptyspace;
    }
};

asteroid.init(20, 20);
console.log(asteroid);

