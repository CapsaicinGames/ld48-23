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

function calculateIsometricSqDelta(p1, p2) {
    var xDelta = p1[0] - p2[0];

    var yDelta = p1[1] - p2[1];

    return xDelta*xDelta + yDelta*yDelta;
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
        var asteroidCenter = [this.width/2, this.height/2];
        var asteroidRadius = this.width*0.4;
        console.log(asteroidRadius);
        var asteroidRadiusSqd = asteroidRadius*asteroidRadius;

        for(var columnIndex = 0; columnIndex < this.width; ++columnIndex) {
            for(var rowIndex = 0; rowIndex < this.height; ++rowIndex) {


                var distSqdToCenter = calculateIsometricSqDelta(
                    [columnIndex, rowIndex], asteroidCenter);

                    
                if (distSqdToCenter <= asteroidRadiusSqd) {
                    this._tiles[columnIndex][rowIndex].type = tiletype.flatground;
                }
            }
        }
        this._tiles[asteroidCenter[0]][asteroidCenter[1]].type = tiletype.emptyspace;

        this._tiles[0][0].type = tiletype.flatground;
    }
};

asteroid.init(20, 20);
console.log(asteroid);

