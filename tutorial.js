
var magicTutorialPriority = 939393;

function createHighlightEntityByName(entityToHighlightName) {
    var entities = Crafty(entityToHighlightName);
    entities.each(function() {
        createHighlightEntity(this);
    });
}

function createHighlightEntity(hudEntityToHighlight) {
    return Crafty.e("Highlight, 2D, DOM")
        .attr({
            x: hudEntityToHighlight.x - 3,
            y: hudEntityToHighlight.y + hudEntityToHighlight.h,
            w: hudEntityToHighlight.w + 3,
            h: 1,
            z: (hudEntityToHighlight.z + 1),
            highlightingEntityID: hudEntityToHighlight[0],
            flashCount: 9,
            flipVisibility: function() {
                this.visible = !this.visible;
                --this.flashCount
                if (this.flashCount > 0 || this.visible === false) {
                    this.startBlink();
                }
            },
            startBlink: function() {
                this.timeout(this.flipVisibility, 500);
                return this;
            }
        })
        .css({
            "border": ("medium solid " + errorTextCol),
            "background-color": errorTextCol
        })
        .bind("EnterFrame", function() {
            var highlightingEntity = Crafty(this.highlightingEntityID);
            if (highlightingEntity.length == 0) {
                this.destroy();
            }
        })
        .startBlink()
    ;
}

