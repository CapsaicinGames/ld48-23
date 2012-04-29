
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
            y: hudEntityToHighlight.y - 3,
            w: hudEntityToHighlight.w + 3,
            h: hudEntityToHighlight.h + 3,
            z: (hudEntityToHighlight.z + 1),
            highlightingEntityID: hudEntityToHighlight[0]
        })
        .css({
            "border": ("medium solid " + errorTextCol)
        })
        .bind("EnterFrame", function() {
            var highlightingEntity = Crafty(this.highlightingEntityID);
            if (highlightingEntity.length == 0) {
                this.destroy();
            }
        })
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
                            tutorial._setState("resourceGuide");
                        }
                    },
                },

                resourceGuide: {
                    timer: { nextState: "buildMine", time: 4000 },

                    tick: function() {
                        statusMessages.addMessage(
                            "Buildings cost resources. Resources can be mined from the ground and refined...",
                            magicTutorialPriority
                        );
                    },
                },

                buildMine: {
                    
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
                            function() { tutorial._states.buildAstroanalyser.showMsg = false; },
                            8000
                        );
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
                    showMsg: true,

                    enter: function() {
                        tutorial.timeout(
                            function() { tutorial._states.analyserInfo.showMsg = false; },
                            8000
                        );
                    },

                    tick: function() {
                        if (this.showMsg) {
                            statusMessages.addMessage(
                                "The Analyser will explore one tile every day. To make it explore faster, click Select, then tap on the Analyser...",
                                magicTutorialPriority
                            );
                        }
                    },

                    selectBuilding: function(blueprintName) {
                        tutorial._setState("explainColonists");
                    },
                },

                explainColonists: {
                    populate: function() {
                        tutorial._setState("analyserPopulateSuccess");
                    },

                    tick: function() {
                        statusMessages.addMessage(
                            "Most buildings need at least 1 colonist to function. Click the + sign on the right of the screen to add more.",
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
                    timer: { nextState: "idle", time: 5000 },

                    tick: function() {
                        statusMessages.addMessage(
                            "...but if you remove all colonists, a building will not function",
                            magicTutorialPriority
                        );
                    },
                },
                
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