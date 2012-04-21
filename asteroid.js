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
    emptyspace: { },
    flatground: { },
});

var asteroid = {
    // set up with call to init
    width:0,
    height:0,

    getTileType: function(x, y) {
        assert(x >= 0 && x < width && y >= 0 && y < height);
        return this._tiles[x][y].type;
    },

    getResource: function(x, y) {
        assert(x >= 0 && x < width && y >= 0 && y < height);
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
                    type: columnIndex > 5 && columnIndex < 15 
                        ? tiletype.flatground 
                        : tiletype.emptyspace, 
                    resource: null 
                };
            }
        }
    }

    ////////////////// "private" ///////////////////

    _makeAsteroid: function() {
        
    }
};

asteroid.init(20, 20);
console.log(asteroid);