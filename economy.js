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
         *  @param resourceList array of map{r,.delta)
         *  @returns true iff debit was successful
         */
        debit: function (resourceList) {
            var success = true;
            for (var i = 0; i < resourceList.length; i++) {
                var res = resourceList[i];
                if (res.delta < 0) {
                    if (this._resources[res.r] < -res.delta)
                        success = false;
                }
            }

            if (success === true) {
                for (var i = 0; i < resourceList.length; i++) {
                    var res = resourceList[i];
                    this._resources[res.r] += res.delta;
                }
            }

            return success;
        },

        updateResources: function() {
            /*var currentResources = this._resources;
            Crafty("Building").each(function() {
                for(var i = 0; i < this.resourceDeltas.length; ++i) {
                    var rKey = this.resourceDeltas[i];
                    currentResources[rKey.r] += rKey.delta;
                }
            });
            this._resources = currentResources;*/
            var bldgList = [];
            Crafty("Building").each(function() {
                if (this.isActive() === true)
                    bldgList.push(this.resourceDeltas);
            });
            for (var i = 0; i < bldgList.length; ++i) {
                this.debit(bldgList[i]);
            }
            var newStorage = {};
            Crafty("Storage").each(function() {
                for (var i = 0; i < this.storageDeltas.length; ++i) {
                    var res = this.storageDeltas[i];
                    if (newStorage[res.r] == undefined) {
                        newStorage[res.r] = res.delta;
                    } else {
                        newStorage[res.r] += res.delta;
                    }
                }
            });
            for (var type in this._resources) {
                if (this._resources[type] > newStorage[type]) {
                    this._resources[type] = newStorage[type];
                }
            }
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

