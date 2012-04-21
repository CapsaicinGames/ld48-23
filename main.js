window.onload = function() {
    Crafty.init();
    Crafty.e("2D, DOM, Text, Color")
        .attr({x:250, y:130, w: 300 })
        .color('rgb(250,250,250)')
        .text("Click to play...");

    var tilesize = 32;
    Crafty.sprite(tilesize, "image/sprite-32.png", {
            grass: [0,0,1,1],
            stone: [1,0,1,1]
    });
    var tileMap = new Crafty.polygon([tilesize/2,0],[tilesize,tilesize/4],[tilesize,3*tilesize/4],[tilesize/2,tilesize],[0,3*tilesize/4],[0,tilesize/4]);
    	iso = Crafty.isometric.size(tilesize);
	var z = 0;
	for(var i = asteroid.width; i >= 0; i--) {
		for(var y = 0; y < asteroid.height; y++) {
			var which = 1;//Crafty.randRange(0,1);
			var tile = Crafty.e("2D, DOM, "+ (!which ? "grass" : "stone") +", Mouse")
			.attr('z',i+1 * y+1).areaMap(tileMap).bind("click", function(e) {
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
