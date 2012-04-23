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
    Crafty.scene("main"); 
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
    var all = assetSounds.concat(assetSprites);
    Crafty.load(all, loadSuccess, progress, onError);
    console.log("Finished load?");
}
