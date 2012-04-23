
convertTileType = function(type, x, y, resource) {
    switch (type) {
    case tiletype.flatground:
        if (resource == resourcetypes.ice) {
            return "groundIce";
        }
        else {
            var variantIndex = Crafty.math.randomInt(0, 2);
            return "groundVariant" + (variantIndex + 1);
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
    var offset = 4;
    return [isometricCol+offset,isometricRow];
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
    Math.seedrandom();//"seed");

    // Odd sizes break something
    asteroid.init(Crafty.math.randomInt(12, 19) & ~(1),
                  Crafty.math.randomInt(12, 19) & ~(1));
    //console.log(asteroid.width + " " + asteroid.height);

    Crafty.init();
    buildings_setup();
    economy = economy_setup();

    Crafty.scene("main", function() {

        hud_setup();
        tilesize = 32;
        
        // Sprite maps begin
        var terrainTypes = {
            groundVariant1: [0,0],
            groundIce: [1,0],
            groundVariant2: [2,0],
            groundVariant3: [3,0],
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
            widgetstoresprite: [0,3],
            preciousstoresprite: [1,3],
            astroanalysersprite: [2,3],
        };

        var resourceOverlaySprites = {
            iceOverlay: [0,0],
            regolithOverlay: [1,0],
            steelOverlay: [2,0],
            preciousOverlay: [3,0],
            outOfPowerOverlay: [0,1],
            outOfInputOverlay: [1,1],
            outOfColonistsOverlay: [2,1],
        };
        // Sprite maps end

        // Sprite loading
        Crafty.sprite(tilesize, assetSprites[0], terrainTypes);
        Crafty.sprite(tilesize, assetSprites[1], buildingTypes);
        Crafty.sprite(tilesize, assetSprites[2], resourceOverlaySprites);

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
                    // Don't use setVisibility, the cursor is
                    // not a resource
                    cursor._visible = true;
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
                                Crafty.audio.play("build");
                                // Now build it
                                var bldg = build(desired, this);
                                economy.populate(bldg, bldg.minActive);
                                // Update the HUD
                                economy.updateStatus();
                            } else {
                                Crafty.audio.play("error");
                            }
                        } else if (hud_state.mode === hudModes.placeShip) {
                            Crafty.audio.play("build");
                            var bldg = build(buildingBlueprints["Colony Ship"], this);
                            hud_state.mode = hudModes.select;
                            tutorial.onEvent("onLanderPlaced");
                            economy.newStep();
                            hud_show();
                        } else {
                        }
                    } else {
                        // Can't build here
                        Crafty.audio.play("error");
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
                    .attr({z: ((x+1) * (y+1)) * asteroid.width})
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

        tutorial.init();

    });

    //Crafty.scene("main");
    audioInit();
    assetLoad(); // starts main on load
}
