window.onload = function() {
    Crafty.init();
    Crafty.e("2D, DOM, Text, Color")
        .attr({x:250, y:130, w: 300 })
        .color('rgb(250,250,250)')
        .text("Click to play...");

    Crafty.sprite(128, "image/sprite.png", {
            grass: [0,0,1,1],
            stone: [1,0,1,1]
    });
    	iso = Crafty.isometric.size(128);
	var z = 0;
	for(var i = 20; i >= 0; i--) {
		for(var y = 0; y < 20; y++) {
			var which = 1;//Crafty.randRange(0,1);
			var tile = Crafty.e("2D, DOM, "+ (!which ? "grass" : "stone") +", Mouse")
			.attr('z',i+1 * y+1).areaMap([64,0],[128,32],[128,96],[64,128],[0,96],[0,32]).bind("click", function(e) {
				//destroy on right click
				if(e.button === 2) this.destroy();
			}).bind("mouseover", function() {
				if(this.has("grass")) {
					this.sprite(0,1,1,1);
				} else {
					this.sprite(1,1,1,1);
				}
			}).bind("mouseout", function() {
				if(this.has("grass")) {
					this.sprite(0,0,1,1);
				} else {
					this.sprite(1,0,1,1);
				}
			});
			
			iso.place(i,y,0, tile);
		}
	}
}
