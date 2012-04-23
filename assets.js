/** Asset management done in this file.
 *
 *  It can't load sounds, making it useless.
 */
var assetSprites = [
    "image/ground3.png",
    "image/buildings.png",
    "image/resourceicons.png",
];

var loadSuccess = function() { 
    Crafty.scene("intro"); 
};
var progress = function(e) {
    /* progress gets { loaded: j, 
     *              total: total, 
     *              percent: (j / total * 100) }) */ 
};

var onError = function(e) { 
    console.log("Error loading assets"); 
    console.log(e);
};

var assetLoad = function() {
    Crafty.load(assetSprites, loadSuccess, progress, onError);
}
