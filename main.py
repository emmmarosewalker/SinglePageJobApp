from bottle import Bottle, debug, static_file, template, request, response
import uuid
import json

app = Bottle()
debug(True)

COOKIE_NAME = 'sessionid'
POSITIONS = None
## SESSIONS is a dictionary containing session info for
## each user session
## it will use sessionid as a key and store a dictionary per user
SESSIONS = {}


def get_sessionid():
    """Get the current sessionid from a request cookie
    or set one if not already present"""

    sessionid = request.get_cookie(COOKIE_NAME)
    if not sessionid:
        sessionid = uuid.uuid4().hex
        response.set_cookie(COOKIE_NAME, sessionid)

    return sessionid


def get_session_info(sessionid):
    """Get the session data stored for this sessionid"""

    global SESSIONS

    if not sessionid in SESSIONS:
        SESSIONS[sessionid] = {'applications': []}
    return SESSIONS[sessionid]


@app.route('/')
def index():
    """Deliver the index page. Really just a
    static file but for convenience we do this through
    the template"""

    # an awful hack since static_file doesn't use the global response
    # object in bottle so the cookie we want to set will be ignored
    # we copy the global response object here for safe keeping
    # replace it with the result of static_file
    # then call our cookie setting function which will add a cookie
    # to the response
    # then we restore the global response object
    # and finally return the one we've made with the cookie set
    #
    global response

    global_response = response

    response = static_file("index.html", root="views")

    # ensure there is a session id
    sessionid = get_sessionid()

    local_response = response
    response = global_response

    return local_response


def read_positions():
    """Load the positions data from the JSON
    file, make sure we do this only once"""

    global POSITIONS

    if not POSITIONS:
        with open("positions.json") as fd:
            POSITIONS = json.load(fd)

    return POSITIONS


@app.route('/positions')
def positions():

    d = read_positions()
    response.content_type = 'application/json'
    return json.dumps(d)


@app.post('/apply')
def post_apply():
    """Handle job application POST request

    /apply - accepts a POST request for a user to apply for a job, form fields:
        * position_id - id of the position you are applying for
        * first_name - applicant first name
        * last_name - applicant last name
        * years_experience - applicant years of work experience
        * expertise - sentence describing expertise of applicant
    """

    sessionid = get_sessionid()
    info = get_session_info(sessionid)

    # get form data

    application = {
        'position_id': request.forms.get('position_id'),
        'first_name': request.forms.get('first_name'),
        'last_name': request.forms.get('last_name'),
        'years_experience': request.forms.get('years_experience'),
        'expertise': request.forms.get('expertise'),
    }
    # add a new application to the list
    info['applications'].append(application)

    return {
            'count': len(info['applications']),
            # this message is supposed to be custom to the position but for
            # now just use a standard string
            'message': "Thanks for your application, we'll get back to you shortly"
    }

@app.route('/applications')
def applications():
    """Return a JSON list of applications for the current user"""

    sessionid = get_sessionid()
    info = get_session_info(sessionid)

    return info

@app.route('/static/<filepath:path>')
def static(filepath):

    return static_file(filepath, root='static')


if __name__ == '__main__':

    app.run()

