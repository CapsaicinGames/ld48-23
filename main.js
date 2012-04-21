
convertTileType = function(type) {
    switch (type) {
        case tiletype.flatground:
            return "flatground"
    }
}

function mapToIsometricTile(x, y, mapWidth, mapHeight) {
    
    return [x,y];
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

    iso = Crafty.isometric.size(tilesize);

    var z = 0;
    for(var x = asteroid.width-1; x >= 0; x--) {
        for(var y = 0; y < asteroid.height; y++) {
            var which = asteroid.getTileType(x, y);
            if (which === tiletype.emptyspace)
                continue; // don't draw tiles where there should be space
            var tile = Crafty.e("2D, DOM, Mouse, " + convertTileType(which))
                .attr('z',x+1 * y+1)
                .areaMap([tilesize/2,0],
                            [tilesize,tilesize/4],
                            [tilesize,3*tilesize/4],
                            [tilesize/2,tilesize],
                            [0,3*tilesize/4],
                            [0,tilesize/4])
                .bind("MouseDown", function(e) {
                    //destroy on right click
                    if(e.mouseButton === Crafty.mouseButtons.RIGHT)
                        this.destroy();
                })
                .bind("MouseOver", function() {
                    if(this.has("grass")) {
                        this.sprite(0,1,1,1);
                    } else {
                        this.sprite(1,1,1,1);
                    }
                })
                .bind("MouseOut", function() {
                    if(this.has("grass")) {
                        this.sprite(0,0,1,1);
                    } else {
                        this.sprite(1,0,1,1);
                    }
                });
            
            var isometricTileCoord = mapToIsometricTile(x, y, asteroid.width, asteroid.height);
            iso.place(isometricTileCoord[0], isometricTileCoord[1], 0, tile);
        }
    }
    Crafty.addEvent(this, Crafty.stage.elem, "mousedown", function(e) {
        if(e.button > 1) return;
        var base = {x: e.clientX, y: e.clientY};

        function scroll(e) {
            var dx = base.x - e.clientX,
                dy = base.y - e.clientY;
                base = {x: e.clientX, y: e.clientY};
            Crafty.viewport.x -= dx;
            Crafty.viewport.y -= dy;
        };

        Crafty.addEvent(this, Crafty.stage.elem, "mousemove", scroll);
        Crafty.addEvent(this, Crafty.stage.elem, "mouseup", function() {
            Crafty.removeEvent(this, Crafty.stage.elem, "mousemove", scroll);
        });
    });
}
