
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
    Crafty.scene("GameOver", function() {
        Crafty.background('#000');
        Crafty.e("2D, DOM,Text")
            .attr({x:50, y:50, w:100, h:100})
            .textColor("#0000ff")
            .textFont({size:"20px", family:"sans"})
            .text("Your colonists are dead, GAME OVER");
        Crafty.stop();
    });
    Math.seedrandom("seed");
    Crafty.init();
    buildings_setup();
    economy = economy_setup();

    Crafty.scene("main", function() {

        hud_setup();
        tilesize = 32;

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
            landersprite: [0,1],
            icemeltersprite: [1,1],
            blastfurnacesprite: [2,1],
            plasticisersprite: [3,1],
            widgetfactorysprite: [3,2],
            precioussmeltersprite: [2,2],
            orelockersprite: [0,2],
            capacitorbanksprite: [1,2],
        };

        var resourceOverlaySprites = {
            iceOverlay: [0,0],
            regolithOverlay: [1,0],
            steelOverlay: [2,0],
            preciousOverlay: [3,0],
            outOfPowerOverlay: [0,1],
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

        Crafty.c("UnanalysedResource", {});

        Crafty.c("ResourceOverlay", {
            init: function() {
                this.requires("2D, Canvas, UnanalysedResource");
                this.visible = false;
            },
            setVisibility: function(isVisible) {
                this.visible = this.has("UnanalysedResource") === false && isVisible;
            },
        });


        resourceOverlays = []; // intentionally global

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
                            
                            if (economy.debit(desired.constructionCost).length == 0)
                            {
                                // Now build it
                                var bldg = build(desired, this);
                                economy.populate(bldg, 1);
                            } else {
                                // can't alert, breaks mousedown
                                console.log("Cannot afford to build " + hud_state.modeArg);
                            }
                        } else if (hud_state.mode === hudModes.placeShip) {
                            var bldg = build(buildingBlueprints["LandedShip"], this);
                            hud_state.mode = hudModes.select;
                            economy.newStep();
                            hud_show();
                        } else {
                        }
                    }
                });
            }
        });
        Crafty.background("url('image/stars.png')");
        iso = Crafty.isometric.size(tilesize);

        var newIsometricTiles = new Array();

        var z = 0;
        for(var x = asteroid.width-1; x >= 0; x--) {

            resourceOverlays[x] = [];

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
                resourceOverlays[x][y] = overlay;
                
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

    });

    Crafty.scene("main");

}
