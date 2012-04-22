// contains all constructions

var buildingBlueprints = {};

function buildings_setup() {
    Crafty.c("Building", {
        _colonists: 0,
        maxColonists: 1,
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
                } else if (hud_state.mode === hudModes.destroy &&
                    this.destroyable === true) {
                    this.destroy();
                }
            });
        },

        resourceDelta: function(resource, delta) {
            this.resourceDeltas.push(newResourceDelta(resource, delta));
            return this;
        },
        isActive: function() {
            return this._colonists > 0; 
        },
        onBuild: function(tileResource, atX, atY) {
            // intentionally blank
        },
        onTick: function() {
            // intentionally blank
        },
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
                        destroyable: false, 
                        name: "Colony Ship",
                        onBuild: onLanderBuild,
                    })
                    .storageDelta(resourcetypes.colonists, 10)
                    .storageDelta(resourcetypes.food, 100)
                    .storageDelta(resourcetypes.ice, 50)
                    .storageDelta(resourcetypes.energy, 50)
                    .storageDelta(resourcetypes.water, 50)
                    .storageDelta(resourcetypes.regolith, 50)
                    .storageDelta(resourcetypes.steelore, 50)
                    .storageDelta(resourcetypes.plastic, 50)
                    .storageDelta(resourcetypes.steel, 50)
                    .storageDelta(resourcetypes.preciousore, 10)
                    .storageDelta(resourcetypes.preciousmetal, 10);
            },
            buildable: false,
        },
        "Mine": {
            constructionCost: [ 
                newResourceDelta(resourcetypes.steel, -3),
                newResourceDelta(resourcetypes.plastic, -1),
            ],
            factory: function() { return createMine(-1, 1, "Mine"); }
        },
        "Super Mine": { 
            constructionCost: [
                newResourceDelta(resourcetypes.steel, -7),
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() { return createMine(-2, 2, "Super Mine"); }
        },
        "Habitat": {
            constructionCost: [
                newResourceDelta(resourcetypes.steel, -2),
            ],
            factory: function() {
                return Crafty.e("Storage, habitatsprite")
                    .attr({name: "Habitat"})
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
                return Crafty.e("Building, widgetfactorysprite")
                    .attr({name: "Widget factory"})
                    .resourceDelta(resourcetypes.energy, -3)
                    .resourceDelta(resourcetypes.steel, -1)
                    .resourceDelta(resourcetypes.plastic, -2)
                    .resourceDelta(resourcetypes.widgets, 2);
            },
        },
        "Smelter": {
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
                newResourceDelta(resourcetypes.steel, -3),
            ],
            factory: function() {
                return Crafty.e("Building, precioussmeltersprite")
                    .attr({name: "Smelter"})
                    .resourceDelta(resourcetypes.energy, -3)
                    .resourceDelta(resourcetypes.preciousore, -1)
                    .resourceDelta(resourcetypes.preciousmetal, 1);
            },
        },
        "Blast furnace": {
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() {
                return Crafty.e("Building, blastfurnacesprite")
                    .attr({name: "Blast furnace"})
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
                        onTick: analyseAsteroid,
                    })
                    .resourceDelta(resourcetypes.energy, -1);
            },
        },          
    }
}

function build(blueprint, tileToBuildOn) {
    var bldg = blueprint.factory()
        .attr({x: tileToBuildOn.x,
               y: tileToBuildOn.y - tilesize/2,
               z: tileToBuildOn.z+1});
    bldg.onBuild(
        asteroid.getResource(tileToBuildOn.map_x, tileToBuildOn.map_y), 
        tileToBuildOn.map_x, tileToBuildOn.map_y
    );

    tileToBuildOn._canBuild = false;
    
    return bldg;
}

function createMine(powerDrain, resourceProduction, mineName) {
    return Crafty.e("Building, minesprite")
        .resourceDelta(resourcetypes.energy, powerDrain)
        .attr({name: mineName,
               onBuild: function(tileResource) {
                   this.resourceDelta(tileResource, resourceProduction);
               },
              });
}

function analyseAsteroid() {
    var unanalysedTiles = Crafty("UnanalysedResource");
    var tileIndexToAnalyse = Crafty.math.randomInt(0, unanalysedTiles.length-1);
    var overlayToAnalyseID = unanalysedTiles[tileIndexToAnalyse];
    var overlayEntityToAnalyse = Crafty(overlayToAnalyseID);
    overlayEntityToAnalyse.removeComponent("UnanalysedResource");
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