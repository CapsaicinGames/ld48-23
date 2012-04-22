// contains all constructions

var buildingBlueprints = {};

function buildings_setup() {
    Crafty.c("BuildingInfoOverlay", {
        init: function() {
            this.requires("2D, Canvas");
            this.visible = false;
        },
    });
    Crafty.c("Building", {
        _colonists: 0,
        maxColonists: 1,
        minActive: 1,
        missing: "", // human readable string of what's not working
        resourceDeltas: [],
        destroyable: true,
        name: "Unknown",
        
        init: function() {
            this.resourceDeltas = [];
            this.requires("WorldEntity");
            this.bind("Click", function() {
                if (hud_state.mode === hudModes.select) {
                    hud_state.modeArg = this[0];
                    hud_select_building();
                } else if (hud_state.mode === hudModes.destroy 
                           && this.destroyable === true) {
                    this.tileEntity._canBuild = true;
                    this.destroy();
                    economy.populate(this, -this._colonists);
                }
            });
        },

        resourceDelta: function(resource, delta) {
            this.resourceDeltas.push(newResourceDelta(resource, delta));
            return this;
        },
        isActive: function() {
            var ret = this._colonists >= this.minActive;
            return ret;
        },
        onBuild: function(tileResource, atX, atY) {
            // intentionally blank
        },
        onTick: function() {
            // intentionally blank
        },
        showOverlay: function(overType, param) {
            if (overType !== this.overlayType) {
                switch (overType) {
                case "no":
                    this.overlay.visible = false;
                    break;
                    
                case "res":
                    this.overlay.visible = true;
                    if (param.indexOf(resourcetypes.energy.name) >= 0) {
                        this.overlay.sprite(0,1);
                    } else {
                        this.overlay.sprite(1,0);
                    }
                    break;
                    
                case "inactive":
                    this.overlay.visible = true;
                    this.overlay.sprite(0,0);
                    break;
                }
                this.overlayType = overType;
            }
        }
    });

    Crafty.c("PowerGenerator", { init : function() { this.requires("Building"); } });
    Crafty.c("Storage", {
        storageDeltas: [],
        init : function() {
            this.requires("Building");
            this.storageDeltas = [];            
        },
        storageDelta: function(resource,delta) {
            this.storageDeltas.push(newResourceDelta(resource, delta));
            return this;
        }
    });


    buildingBlueprints = {
        "LandedShip": {
            constructionCost: [
                newResourceDelta(resourcetypes.steel, -2000000),
            ],
            factory: function() {
                return Crafty.e("Storage, landersprite")
                    .attr({
                        minActive: 0,
                        destroyable: false, 
                        name: "Colony Ship",
                        onBuild: onLanderBuild,
                    })
                    .storageDelta(resourcetypes.colonists, 10)
                    .storageDelta(resourcetypes.food, 100)
                    .storageDelta(resourcetypes.ice, 40)
                    //.storageDelta(resourcetypes.energy, 50)
                    .storageDelta(resourcetypes.water, 50)
                    //.storageDelta(resourcetypes.regolith, 50)
                    //.storageDelta(resourcetypes.steelore, 50)
                    .storageDelta(resourcetypes.plastic, 40)
                    .storageDelta(resourcetypes.steel, 40)
                    //.storageDelta(resourcetypes.preciousore, 10)
                    //.storageDelta(resourcetypes.preciousmetal, 10)
                    .resourceDelta(resourcetypes.food, 0.5)
                    .resourceDelta(resourcetypes.water, 0.5)
                    ;
            },
            buildable: false,
        },
        "Mine": {
            constructionCost: [ 
                newResourceDelta(resourcetypes.steel, -3),
                newResourceDelta(resourcetypes.plastic, -1),
            ],
            factory: function() { return createMine(-1, 1, 3, "Mine"); }
        },
        "Super Mine": { 
            constructionCost: [
                newResourceDelta(resourcetypes.steel, -7),
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() { return createMine(-2, 2, 6, "Super Mine"); }
        },
        "Habitat": {
            constructionCost: [
                newResourceDelta(resourcetypes.steel, -2),
            ],
            factory: function() {
                return Crafty.e("Storage, habitatsprite")
                    .attr({
                        name: "Habitat",
                        minActive: 0,
                    })
                    .resourceDelta(resourcetypes.energy, -1)
                    .storageDelta(resourcetypes.colonists, 25);
            },
        },
        "Capacitor Bank": {
            constructionCost: [
                newResourceDelta(resourcetypes.steel, -2),
            ],
            factory: function() {
                return Crafty.e("Storage, capacitorbanksprite")
                    .attr({name: "Capacitor Bank"})
                    .resourceDelta(resourcetypes.energy, -1)
                    .storageDelta(resourcetypes.energy, 100);
            },
        },
        "Ore locker": {
            constructionCost: [
                newResourceDelta(resourcetypes.steel, -2),
            ],
            factory: function() {
                return Crafty.e("Storage, orelockersprite")
                    .attr({name: "Ore locker"})
                    .resourceDelta(resourcetypes.energy, -1)
                    .storageDelta(resourcetypes.steelore, 100)
                    .storageDelta(resourcetypes.regolith, 100)
                    .storageDelta(resourcetypes.preciousore, 100);
            },
        },
        "Solar Panel": {
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() {
                return Crafty.e("PowerGenerator, solarpanelsprite")
                    .attr({name: "Solar Panel"})
                    .resourceDelta(resourcetypes.energy, 3);
            },
       },
        "Hydroponics": {
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() {
                return Crafty.e("Building, hydroponicssprite")
                    .attr({name: "Hydroponics"})
                    .resourceDelta(resourcetypes.energy, -1)
                    .resourceDelta(resourcetypes.water, -1)
                    .resourceDelta(resourcetypes.food, 1);
            },
        },
        "Ice melter": {
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() {
                return Crafty.e("Building, icemeltersprite")
                    .attr({name: "Ice melter"})
                    .resourceDelta(resourcetypes.energy, -1)
                    .resourceDelta(resourcetypes.ice, -1)
                    .resourceDelta(resourcetypes.water, 1);
            },
        },
        "Widget factory": {
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
                newResourceDelta(resourcetypes.steel, -2),
            ],
            factory: function() {
                return Crafty.e("Storage, widgetfactorysprite")
                    .attr({name: "Widget factory"})
                    .resourceDelta(resourcetypes.energy, -3)
                    .resourceDelta(resourcetypes.steel, -1)
                    .resourceDelta(resourcetypes.plastic, -2)
                    .resourceDelta(resourcetypes.widgets, 2)
                    .storageDelta(resourcetypes.widgets, 4)
                ;
            },
        },
        "Smelter": {
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
                newResourceDelta(resourcetypes.steel, -3),
            ],
            factory: function() {
                return Crafty.e("Storage, precioussmeltersprite")
                    .attr({name: "Smelter"})
                    .resourceDelta(resourcetypes.energy, -3)
                    .resourceDelta(resourcetypes.preciousore, -1)
                    .resourceDelta(resourcetypes.preciousmetal, 1)
                    .storageDelta(resourcetypes.preciousmetal, 3)
                ;
            },
        },
        "Steel Refinery": {
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() {
                return Crafty.e("Building, blastfurnacesprite")
                    .attr({name: "Steel Refinery"})
                    .resourceDelta(resourcetypes.energy, -3)
                    .resourceDelta(resourcetypes.steelore, -2)
                    .resourceDelta(resourcetypes.steel, 2);
            },
        },
        "RegoPlasticiser": {
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() {
                return Crafty.e("Building, plasticisersprite")
                    .attr({name: "RegoPlasticiser"})
                    .resourceDelta(resourcetypes.energy, -2)
                    .resourceDelta(resourcetypes.regolith, -1)
                    .resourceDelta(resourcetypes.plastic, 1);
            },
        },
        "Astro Analyser": {
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -1),
            ],
            factory: function() {
                return Crafty.e("Building, placeholderSprite")
                    .attr({
                        name: "Astro Analyser", 
                        maxColonists: 9999,
                        onTick: function() { analyseAsteroid(this._colonists); },
                    })
                    .resourceDelta(resourcetypes.energy, -1);
            },
        },          
    }
}

