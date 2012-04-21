var economy_setup = function() {
    
    Crafty.c("Economy", {
        _resources: {},
        
        init: function() {
            for(var rKey in resourcetypes) {
                this._resources[resourcetypes[rKey].name] = resourcetypes[rKey].initialValue;
            }
        },
        
        getResourceValue: function(resourceType) {
            return this._resources[resourceType.name];
        },

        /** Attempt to debit an array of resources
         *  @param resourceList array of map{r, cost)
         *  @returns true iff debit was successful
         */
        debit: function (resourceList) {
            var success = true;
            for (var i = 0; i < resourceList.length; i++)
            {
                var res = resourceList[i];
                if (this._resources[res.r] < res.cost)
                    success = false;
            }

            if (success === true)
            {
                for (var i = 0; i < resourceList.length; i++)
                {
                    var res = resourceList[i];
                    this._resources[res.r] -= res.cost;
                }
            }

            return success;
        },

        updateResources: function() {
            var currentResources = this._resources;
            Crafty("Building").each(function() {
                for(var rKey in this.resourceDeltas) {
                    currentResources[rKey] += this.resourceDeltas[rKey];
                }
            });
            this._resources = currentResources;
        }
    });

    return Crafty.e("Economy")
            .attr({
            days: 0,
            speed: 1,
            timePerStep: 2000,
            newStep: function() {
                this.updateResources();
                this.updateStatus();
                switch(this.speed)
                {
                case 5:
                    this.timePerStep = 400;
                    break;
                case 2:
                    this.timePerStep = 1000;
                    break;
                case 0:
                    return;
                    break;
                case 1:
                default:
                    this.timePerStep = 2000;
                }
                this.days++;
                this.timeout(function() {this.newStep();}, this.timePerStep);
            },
            updateStatus : function() {

                var newstatus = "";

                for(var rKey in this._resources) {
                    newstatus += "<b>" + rKey + "</b>: " + this._resources[rKey] + "<br/>";
                }
                
                newstatus += "<b>Day</b>: " + this.days + "<br>";
                Crafty("Status").each(function() {
                        this.text(newstatus);
                });
            }});
};

