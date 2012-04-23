
var magicTutorialPriority = 939393;

function initTutorial() {

    tutorial = Crafty.e("Tutorial") // intentionall global
        .attr({
            _states: {
                gameStart: {
                    tick: function() { 
                        statusMessages.addMessage(
                            "Pick a tile for your ship to land on", 
                            magicTutorialPriority);
                    },
                    
                    onLanderPlaced: function() {
                        tutorial._setState("firstTimeIdle");
                    },
                },
                
                firstTimeIdle: {
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
                            tutorial._setState("astroanalyser");
                        }
                    },

                    resourcesViewOpened: function() {
                        tutorial._setState("astroanalyser");
                    },

                    tick: function() {
                        statusMessages.addMessage(
                            "...Click the Resources button on the left toggle to see what resource is under each tile...",
                            magicTutorialPriority
                        );
                    },
                },


                astroanalyser: {
                    showMsg: true,

                    enter: function() {
                        tutorial.timeout(
                            function() { tutorial._states.astroanalyser.showMsg = false; },
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
                
                idle: {
                },
            },
            _currentState: "gameStart",

            onEvent: function(eventName) {
                var state = this._states[this._currentState];
                
                if (state == null) {
                    return;
                }
                
                if (state[eventName] == null) {
                    return;
                }
                
                state[eventName]();
                refreshStatusBar();
            },
            
            _setState: function(newStateName) {
//                console.log("switch to tutorial state " + newStateName);
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
    
    tutorial.onEvent("tick");
}