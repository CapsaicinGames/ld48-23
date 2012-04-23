
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
                    enter: function() {
                        tutorial.timeout(function() { tutorial._setState("waitForPower"); },
                                         5000);
                    },
                    
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
                    enter: function() {
                        tutorial.timeout(function() { tutorial._setState("buildMine"); },
                                         4000);
                    },

                    tick: function() {
                        statusMessages.addMessage(
                            "Buildings cost resources. Resources can be mined from the ground and refined...",
                            magicTutorialPriority
                        );
                    },
                },

                buildMine: {
                   enter: function() {
                        tutorial.timeout(function() { tutorial._setState("resourcesView"); },
                                         4000);
                    },

                    tick: function() {
                        statusMessages.addMessage(
                            "...Click the Resources button on the left toggle to see what resource is under each tile...",
                            magicTutorialPriority
                        );
                    },
                },

                resourcesView: {
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
                this.onEvent("tick");
            },
        });
    
    tutorial.onEvent("tick");
}