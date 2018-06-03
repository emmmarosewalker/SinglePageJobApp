# Jobs: A web app for viewing and applying for job roles!

This project is a single-page application (SPA) that uses jQuery to make AJAX requests to the server's API endpoints.
When the page is first loaded, an AJAX request is made to get the job data from the server. 10 positions fill the page with a
button to get more.
A user can click on any job card to bring up more details about the specific job. This is shown in a pane on the left-hand side
of the screen that is initially hidden, and slides out when required.
From the pane that slides out, users can choose to fill out a form to apply for that job, or close the pane by clicking a button.
Once the user has applied to at least one job, they can click on the briefcase icon next to the search bar to bring up a list
of the jobs that they have applied for. Note that at this stage, there is no database attached so user data is not stored.
If you wish to store user's likes via a login account, a database will need to be configured.
The user can additionally search by title through the search bar at the top of the page. If more than one search term is entered,
the results will include positions found to have any of the words submitted.

## Extra Features

### One: View applied-for jobs in dropdown

The first extra feature implemented is the ability to see open the briefcase item to view applied-for jobs. This feature is implemented
around lines approx. 100 to 150 in script.js.

```javascript
/* Get the applied-for positions and display them in the briefcase dropdown icon */
$('#my-jobs').on('click', function(){

                window.app.model.getApplications();

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
                        for (var j = 0; j < positions.length; j++){
                            if (jobids[i] == positions[j].id){
                                myjobs.push(positions[j].title);
                            }
                        }
                    }

                    // Add <li> tags (I deemed this too trivial to require a handlebars template)
                    for (var i = 0; i < myjobs.length; i++){
                        html += "<li>" + myjobs[i] + "</li>";
                    }

                    // Insert the position titles into the dropdown
                    $('#my-jobs-dropdown').html(html);

                });
                $('#my-jobs-dropdown').toggleClass('hidden');
            });

```
As you can see in the code above, a click listener is applied to the briefcase icon. The getApplications function
from model.js is called to retrieve the user's stored applications from the url '/applications'. That function implements
a custom event, which is fired when the data has been returned from the AJAX request, which is listened for in the nested function.
This then stores the applications and compares the IDs of the applied-for positions with all of the positions, in order to retrieve
the title for each. This is then displayed in the briefcase dropdown, whose appearance is toggled when the briefcase is clicked.

### Two: load more positions upon request
The second extra-feature implemented is the ability to load more jobs than what is initially displayed   
by pressing a button. This gives more of an infinite-scroll type-feel to the application, and allows 
the user to easy keep browsing the available jobs.

```javascript
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
```
Firstly, we listen for if the button has been clicked. If it has, we check that we've still got more 
positions to load, then call the function responsible for rendering the positions to the page. The 'load more' button is then removed and re-appended at the end of the new content. Finally, the view is smooth-scrolled downwards to make the new additions more obvious to the user.

### Prerequisites

Install bottle, start server

## Built With

* [jQuery](http://api.jquery.com/) - Javascript Framework
* [Bottle](https://bottlepy.org/docs/dev/) - A python web framework

## Authors

* **Steve Cassidy** [stevecassidy](http://pwp.stevecassidy.net/)
* **Emma Walker** [emmmarosewalker](https://github.com/emmmarosewalker)

## License

This project is licensed under the MIT License.
