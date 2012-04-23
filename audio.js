
var audiofiles = [
    "sound/build.wav",
    "sound/destroy.wav",
    "sound/mainmenu.wav"
];

var audioInit = function() {
    Crafty.audio.add("build", ["sound/build.ogg", "sound/build.wav"]);
    Crafty.audio.add("mainmenu", ["sound/mainmenu.ogg", "sound/mainmenu.wav"]);
    Crafty.audio.add("destroy", ["sound/destroy.ogg", "sound/destroy.wav"]);
    Crafty.audio.add("error", ["sound/destroy.ogg", "sound/error.wav"]);
    Crafty.audio.add("colonistdeath", ["sound/colonistdeath.ogg", "sound/colonistdeath.wav"]);
};
