
var tutorial = {

    _states: [
        {
            tick: function() { 
                statusMessages.addMessage(
                    "Explore the build menu on the right to decide what to build next", 
                    0);
            },

            buildMenuOpen: function() {
                tutorial._nextState();
            },
            
        }, {

            tick: function() {
                statusMessages.addMessage(
                    "Hover over each building for a detailed description",
                    0);
            },
        },
    ],
    _currentState: 0,

    init: function() {
    },

    onEvent: function(eventName) {
        if (this._currentState >= this._states.length) {
            return;
        }

        this._states[this._currentState][eventName]();
    },

    _nextState: function() {
        ++this._currentState;
    },

};

tutorial.init();