
convertTileType = function(type) {
    switch (type) {
        case tiletype.flatground:
            return "flatground"
    }
}

window.onload = function() {
    Crafty.init();
    Crafty.e("2D, DOM, Text, Color")
        .attr({x:250, y:130, w: 300 })
        .color('rgb(250,250,250)')
        .text("Click to play...");

    var tilesize = 32;
    Crafty.sprite(tilesize, "image/sprite-32.png", {
            //grass: [0,0,1,1],
            flatground: [1,0,1,1]
    });
    // Hex clickmap for selection later
    var tileMap = new Crafty.polygon([tilesize/2,0],
                                    [tilesize,tilesize/4],
                                    [tilesize,3*tilesize/4],
                                    [tilesize/2,tilesize],
                                    [0,3*tilesize/4],
                                    [0,tilesize/4]);

    iso = Crafty.isometric.size(tilesize);

    var z = 0;
    for(var x = asteroid.width-1; x >= 0; x--) {
        for(var y = 0; y < asteroid.height; y++) {
            var which = asteroid.getTileType(x, y);
            if (which === tiletype.emptyspace)
                continue; // don't draw tiles where there should be space
            var tile = Crafty.e("2D, DOM, Mouse, " + convertTileType(which))
                .attr('z',x+1 * y+1)
                .areaMap(tileMap)
                .bind("click", function(e) {
                    //destroy on right click
                    if(e.button === 2)
                        this.destroy();
                })
                .bind("mouseover", function() {
                    if(this.has("grass")) {
                        this.sprite(0,1,1,1);
                    } else {
                        this.sprite(1,1,1,1);
                    }
                })
                .bind("mouseout", function() {
                    if(this.has("grass")) {
                        this.sprite(0,0,1,1);
                    } else {
                        this.sprite(1,0,1,1);
                    }
                });
            
            iso.place(x,y,0, tile);
        }
    }
}