function initTutorial() {

    tutorial = Crafty.e("Tutorial") // intentionall global
        .attr({
            _states: {
                gameStart: {
                    enter: function() {
                        createHighlightEntityByName("StatusBar");
                    },

                    tick: function() { 
                        statusMessages.addMessage(
                            "Pick a tile for your ship to land on", 
                            magicTutorialPriority);
                    },
                    
                    onLanderPlaced: function() {
                        tutorial._setState("pauseForHud");
                    },
                },

                pauseForHud: {
                    tick: function() {
                        if (Crafty("MenuTopLevel").length > 0) {
                            tutorial._setState("firstTimeIdle");
                        }
                    }
                },
                
                firstTimeIdle: {
                    enter: function() {
                        createHighlightEntityByName("BuildButton");
                    },

                    tick: function() { 
                        statusMessages.addMessage(
                            "Explore the build menu on the right to decide what to build next", 
                            magicTutorialPriority
                        );
                    },
                    
                    buildMenuOpen: function() {
                        tutorial._setState("firstTimeInBuildMenu");
                    },    
                }, 
                
                firstTimeInBuildMenu: {
                    timer: { nextState: "waitForPower", time: 5000 },
                    
                    tick: function() {
                        statusMessages.addMessage(
                            "Hover over each building for a detailed description",
                            magicTutorialPriority
                        );
                    },
                },  
                
                waitForPower: {
                    enter: function() {
                        this.buildMenuOpen();
                    },
                 
                    buildMenuOpen: function() {
                        Crafty("BuildMenu").each(function() {
                            if (this.buildingName == "Solar Panel") {
                                createHighlightEntity(this);
                            }
                        });
                    },   

                    tick: function() {
                        if (economy.energyDelta > 0) {
                            tutorial._setState("energyGuide");
                        }
                    },
                },

                energyGuide: {
                    enter: function() {
                        createHighlightEntityByName("Status");
                    },
                    
                    timer: { nextState: "resourceGuide", time: 8000 },

                    tick: function() {
                        statusMessages.addMessage(
                            "If not used immediately, excess energy is lost. The Energy Production row shows how much spare energy you have.",
                            magicTutorialPriority
                        );
                    }
                },

                resourceGuide: {
                    timer: { nextState: "resourceOverlay", time: 4000 },

                    tick: function() {
                        statusMessages.addMessage(
                            "Buildings cost resources. Resources can be mined from the ground and refined...",
                            magicTutorialPriority
                        );
                    },
                },

                resourceOverlay: {
                    
                    enter: function() {
                        var isOverlayAlreadyOn = false
                        Crafty("ResourceMenu").each(function() {
                            isOverlayAlreadyOn = this.isOverlayEnabled;
                        });

                        if (isOverlayAlreadyOn) {
                            tutorial._setState("buildAstroanalyser");
                        }
                        else {
                            createHighlightEntity(resourceOverlayView);
                        }
                    },

                    resourcesViewOpened: function() {
                        tutorial._setState("buildAstroanalyser");
                    },

                    tick: function() {
                        statusMessages.addMessage(
                            "...Click the Resources button on the left toggle to see what resource is under each tile...",
                            magicTutorialPriority
                        );
                    },
                },


                buildAstroanalyser: {
                    showMsg: true,

                    build: function(blueprintName) {
                        if (blueprintName==="Astro Analyser") {
                            tutorial._setState("analyserInfo");
                        }
                    },

                    enter: function() {
                        tutorial.timeout(
                            function() { 
                                tutorial._states.buildAstroanalyser.showMsg = false; 
                            },
                            8000
                        );
                        this.buildMenuOpen();
                    },
                 
                    buildMenuOpen: function() {
                        Crafty("BuildMenu").each(function() {
                            if (this.buildingName == "Astro Analyser") {
                                createHighlightEntity(this);
                            }
                        });
                    },   

                    tick: function() {
                        if (this.showMsg) {
                            statusMessages.addMessage(
                                "Initially you can only see resources around your lander. Place an AstroAnalyser to see more.",
                                magicTutorialPriority
                            );
                        }
                    },
                },

                analyserInfo: {
                    timer: { nextState: "explainColonists", time: 3500 },

                    tick: function() {
                        statusMessages.addMessage(
                            "The Analyser will explore one tile every day. To make it explore faster, we can assign it more colonists.",
                            magicTutorialPriority
                        );
                    },
                },

                explainColonists: {
                    enter: function() {
                        createHighlightEntityByName("ColInc");
                    },

                    populate: function() {
                        tutorial._setState("analyserPopulateSuccess");
                    },

                    tick: function() {
                        statusMessages.addMessage(
                            "Click the + button to add more colonists. Most buildings need at least 1 colonist to function.",
                            magicTutorialPriority
                        );
                    },
                },

                analyserPopulateSuccess: {
                    timer: { nextState: "colonistsDown", time: 4000 },
                    
                    tick: function() {
                        statusMessages.addMessage(
                            "The Analyser will now reveal resources faster.",
                            magicTutorialPriority
                        );
                    },
                },

                colonistsDown: {
                    timer: { nextState: "inactiveBuildings", time: 5000 },

                    tick: function() {
                        statusMessages.addMessage(
                            "If you are short of colonists, you can also remove them with the - button...",
                            magicTutorialPriority
                        );
                    },
                },

                inactiveBuildings: {
                    timer: { nextState: "ores", time: 5000 },

                    tick: function() {
                        statusMessages.addMessage(
                            "...but if you remove all colonists, a building will not function",
                            magicTutorialPriority
                        );
                    },
                },

                ores : {
                    timer: { nextState: "refinedresources", time: 5000 },

                    tick: function() {
                        statusMessages.addMessage(
                            "Your astroanalyser is revlealing the locations of regolith, iron ore, ice and rare earth ore",
                            magicTutorialPriority
                        );
                    },
                },

                refinedresources: {
                    timer: { nextState: "mineuse", time: 5000 },

                    tick: function() {
                        statusMessages.addMessage(
                            "These are refined to plastic, steel, water and rare earth minerals respectively",
                            magicTutorialPriority
                        );
                    },
                },

                mineuse: {
                    timer: { nextState: "buildmine", time: 5000 },

                    tick: function() {
                        statusMessages.addMessage(
                            "To extract one of these resources for refinement, you need to build a mine on that tile",
                            magicTutorialPriority
                        );
                    },
                },

                buildmine: {

                    enter: function() {
                        this.buildMenuOpen();
                    },
                 
                    buildMenuOpen: function() {
                        Crafty("BuildMenu").each(function() {
                            if (this.buildingName == "Mine") {
                                createHighlightEntity(this);
                            }
                        });
                    },   

                    tick: function() {

                        if(economy._resources[resourcetypes.regolith.name] >
                           economy.oldres[resourcetypes.regolith.name]) {
                            tutorial._setState("buildplasticiser");
                        }

                        statusMessages.addMessage(
                            "Place a mine on any regolith tile to start increasing your regolith total",
                            magicTutorialPriority
                        );
                    },
                },

                buildplasticiser: {
                    showMsg: true,

                    enter: function() {
                        tutorial.timeout(
                            function() { 
                                tutorial._states.buildplasticiser.showMsg = false; 
                            },
                            6000
                        );
                        this.buildMenuOpen();
                    },
                 
                    buildMenuOpen: function() {
                        Crafty("BuildMenu").each(function() {
                            if (this.buildingName == "RegoPlasticiser") {
                                createHighlightEntity(this);
                            }
                        });
                    },   

                    tick: function() {

                        if(economy._resources[resourcetypes.plastic.name] >
                           economy.oldres[resourcetypes.plastic.name]) {
                            tutorial._setState("plasticproduction");
                        }
                    
                        if (this.showMsg) {
                            statusMessages.addMessage(
                                "To turn the regolith into plastic, build a RegoPlasticiser. anywhere is fine",
                                magicTutorialPriority
                            );
                        }
                    },
                },

                // todo: you may need to build more power

                plasticproduction: {
                    timer: { nextState: "idle", time: 5000 },

                    tick: function() {
                        statusMessages.addMessage(
                            "You are now producing plastic!",
                            magicTutorialPriority
                        );
                    },
                },

                // to make steel, build a mine on a iron ore tile and build a refinery.

                // these refined resources can be further refined into widgets.

                // can you make some widgets without instruction?

                // to get more colonists, you need to provide food and water for them.

                // first build a mine on an ice tile and turn it into water with a melter.
                // then build a hydroponics pod to turn that water into food

                // build another mine/melter pair to produce extra water

                // you should now be growing!

                // growth
                
                idle: {
                },
            },
            _currentState: "gameStart",

            onEvent: function(eventName, param) {
                var state = this._states[this._currentState];
                
                if (state == null) {
                    return;
                }
                
                if (state[eventName] == null) {
                    return;
                }
                
                state[eventName](param);
                refreshStatusBar();
            },
            
            _setState: function(newStateName) {
//                console.log("switch to tutorial state " + newStateName);
                Crafty("Highlight").each(function() {
                    this.destroy(); 
                });
                this._currentState = newStateName;
                this.onEvent("enter");
                this._registerTimer(this._states[this._currentState]);
                this.onEvent("tick");
            },

            _registerTimer: function(currentState) {
                if (currentState == null || currentState.timer == null) {
                    return;
                }

                this.timeout(
                    function() { tutorial._setState(currentState.timer.nextState); }, 
                    currentState.timer.time);
            },
        });
    
    tutorial._setState("gameStart");
    tutorial.onEvent("tick");
}