(function(){

    /* your code goes here */

    $(document).ready(function(){

        // create an instance of the Jobs class and use getPositions to send AJAX request to get job listings information
        window.app.model = new window.app.Jobs();
        window.app.model.getPositions();

        // these are for use in the 'load more' functionality and the addJobs function so we don't attempt to display
        // more jobs than what we have stored.
        var numJobsDisplayed = 0;
        var totalJobs = 0;

        /* The main position rendering function. Takes two arguments, searching and searchTerms
         * searching is true if we're rendering jobs because a search query has occurred. The searchTerms
         * argument is an array containing the actual search terms.
          * */
        var addJobs = function(searching, searchTerms) {
            // uses the model to retrieve positions
            var positions = window.app.model.returnPositions();

            // use handlebars to render page templates
            var template = Handlebars.compile($('#positions_template').html());
            var loadMoreTemplate = Handlebars.compile($('#load_more_template').html());
            totalJobs = positions.length;

            var html = ""

            // if its a normal render without search terms, add ten positions to the page and ten more
            // with every click on 'show more jobs' card.
            if (searching === false) {
                var max = numJobsDisplayed + 10;
                var limitedPositions = [];

                // pushes a limited number of positions to an array so that not all positions are rendered at once
                for (var i = numJobsDisplayed; i < max; i++) {
                    limitedPositions.push(positions[i]);
                }

                // handlebars templates require object keys, we need to make the array a value of an object key
                html = template({positions: limitedPositions});

                $('#job-postings').append(html);
                $('#job-postings').append(loadMoreTemplate);
            }
            else {
                var max = positions.length;
                var foundMatches = [];

                // compare each search term with each position title. For each match found, add to the array
                for (var i = 0; i < max; i++){
                    for (var j = 0; j < searchTerms.length; j++) {
                        if (positions[i].title.toLowerCase().indexOf(searchTerms[j].toLowerCase()) >= 0){
                            foundMatches.push(positions[i]);
                        }
                    }
                }

                // render the template to show the search matches found
                html = template({positions: foundMatches});

                $('#job-postings').html(html);

                // if no matches are found, show a helpful message.
                if (foundMatches.length === 0){
                    $('#job-postings').append('<h3 class="mt-3">Oh no! No matches found :( try again.</h3>');
                }

            }

            // Adds a little effect that changes the vertical heading to be whatever the current title is of
            // the job the user is hovering over. It is a purely aesthetic function.
            $('.card').on("mouseenter", function(){
                var text = $(this).find('h3').text();
                $('#job-title-heading').text(text);
            });

            var activeCard = null;

            /* Listens for a user's click on a card (each job listing is shown on a card) and adds styling
             * to show which card has been clicked on. Then opens up the left pane to show more details
             * for that position. Then add's the job's id to the application form so that the form submission
             * knows which job is being applied for */
            $('.job-card').on("click", function(e){
                // cache the card
                activeCard = $(this);

                // add caret to the current card, remove it from any previous active card. Style card to look active.
                activeCard.siblings().find('.triangle').addClass('hidden');
                activeCard.siblings().removeClass('stay-hovered');
                activeCard.addClass('stay-hovered');
                activeCard.find('.triangle').removeClass('hidden');

                // cache the left pane and make it slide out. Slide animation is done using CSS keyframes.
                var leftPane = $('#left-pane');

                leftPane.removeClass('slideout');
                leftPane.addClass('slidein');
                $('#more-details').removeClass('hidden');

                var cardToRender;
                // tell the application form which job we're looking at
                for (var i = 0; i < positions.length; i ++) {
                    if (activeCard.attr('id') === positions[i].id){
                        cardToRender = positions[i];
                        $('#position_id').val(positions[i].id);
                    }
                }

                var template = Handlebars.compile($('#more_details_template').html());
                $('#job-details').html(template(cardToRender));


                // if previous application forms have had incomplete submission warnings or completion messages,
                // we need to remove these to have a fresh application form
                var invalidInput = $('#invalid-input');
                var applicationForm = $('#application-form');

                if (!invalidInput.hasClass('hidden')){
                    invalidInput.addClass('hidden');
                }

                if (applicationForm.hasClass('hidden')){
                    applicationForm.removeClass('hidden');
                }

                $('#success-message').addClass('hidden');


                // listen for a click on the close button and apply the slide animation to the left pane to hide it.
                // remove styling that makes the clicked-on card appear active.
                $('#close-button').on("click", function(){
                    $('#more-details').addClass('hidden');
                    $('#left-pane').removeClass('slidein');
                    $('#left-pane').addClass('slideout');
                    activeCard.find('.triangle').addClass('hidden');
                    activeCard.removeClass('stay-hovered');
                });

            });

            /* Get the applied-for positions and display them in the briefcase dropdown icon */
            $('#my-jobs').on('click', function(){

                // Uses the Jobs class in the model.js file to retrieve application data using AJAX
                window.app.model.getApplications();

                // Only do this once we've received data back.
                $(window).on("fetchedApplications", function(){
                    var temp = window.app.model.returnApplications();
                    var applications = temp.applications;
                    var jobids = [];
                    var myjobs = [];
                    var html = "<h4 class='form-label'>My Jobs:</h4>";

                    // get the positions that have been applied for
                    for (var i = 0; i < applications.length; i++){
                        jobids.push(applications[i].position_id);
                    }

                    /* compare the applied-for job id's with all of the job id's.
                    if backend were to be refactored, the job title being stored would
                    make this much more efficient */
                    for (var i = 0; i < jobids.length; i++ ){
                        console.log(jobids[i]);
                        for (var j = 0; j < positions.length; j++){
                            if (jobids[i] == positions[j].id){
                                myjobs.push(positions[j].title);
                            }
                        }
                    }

                    // Add <li> tags (I deemed this too trivial to require a handlebars template)
                    for (var i = 0; i < myjobs.length; i++){
                        console.log(myjobs[i]);
                        html += "<li>" + myjobs[i] + "</li>";
                    }

                    // Insert the position titles into the dropdown
                    $('#my-jobs-dropdown').html(html);

                });
                // Show/hide the dropdown menu when briefcase icon clicked.
                $('#my-jobs-dropdown').toggleClass('hidden');
            });

        };

        /* Listens for submission of an application form, validates that all fields has been entered
         * and prepares data for post request. Then makes post request to application endpoint '/apply'.
          * Prevents the browser's default refresh mechanism and calls the clearForm function to reset the
          * form */
        $('#application-form').submit(function(e){
            var formData = $( this ).serialize();

            // select all children of the type input of the application form
            var inputs = $('#application-form > input');

            // reset the form validation warning message in case it was previously showing, then check for
            // blank inputs and re-show the warning if blanks are found.
            var invalidInput = $('#invalid-input');

            invalidInput.addClass('hidden');

            var hasInvalidInput = false;

            for (var i = 0; i < inputs.length; i ++){
                if (inputs[i].value === ""){
                    hasInvalidInput = true;
                }
            }

            if (hasInvalidInput) {
                $('#invalid-input').removeClass('hidden');
            }

            // send AJAX request to /apply and clear the form data on completion.
            else {
                $.post({
                    url: '/apply',
                    data: formData,
                    success: function(data){
                        clearForm(inputs);
                    }
                });
            }

            e.preventDefault();
        });

        // clears application form
        function clearForm(inputs){
            for (var i = 0; i < inputs.length-1; i++){
                inputs[i].value = "";
            }
            $('#application-form').addClass('hidden');
            $('#success-message').removeClass('hidden');
        }

        /* The initial render function when the job data is first received by the window */
        $(window).on("fetchedPositions", function(){
            addJobs(false, false);
        });

        /* listens for a click on the outer element, but applies listener to the load more card
        because when listener is applied, load more card doesn't yet exist because it is created
        after the job positions are loaded. */
        $('#job-postings').on('click', '#load-more-card', function(){

            // make sure we don't try to load 10 more if we've loaded all jobs
            if (numJobsDisplayed < totalJobs-10) {
                numJobsDisplayed += 10;
                // Removes the load more card because a new one is appended after more jobs
                // Have been loaded to avoid having random 'load more' cards throughout results
                $('#load-more-card').remove();
                // Loads more jobs (false, false) means that we are loading normally, not searching.
                addJobs(false, false);
            }

            else {
                $('#load-more-card').html("<div class='card-details'><h4>Sorry, no jobs found.</h4></div>");
            }

            // Smoothly scrolls the view down to where the newly loaded jobs are
            $('#right-pane').animate({
                scrollTop: $("#right-pane").prop("scrollHeight")
            }, 1000);

        });

        /* Handles the search box submissions. It finds and prepares the values from the search box to be sent to the
         * addJobs function to display the found positions on the page. */
        $('#search-box').submit(function(e){
            // Make sure page doesn't refresh on submission.
            e.preventDefault();

            var searching = true;

            // get values and trim any white space from the ends
            var values = $('#search').val().trim()

            // split the search terms into separate array values because that is what the addJobs function expects
            var searchTerms = values.split(" ");

            // reset the search box to be blank
            $('#search-box').find('input:text').val('');

            // hides the search box and reveal the 'search again' button to prevent strange behaviour,
            // these are toggled in the #search-again event handler below
            $('#search-box').addClass('hidden');
            $('#search-again').removeClass('hidden');

            // use the addJobs function to render the search items to the page.
            addJobs(searching, searchTerms);
        });

        $('#search-again').on('click', function(){
            // fix for strange search behaviour
            $('#search-again').addClass('hidden');
            $('#search-box').removeClass('hidden');
            $('#job-postings').html("");
            addJobs(false, false);
        })

    });

})();