function build(blueprint, tileToBuildOn) {
    var over = Crafty.e("BuildingInfoOverlay, outOfPowerOverlay")
        .attr({x: tileToBuildOn.x,
               y: tileToBuildOn.y - tilesize/4,
               z: tileToBuildOn.z+2});
    var bldg = blueprint.factory()
        .attr({x: tileToBuildOn.x,
               y: tileToBuildOn.y - tilesize/2,
               z: tileToBuildOn.z+1,
               tileEntity: tileToBuildOn,
               overlay: over 
              });
    bldg.onBuild(
        asteroid.getResource(tileToBuildOn.map_x, tileToBuildOn.map_y), 
        tileToBuildOn.map_x, tileToBuildOn.map_y
    );

    tileToBuildOn._canBuild = false;
    
    return bldg;
}

function createMine(powerDrain, resourceProduction, storage, mineName) {
    return Crafty.e("Storage, minesprite")
        .resourceDelta(resourcetypes.energy, powerDrain)
        .attr({name: mineName,
               onBuild: function(tileResource) {
                   this.resourceDelta(tileResource, resourceProduction);
                   this.storageDelta(tileResource, storage);
               },
              });
}

function analyseAsteroid(loops) {

    while(loops > 0) {

        var unanalysedTiles = Crafty("UnanalysedResource");

        if (unanalysedTiles.length === 0) {
            return; // nothing to analyse
        }

        var tileIndexToAnalyse = Crafty.math.randomInt(0, unanalysedTiles.length-1);
        var overlayToAnalyseID = unanalysedTiles[tileIndexToAnalyse];
        var overlayEntityToAnalyse = Crafty(overlayToAnalyseID);
        overlayEntityToAnalyse.removeComponent("UnanalysedResource");

        --loops;
    }
   refreshResources();
}

function onLanderBuild(tileResource, mapX, mapY) {
    var analysedRadius = 2;
    for(var xIndex = Math.max(mapX - analysedRadius, 0); 
        xIndex <= Math.min(mapX + analysedRadius, asteroid.width - 1); 
        ++xIndex) {

        for(var yIndex = Math.max(mapY - analysedRadius, 0);
            yIndex <= Math.min(mapY + analysedRadius, asteroid.height - 1);
            ++yIndex) {

            if (resourceOverlays[xIndex][yIndex] === undefined) {
                continue;
            }

            resourceOverlays[xIndex][yIndex].removeComponent("UnanalysedResource");
        }

    }
}
