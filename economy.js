// tea-leaved from http://snippets.dzone.com/posts/show/849
shuffle = function(o) {
   for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
   return o; 
};

var economy_setup = function() {
    
    Crafty.c("Economy", {
        _resources: {},
        _totalColonists: 0,
        _storage: {},
        
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

        updateProduction: function() {
            var bldgList = [];
            Crafty("Building").each(function() {
                if (this.isActive() === true)
                    bldgList.push(this.resourceDeltas);
            });
            for (var i = 0; i < bldgList.length; ++i) {
                this.debit(bldgList[i]);
            }
            var totalcol = 0;
            Crafty("Building").each(function() {
                totalcol += this._colonists;
            });
            this._totalColonists = totalcol + this._resources["Spare Colonists"];
        },
        constrainResources: function() {
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
            this._storage = newStorage;

            for (var type in this._resources) {
                if (this._resources[type] > newStorage[type]) {
                    this._resources[type] = newStorage[type];
                }
            }
        },
        consumeResources: function() {
            var rescount = Math.ceil(this._totalColonists / colonistNeeds.per);
            var kill = 0;
            for (var i = 0; i < rescount; ++i) {
                if (!this.debit(colonistNeeds.uses)) {
                    kill++;
                    break;
                 }
            }
            var topkill = 0;
            // Kill spare colonists first
            while (kill > 0 && this._resources["Spare Colonists"] > 0) {
                this._resources["Spare Colonists"]--;
                kill--;
            }
            var totalcol = 0;
            // Then the ones in buildings
            shuffle(Crafty("Building")).each(function() {
                while (kill > 0 && this._colonists > 0)
                {
                    kill--;
                    this._colonists--;
                }
                totalcol += this._colonists;
            });
            this._totalColonists = totalcol + this._resources["Spare Colonists"];
            /*if (this._totalColonists <= 0) {
                Crafty.scene("GameOver");
            }*/
            return topkill;
        },
        tickBuildings: function() {
            Crafty("Building").each(function() {
                this.onTick(); 
            });
        },
    });

    return Crafty.e("Economy")
            .attr({
            days: 0,
            speed: 1,
            dead: 0,
            timePerStep: 2000,
            newStep: function() {
                this.days++;
                var oldres = Crafty.clone(this._resources);
                var killed = 0;
                this.updateProduction();
                this.tickBuildings();
                if (!(this.days % colonistNeeds.every)) {
                    killed += this.consumeResources();
                    //console.log(killed + " died, now " + this._totalColonists);
                }
                if (killed == 0) {
                    // no deaths, there were enough resources
                    var breed = true;
                    for (var i = 0; i < colonistBreeding.neededDelta.length; ++i) {
                        var res = colonistBreeding.neededDelta[i];
                        var diff = this._resources[res.r] - oldres[res.r];
                        if (diff < res.delta)
                            breed = false;
                    }
                    if (this._storage["Spare Colonists"] <= 
                            this._totalColonists) {
                        breed = false;
                    }
                    if (breed) {
                        this._resources["Spare Colonists"]++;
                        this._totalColonists++;
                        //console.log("Bred to " + this._totalColonists);
                    }
                }
                this.constrainResources();
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
                this.timeout(function() {this.newStep();}, this.timePerStep);
            },
            populate: function(building, delta) {
                var okay = false;
                var newbldgtotal = building._colonists + delta;
                if (delta > 0 && 
                    this._resources["Spare Colonists"] >= delta &&
                    newbldgtotal <= building.maxColonists) {
                    okay = true;
                } else if (delta < 0 && newbldgtotal >= 0) {
                    okay = true;
                } else {
                    okay = false;
                }
                if (okay === true) {
                    building._colonists += delta;
                    this._resources["Spare Colonists"] -= delta;
                }
            },
            updateStatus : function() {

                var newstatus = "";

                for(var rKey in this._resources) {
                    newstatus += "<b>" + rKey + "</b>: " + this._resources[rKey].toFixed(1) + "<br/>";
                }
                newstatus += "<b>Colony size</b>: " + this._totalColonists + "<br>";
                newstatus += "<b>Day</b>: " + this.days + "<br>";
                Crafty("Status").each(function() {
                        this.text(newstatus);
                });
            }});
};

