
convertTileType = function(type) {
    switch (type) {
        case tiletype.flatground:
            return "grass"
        default:
            return null;
    }
}

convertResourceToTileType = function(type) {

    switch(type) {
    case resourcetypes.ice: return "iceground";
    case resourcetypes.regolith: return "grass";
    case resourcetypes.steelore: return "flatground";
    case resourcetypes.preciousore: return "preciousground";
    default: return null;
    }

}

function mapToIsometricTile(x, y, mapWidth, mapHeight) {
    
    var isometricRow = mapHeight - y + x;
    var isometricCol = Math.floor((x+y) / 2);
    
    return [isometricCol,isometricRow];
}



window.onload = function() {
    Crafty.init();
    hud_setup();
    economy = economy_setup();
    economy.newStep();
    var tilesize = 32;

    Crafty.sprite(tilesize, "image/ground3.png", {
        grass: [0,0,1,1],
        iceground: [1,0,1,1],
        preciousground: [2,0,1,1],
        flatground: [3,0,1,1],
    });
    Crafty.c("Terrain", {
            _tileSize: 32,
            _canBuild: true,
            init : function() {
                this.addComponent("2D, DOM, Mouse");
                this.bind("MouseDown", function(e) {
                    if (this._canBuild === true) {
                        bldg = Crafty.e("2D, DOM, grass")
                        .attr({x: this.x,y: this.y - 16,z: this.z+1});
                        this._canBuild = false;
                    }
                });
            },
            tileSize: function(size) { 
                this._tileSize = size;
                /*this.areaMap([this._tileSize/2,0],
                            [this.tileSize,this._tileSize/4],
                            [this._tileSize,3*this._tileSize/4],
                            [this._tileSize/2,this._tileSize],
                            [0,3*this._tileSize/4],
                            [0,this._tileSize/4]);*/
                return this; // really crucial for chainin ctors
                }
            });
    Crafty.background("#000");
    iso = Crafty.isometric.size(tilesize);

    var newIsometricTiles = new Array();

    var z = 0;
    for(var x = asteroid.width-1; x >= 0; x--) {
        for(var y = 0; y < asteroid.height; y++) {
            //var which = convertTileType(asteroid.getTileType(x, y));
            var which = convertResourceToTileType(asteroid.getResource(x, y));
            if (which === null)
                continue; // don't draw tiles where there should be space
            var tile = Crafty.e("Terrain, " + which)
                .attr('z',x+1 * y+1)
                .tileSize(tilesize)
                .areaMap([tilesize/2,0],
                            [tilesize,tilesize/4],
                            [tilesize,3*tilesize/4],
                            [tilesize/2,tilesize],
                            [0,3*tilesize/4],
                            [0,tilesize/4])
                .bind("MouseOver", function() {
                    if(this.has("grass")) {
                        this.sprite(0,1,1,1);
                    } else if (this.has("iceground")) {
                        this.sprite(1,1,1,1);
                    } else if (this.has("preciousground")) {
                        this.sprite(2,1,1,1);
                    } else {
                        this.sprite(3,1,1,1);
                    }
                })
                .bind("MouseOut", function() {
                    if(this.has("grass")) {
                        this.sprite(0,0,1,1);
                    } else if (this.has("iceground")) {
                        this.sprite(1,0,1,1);
                    } else if (this.has("preciousground")) {
                        this.sprite(2,0,1,1);
                    } else {
                        this.sprite(3,0,1,1);
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
            Crafty("HUD").each(function() {this.shift(dx, dy)});
        };

        Crafty.addEvent(this, Crafty.stage.elem, "mousemove", scroll);
        Crafty.addEvent(this, Crafty.stage.elem, "mouseup", function() {
            Crafty.removeEvent(this, Crafty.stage.elem, "mousemove", scroll);
        });
    });

    economy.updateStatus();
}
