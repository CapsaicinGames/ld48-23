var tiletype = Object.freeze({
    empty: {},
    flatground: {},
});

var asteroid = {
    width: 20,
    height: 20,

    getTileType: function(x, y) {
        return tiletype.empty;
    },

    getResource: function(x, y) {
        return null;
    }

};