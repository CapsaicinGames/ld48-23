
convertTileType = function(type) {
    switch (type) {
        case tiletype.flatground:
            return "grass"
    }
}

function mapToIsometricTile(x, y, mapWidth, mapHeight) {
    
    var isometricRow = mapHeight - y + x;
    var isometricCol = Math.floor((x+y) / 2);
    
    return [isometricCol,isometricRow];
}

window.onload = function() {
    Crafty.init();
    Crafty.e("2D, DOM, Text, Color")
        .attr({x:250, y:130, w: 300 })
        .color('rgb(250,250,250)')
        .text("Click to play...");

    var tilesize = 32;
    Crafty.sprite(tilesize, "image/sprite-32.png", {
            grass: [0,0,1,1],
            flatground: [1,0,1,1]
    });

    iso = Crafty.isometric.size(tilesize);

    var newIsometricTiles = new Array();

    var z = 0;
    for(var x = asteroid.width-1; x >= 0; x--) {
        for(var y = 0; y < asteroid.height; y++) {
            var which = asteroid.getTileType(x, y);
            if (which === tiletype.emptyspace)
                continue; // don't draw tiles where there should be space
            var tile = Crafty.e("2D, DOM, Mouse, " + convertTileType(which))
                .attr('z',1)
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
            newIsometricTiles.push({ coord: isometricTileCoord, e: tile});
        }
    }

    newIsometricTiles.sort(function(tileA, tileB) {
        return tileA.coord[1] < tileB.coord[1] ? -1
            : tileA.coord[1] > tileB.coord[1] ? 1
            : (tileA.coord[0] > tileB.coord[0] ? -1 
               : tileA.coord[0] < tileB.coord[0] ? 1
               : 0)
    });

    for(var tileIndex = 0; tileIndex < newIsometricTiles.length; ++tileIndex) {
        var newTile = newIsometricTiles[tileIndex];
        newTile.e.attr('z', tileIndex);
        iso.place(newTile.coord[0], newTile.coord[1], 0, newTile.e);
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
