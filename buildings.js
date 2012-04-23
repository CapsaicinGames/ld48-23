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
                    
                    Crafty.audio.play("destroy");
                    var refundRatio = 0.5;
                    var ctorCosts = buildingBlueprints[this.name].constructionCost;
                    var refund = [];
                    for(var costIndex = 0; costIndex < ctorCosts.length; ++costIndex) {
                        refund.push(newResourceDelta(
                            ctorCosts[costIndex].r,
                            ctorCosts[costIndex].delta * -1.0 * refundRatio
                        ));
                    }

                    economy.debit(refund);

                    this.tileEntity._canBuild = true;
                    this.overlay.visible = false;
                    this.overlay.destroy();
                    this.destroy();
                    economy.populate(this, -this._colonists);
                }
            });
        },

        numWorkers: function(min, max) {
            return this.attr({minActive: min, maxColonists: max});
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
            switch (overType) {
            case "no":
                this.overlay.visible = false;
                break;
                
            case "res":
                this.overlay.visible = true;
                if (param.indexOf(resourcetypes.energy.name) >= 0) {
                    this.overlay.sprite(0,1);
                } else {
                    this.overlay.sprite(1,1);
                }
                break;
                
            case "inactive":
                this.overlay.visible = true;
                this.overlay.sprite(2,1);
                break;
            }
            this.overlayType = overType;
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
        "Colony Ship": {
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
                    .numWorkers(0,0)
                    .storageDelta(resourcetypes.colonists, 20)
                    .storageDelta(resourcetypes.food, 40)
                    .storageDelta(resourcetypes.ice, 20)
                    .storageDelta(resourcetypes.water, 20)
                    .storageDelta(resourcetypes.plastic, 15)
                    .storageDelta(resourcetypes.steel, 15)
                    .resourceDelta(resourcetypes.food, 0.5)
                    .resourceDelta(resourcetypes.water, 0.5)
                    ;
            },
            buildable: false,
        },
        "Mine": {
            desc: "Extracts raw materials from the ground beneath. Rates of material extraction differ depending on material.",
            constructionCost: [ 
                newResourceDelta(resourcetypes.steel, -3),
                newResourceDelta(resourcetypes.plastic, -1),
            ],
            factory: function() { return createMine(-1, 1, 3, "Mine"); }
        },
        "Habitat": {
            desc: "Provides space for more colonists to live and sleep",
            constructionCost: [
                newResourceDelta(resourcetypes.steel, -2),
                newResourceDelta(resourcetypes.plastic, -2),
                newResourceDelta(resourcetypes.widgets, -2),
            ],
            factory: function() {
                return Crafty.e("Storage, habitatsprite")
                    .attr({
                        name: "Habitat",
                    })
                    .numWorkers(0,0)
                    .resourceDelta(resourcetypes.energy, -1)
                    .storageDelta(resourcetypes.colonists, 15);
            },
        },
        "Capacitor Bank": {
            desc: "Stores excess energy for future use",
            constructionCost: [
                newResourceDelta(resourcetypes.steel, -2),
                newResourceDelta(resourcetypes.widgets, -2),
            ],
            factory: function() {
                return Crafty.e("Storage, capacitorbanksprite")
                    .attr({
                        name: "Capacitor Bank", 
                    })
                    .resourceDelta(resourcetypes.energy, -1)
                    .storageDelta(resourcetypes.energy, 100);
            },
        },
        "Ore locker": {
            desc: "Stockpiles raw goods",
            constructionCost: [
                newResourceDelta(resourcetypes.steel, -2),
            ],
            factory: function() {
                return Crafty.e("Storage, orelockersprite")
                    .attr({
                        name: "Ore locker",
                    })
                    .resourceDelta(resourcetypes.energy, -1)
                    .storageDelta(resourcetypes.steelore, 20)
                    .storageDelta(resourcetypes.regolith, 20)
                    .storageDelta(resourcetypes.preciousore, 20);
            },
        },
        "Solar Panel": {
            desc: "Produces energy to power the colony",
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() {
                return Crafty.e("PowerGenerator, solarpanelsprite")
                    .attr({
                        name: "Solar Panel",
                    })
                    .resourceDelta(resourcetypes.energy, 3);
            },
       },
        "Hydroponics": {
            desc: "Uses water to grow food for the colonists. They need food and water to live",
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() {
                return Crafty.e("Building, hydroponicssprite")
                    .attr({
                        name: "Hydroponics",
                    })
                    .resourceDelta(resourcetypes.energy, -1)
                    .resourceDelta(resourcetypes.water, -1)
                    .resourceDelta(resourcetypes.food, 1.5);
            },
        },
        "Ice melter": {
            desc: "Breaks mined ice down at an industrial scale",
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() {
                return Crafty.e("Building, icemeltersprite")
                    .attr({
                        name: "Ice melter",
                    })
                    .resourceDelta(resourcetypes.energy, -1)
                    .resourceDelta(resourcetypes.ice, -1)
                    .resourceDelta(resourcetypes.water, 1);
            },
        },
        "Widget factory": {
            desc: "Creates useful widgets that can build larger constructions",
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
                newResourceDelta(resourcetypes.steel, -2),
            ],
            factory: function() {
                return Crafty.e("Storage, widgetfactorysprite")
                    .attr({
                        name: "Widget factory",
                    })
                    .numWorkers(3,3)
                    .resourceDelta(resourcetypes.energy, -3)
                    .resourceDelta(resourcetypes.steel, -0.2)
                    .resourceDelta(resourcetypes.plastic, -0.2)
                    .resourceDelta(resourcetypes.widgets, 0.1)
                    .storageDelta(resourcetypes.widgets, 4)
                ;
            },
        },
        "Smelter": {
            desc: "Extracts the useful resources from raw " 
                + resourcetypes.preciousore.name,
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
                newResourceDelta(resourcetypes.steel, -3),
                newResourceDelta(resourcetypes.widgets, -2),
            ],
            factory: function() {
                return Crafty.e("Storage, precioussmeltersprite")
                    .attr({
                        name: "Smelter",
                    })
                    .numWorkers(3,3)
                    .resourceDelta(resourcetypes.energy, -3)
                    .resourceDelta(resourcetypes.preciousore, -0.1)
                    .resourceDelta(resourcetypes.preciousmetal, 0.1)
                    .storageDelta(resourcetypes.preciousmetal, 3)
                ;
            },
        },
        "Steel Refinery": {
            desc: "Produces strong, durable steel for use in space construction",
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() {
                return Crafty.e("Building, blastfurnacesprite")
                    .attr({
                        name: "Steel Refinery",
                    })
                    .numWorkers(2,2)
                    .resourceDelta(resourcetypes.energy, -3)
                    .resourceDelta(resourcetypes.steelore, -0.2)
                    .resourceDelta(resourcetypes.steel, 0.2);
            },
        },
        "RegoPlasticiser": {
            desc: "Makes useful plastic from raw asteroid dust",
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() {
                return Crafty.e("Building, plasticisersprite")
                    .attr({
                        name: "RegoPlasticiser",
                    })
                    .resourceDelta(resourcetypes.energy, -2)
                    .resourceDelta(resourcetypes.regolith, -0.1)
                    .resourceDelta(resourcetypes.plastic, 0.1);
            },
        },
        "Widget Store": {
            desc: "Excess storage for widgets",
            constructionCost: [
                newResourceDelta(resourcetypes.steel, -5),
            ],
            factory: function() {
                return Crafty.e("Storage, widgetstoresprite")
                    .attr({name: "Widget store"})
                    .resourceDelta(resourcetypes.energy, -1)
                    .storageDelta(resourcetypes.widgets, 100);
            },
        },
        "Rare earth store": {
            desc: "A safe place to hold rare earth minerals",
            constructionCost: [
                newResourceDelta(resourcetypes.steel, -5),
            ],
            factory: function() {
                return Crafty.e("Storage, preciousstoresprite")
                    .attr({
                        name: "Rare earth store",
                    })
                    .resourceDelta(resourcetypes.energy, -1)
                    .storageDelta(resourcetypes.preciousmetal, 100);
            },
        },
        "Astro Analyser": {
            desc: "Utility building to discover subastroidal resources",
            constructionCost: [
                newResourceDelta(resourcetypes.plastic, -1),
            ],
            factory: function() {
                return Crafty.e("Building, astroanalysersprite")
                    .attr({
                        name: "Astro Analyser", 
                        onTick: function() {
                            // Increase ever more slowly to 3 blocks per turn
                            var amt = Math.pow(this._colonists, 0.5);
                            }
                            this.canScanBlocks += amt;
                            var willScan = Math.floor(this.canScanBlocks);

                            analyseAsteroid(willScan);
                            // Accumulation gives more fine performance difference
                            this.canScanBlocks -= willScan; 
                        },
                        canScanBlocks: 0,
                    })
                    .numWorkers(1,9)
                    .resourceDelta(resourcetypes.energy, -1);
            },
        },          
        "Freight Depot": {
            desc: "Holding pen for shipping rare earth minerals back planetside. Each shipment is worth game points.",
            constructionCost: [
                newResourceDelta(resourcetypes.widgets, -1),
                newResourceDelta(resourcetypes.steel, -2),
                newResourceDelta(resourcetypes.plastic, -2),
            ],
            factory: function() {
                return Crafty.e("Building, placeholderSprite")
                    .attr({
                        name: "Freight Depot",
                        minActive: 1,
                    })
                    .resourceDelta(resourcetypes.energy, -4)
                    .resourceDelta(resourcetypes.preciousmetal, -3)
                    .resourceDelta(resourcetypes.points, 25)
                ;
            },
        },
    }
}

/** Create the new building on a designated tile.
 *
 *  This will initialise the building entity, and create
 *  its associated overlays.  It will also run any building
 *  specific code.
 */
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
              })
        .areaMap([tilesize/2,tilesize/2],
                 [tilesize,3*tilesize/4],
                 [tilesize/2,tilesize],
                 [0,3*tilesize/4]);
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
                   this.resourceDelta(tileResource, resourceProduction * tileResource.mineRate);
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
