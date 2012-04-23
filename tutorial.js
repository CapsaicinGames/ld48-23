
function initTutorial() {

    tutorial = Crafty.e("Tutorial") // intentionall global
        .attr({
            _states: {
                gameStart: {
                    tick: function() { 
                        statusMessages.addMessage(
                            "Pick a tile for your ship to land on", 
                            0);
                    },
                    
                    onLanderPlaced: function() {
                        tutorial._setState("firstTimeIdle");
                    },
                },
                
                firstTimeIdle: {
                    tick: function() { 
                        statusMessages.addMessage(
                            "Explore the build menu on the right to decide what to build next", 
                            0);
                    },
                    
                    buildMenuOpen: function() {
                        tutorial._setState("firstTimeInBuildMenu");
                    },    
                }, 
                
                firstTimeInBuildMenu: {
                    enter: function() {
                        tutorial.timeout(function() { tutorial._setState("idle"); },
                                     5000);
                    },
                    
                    tick: function() {
                        statusMessages.addMessage(
                            "Hover over each building for a detailed description",
                            0);
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
                console.log("switch to tutorial state " + newStateName);
                this._currentState = newStateName;
                this.onEvent("enter");
                this.onEvent("tick");
            },
        });
    
    tutorial.onEvent("tick");
}