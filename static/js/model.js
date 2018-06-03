(function (){

    var fetchedPositionsEvent = new Event('fetchedPositions');

    var fetchedApplicationsEvent = new Event('fetchedApplications');

    // declare main job class and set up default variables
    function Jobs(){
        this.positionsURL = '/positions';
        this.positions = [];
        this.applicationsURL = '/applications';
        this.applications = [];
    }

    Jobs.prototype.getPositions = function() {

        var self = this; // closure to bind  this to outer scope

        // AJAX request to get the positions
        $.get({
            url: self.positionsURL,
            success: function(data){
                self.positions = data;
                window.dispatchEvent(fetchedPositionsEvent); // tell main script we're ready to render
            }
        });

    };

    // send the positions to the script
    Jobs.prototype.returnPositions = function() {
        if (this.positions === []){
            return [];
        }
        else {
            return this.positions;
        }
    };

    Jobs.prototype.getApplications = function() {

        var self = this; // closure to bind this to outer scope

        // AJAX request to get user's applications
        $.get({
            url: self.applicationsURL,
            success: function(data){
                self.applications = data;
                window.dispatchEvent(fetchedApplicationsEvent);
            }
        });

    }

    // send the applications to the script
    Jobs.prototype.returnApplications = function() {
        if (this.applications === []){
            return null;
        }
        else {
            return this.applications;
        }
    };

    // Export to global scope
    window.app = window.app || {};
    window.app.Jobs = Jobs;

})();