import unittest
import bottle
import webtest
import main

bottle.debug()


class FunctionalTests(unittest.TestCase):

    def setUp(self):
        self.app = webtest.TestApp(main.app)
        main.SESSIONS = {}

    def test_get_positions(self):
        """the URL /positions returns a JSON list of
        positions"""

        result = self.app.get('/positions')

        self.assertEqual(result.status, "200 OK")
        self.assertEqual(result.content_type, 'application/json')
        self.assertEqual(len(result.json), 168)

    def test_cookie_set(self):
        """When I request the main page, I get a new session cookie
        """

        result = self.app.get('/')
        self.assertIn(main.COOKIE_NAME, self.app.cookies)
        sessionid = self.app.cookies[main.COOKIE_NAME]

        self.assertTrue(sessionid)
        # should be able to get session info for this sessionid

        info = main.get_session_info(sessionid)
        self.assertIn('applications', info)
        self.assertEqual(info['applications'], [])

    def test_applications(self):
        """The URL /applications returns a JSON structure
        with the current list of applications for the current user"""

        result = self.app.get('/applications')
        self.assertEqual(result.status, "200 OK")
        self.assertEqual(result.content_type, 'application/json')
        # no applications there initially
        self.assertEqual(result.json['applications'], [])

    def test_apply(self):
        """When I submit the form data to /apply a new
        application is added to the list"""

        formtext = """
<form action="/apply" method="POST">
    <input name="first_name" placeholder="first name">
    <input name="last_name" placeholder="last name">
    <input name="position_id" placeholder="position id">
    <input name="years_experience" placeholder="years experience">
    <input name="expertise" placeholder="expertise">
    <input type="submit">
</form>
"""
        response = self.app.get('/')
        form = webtest.forms.Form(response, formtext)
        form['first_name'] = "First"
        form['last_name'] = "Last"
        form['position_id'] = 123
        form['years_experience'] = 3
        form['expertise'] = "This that and the other"

        response = form.submit()
        self.assertIn('count', response.json)
        self.assertEqual(1, response.json['count'])
        self.assertIn('message', response.json)


        result = self.app.get('/applications')
        self.assertEqual(1, len(result.json['applications']))
        self.assertEqual("123", result.json['applications'][0]['position_id'])

        # do it again
        response = form.submit()
        result = self.app.get('/applications')
        self.assertEqual(2, len(result.json['applications']))


if __name__=='__main__':
    unittest.main(warnings='ignore')
