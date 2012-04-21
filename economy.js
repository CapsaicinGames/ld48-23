var economy_setup = function() {
    return Crafty.e("Economy")
            .attr({
            food: 10,
            ice: 0,
            water: 10,
            oxygen: 10,
            plastic: 50,
            metal: 100,
            powerGeneration: 0,
            days: 0,
            speed: 1,
            timePerStep: 2000,
            newStep: function() {
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
                var newstatus = "<b>Food</b>: " + this.food + "<br>";
                newstatus += "<b>Plastic</b>: " + this.metal + "<br>";
                newstatus += "<b>Day</b>: " + this.days + "<br>";
                Crafty("Status").each(function() {
                        this.text(newstatus);
                });
            }});
};

