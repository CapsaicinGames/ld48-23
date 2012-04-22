
convertTileType = function(type, x, y, resource) {
    switch (type) {
    case tiletype.flatground:
        if (resource == resourcetypes.ice) {
            return "groundIce";
        }
        else {
            var varientIndex = Crafty.math.randomInt(0, 2);
            return "groundVarient" + (varientIndex + 1);
        }
    default:
        return null;
    }
}

convertResourceToOverlayType = function(type) {

    switch(type) {
    case resourcetypes.ice: return "iceOverlay";
    case resourcetypes.regolith: return "regolithOverlay";
    case resourcetypes.steelore: return "steelOverlay";
    case resourcetypes.preciousore: return "preciousOverlay";
    default: return null;
    }

}

function mapToIsometricTile(x, y, mapWidth, mapHeight) {
    
    var isometricRow = mapHeight - y + x;
    var isometricCol = Math.floor((x+y) / 2);
    
    return [isometricCol,isometricRow];
}



window.onload = function() {
    Math.seedrandom("seed");
    Crafty.init();
    hud_setup();
    buildings_setup();
    economy = economy_setup();
    //economy.newStep();
    var tilesize = 32;
    var terrainTypes = {
        groundVarient1: [0,0],
        groundIce: [1,0],
        groundVarient2: [2,0],
        groundVarient3: [3,0],
        cursorSprite: [0,1],
        placeholderSprite: [1,1],
    };

    var buildingTypes = {
        minesprite: [0,0],
        solarpanelsprite: [1,0],
        habitatsprite: [2,0],
        hydroponicssprite: [3,0],
    };

    var resourceOverlaySprites = {
        iceOverlay: [0,0],
        regolithOverlay: [1,0],
        steelOverlay: [2,0],
        preciousOverlay: [3,0],
    };

    Crafty.sprite(tilesize, "image/ground3.png", terrainTypes);
    Crafty.sprite(tilesize, "image/buildings.png", buildingTypes);
    Crafty.sprite(tilesize, "image/resourceicons.png", resourceOverlaySprites);

    // returns success
    var switchSprite = function(entity, sprites, option) {
        for (var type in sprites) {
            if (entity.has(type)) {
                var sm = sprites[type];
                entity.sprite(sm[0], option);
                return true;
            }
        }
        return false;
    };

    Crafty.c("ResourceOverlay", {
        init: function() {
            this.requires("2D, Canvas");
            this.visible = false;
        },
        setVisibility: function(isVisible) {
            this.visible = isVisible;
        },
    });

    var cursor = Crafty.e("ResourceOverlay, cursorSprite")
        .attr({z: 999999999999});

    Crafty.c("WorldEntity", {
        _tileSize: 32,
        _canBuild: true,
        init : function() {
            this.requires("2D, Canvas, Mouse");
            this.bind("MouseOver", function() {
                cursor.x = this._x;
                cursor.y = this._y;
                cursor.h = this._h;
                cursor.z = this._z + 1;
                cursor.setVisibility(true);
            });
        },
        tileSize: function(size) { 
            this._tileSize = size;
            /* Putting this code here and not in the
             * main code doesn't work
             *
             * this.areaMap([this._tileSize/2,0],
                        [this.tileSize,this._tileSize/4],
                        [this._tileSize,3*this._tileSize/4],
                        [this._tileSize/2,this._tileSize],
                        [0,3*this._tileSize/4],
                        [0,this._tileSize/4]);*/

            return this; // really crucial for chainin ctors
        }
    });
    Crafty.c("Terrain", {
        init : function() {
            this.requires("WorldEntity");
            this.bind("MouseDown", function(e) {
                if (this._canBuild === true) {
                    if (hud_state.mode === hudModes.build) {

                        var desired = buildingBlueprints[hud_state.modeArg];
                        // First check if we can build it
                        var available = false;

                        // Now can we afford it
                        
                        if (economy.debit(desired.constructionCost) === true)
                        {
                            // Now build it
                            bldg = desired.factory()
                            .attr({x: this.x,
                                y: this.y - tilesize/2,
                                z: this.z+1});
                            bldg.onBuild(asteroid.getResource(this.map_x, this.map_y));
                            this._canBuild = false;
                        } else {
                            // can't alert, breaks mousedown
                            console.log("Cannot afford to build " + hud_state.modeArg);
                        }
                    } else if (hud_state.mode === hudModes.placeShip) {
                        bldg = buildingBlueprints["LandedShip"].factory()
                                .attr({x: this.x,
                                    y: this.y - tilesize/2,
                                    z: this.z+1});
                        this._canBuild = false;
                        hud_state.mode = hudModes.nothing;
                        economy.newStep();
                        hud_show();
                    } else {
                    }
                }
            });
        }
    });
    Crafty.background("#000");
    iso = Crafty.isometric.size(tilesize);

    var newIsometricTiles = new Array();

    var z = 0;
    for(var x = asteroid.width-1; x >= 0; x--) {
        for(var y = 0; y < asteroid.height; y++) {
            var which = convertTileType(asteroid.getTileType(x, y), x, y, asteroid.getResource(x, y));
            if (which === null)
                continue; // don't draw tiles where there should be space
            
            var tile = Crafty.e("Terrain, " + which)
                .attr({z:(x+1) * (y+1), map_x: x, map_y: y})
                .tileSize(tilesize)
                .areaMap([tilesize/2,0],
                            [tilesize,tilesize/4],
                            [tilesize,3*tilesize/4],
                            [tilesize/2,tilesize],
                            [0,3*tilesize/4],
                            [0,tilesize/4]);

            var overlaySprite = convertResourceToOverlayType(asteroid.getResource(x, y));

            var overlay = overlaySprite != null 
                ? Crafty.e("ResourceOverlay, " + overlaySprite)
                    .attr({z: (x+1) * (y+1) * asteroid.width})
                : null;
            
            var isometricTileCoord = mapToIsometricTile(x, y, asteroid.width, asteroid.height);
            newIsometricTiles.push({ coord: isometricTileCoord, e: tile, o: overlay});
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
        iso.place(newTile.coord[0], newTile.coord[1], 0, newTile.o);
        iso.place(newTile.coord[0], newTile.coord[1], 0, newTile.e);
    }

    iso.place(newIsometricTiles[0].coord[0], newIsometricTiles[0].coord[1], 0, cursor);

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

}
