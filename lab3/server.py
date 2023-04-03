from flask import Flask, render_template, request, jsonify
from email_validator import validate_email, EmailNotValidError
from waitress import serve
from flask_sock import Sock
import database_helper as helper
import json
import string
import random
import hashlib
import http.client
import urllib.parse
import requests as r
# waitress-serve --host 127.0.0.1 server:app
# gunicorn -b 127.0.0.1:8000 --workers 1 --threads 100 server:app

app = Flask(__name__)
sock = Sock(app)

sockets = {}


@sock.route("/socketconnect/<token>")
def socket_connect(ws, token):
    email, success = helper.get_email_from_token(token)
    if not success:
        ws.close()
    if email.lower() in sockets:
        sockets[email.lower()].send("signout")
    sockets[email.lower()] = ws
    while True:
        pass


@app.route('/', methods=["GET"])
def root():
    return render_template("client.html")


@app.teardown_request
def teardown(exception):
    helper.disconnect()


@app.route('/signup', methods=["POST"])
def sign_up():
    response = {}
    signupData = request.get_json()

    if not all(x for x in signupData.values()):
        response["message"] = "Some field is empty"
        return jsonify(response), 400

    try:
        validation = validate_email(signupData["email"])
    except EmailNotValidError as e:
        response["message"] = str(e)
        return jsonify(response), 400

    if len(signupData["password"]) < 6:
        response["message"] = "Password must be at least 6 characters long"
        return jsonify(response), 400

    """Do stuff with info"""

    _, userExists = helper.get_user_data_email(signupData['email'])
    if userExists:
        response["message"] = "User already exists"
        return jsonify(response), 409

    signupData["password"] = hashlib.md5(
        signupData['password'].encode()).hexdigest()
    success = helper.create_user(signupData)

    if success:
        response["message"] = "User created successfully"
        return jsonify(response), 201

    else:
        response["message"] = "Could not create user"
        return jsonify(response), 500


@app.route('/signin', methods=['POST'])
def sign_in():
    response = {}
    signinData = request.get_json()

    if not all(x for x in signinData.values()):
        response["message"] = "Some field is empty"
        return jsonify(response), 400

    try:
        validation = validate_email(signinData["email"])

    except EmailNotValidError as e:
        response["message"] = str(e)
        return jsonify(response), 400

    if len(signinData["password"]) < 6:
        response["message"] = "Password too short"
        return jsonify(response), 400

    psw, resp = helper.get_user_password(signinData["email"])
    if not resp:
        response["message"] = "User does not exist"
        return jsonify(response), 404

    if psw == hashlib.md5(signinData["password"].encode()).hexdigest():
        response['message'] = "Signed in"
        token = generate_token()
        response['data'] = token

        if not helper.bind_token_to_email(token, signinData["email"]):
            response["message"] = "Error while binding token to email"
            return jsonify(response), 500

        return jsonify(response), 200

    else:
        response['message'] = "Invalid password"
        return jsonify(response), 400


@app.route('/signout', methods=['POST'])
def sign_out():
    response = {}
    token = request.headers["Authorization"]
    if not token:
        response["message"] = "No token provided"
        return jsonify(response), 401
    email, succss = helper.get_email_from_token(token)
    if not succss:
        return "", 400
    if not helper.remove_token(token):
        return "", 500
    sockets[email.lower()].close()
    sockets.pop(email.lower())
    return "", 200


@app.route('/changepsw', methods=['PUT'])
def change_password():
    response = {}
    token = request.headers["Authorization"]
    if not token:
        response["message"] = "No token provided"
        return jsonify(response), 401

    data = request.get_json()
    if not all(x for x in data.values()):
        response["message"] = "Some field is missing"
        return jsonify(response), 400

    email, emailResp = helper.get_email_from_token(token)
    if not emailResp:
        response["message"] = "Invalid token"
        return jsonify(response), 401

    password, passwordGetResp = helper.get_user_password(email)
    if not passwordGetResp:
        response["message"] = "User does not exist"
        return jsonify(response), 404

    if data["npsw"] != data["repeatpassword"]:
        response["message"] = "Passwords dont't match"
        return jsonify(response), 400

    elif password != hashlib.md5(data["oldpassword"].encode()).hexdigest():
        response["message"] = "Old password does not match"
        return jsonify(response), 400

    elif password == hashlib.md5(data["npsw"].encode()).hexdigest():
        response["message"] = "New password same as old password"
        return jsonify(response), 409

    else:
        cpswd = {}
        cpswd["npsw"] = hashlib.md5(data["npsw"].encode()).hexdigest()
        cpswd["email"] = email
        dbResponse = helper.update_password(cpswd)
        if dbResponse:
            response["message"] = "Password changed successfully"
            return jsonify(response), 200

        else:
            response["message"] = "Password NOT changed successfully"
            return jsonify(response), 500


"""
@app.route('/browse/<email>')
def search_user(email):
    userData = get_user_data_by_email(email)
    userMessages = get_user_messages_by_email(email)"""


@app.route("/browsemessages/<email>")
def get_user_messages_by_email(email):
    response = {}
    token = request.headers['Authorization']
    if not token:
        response["message"] = "No token provided"
        return jsonify(response), 401
    # TODO borde vara not?

    data, messageGetResp = helper.get_user_messages_email(email)
    if not messageGetResp:
        response["message"] = "There is no such user"
        return jsonify(response), 404
    response["data"] = data
    response["message"] = "Messages recieved from database"
    return jsonify(response), 200


@app.route("/usermessages")
def get_user_messages_by_token():
    response = {}
    token = request.headers['Authorization']

    if not token:
        response["message"] = "No token provided"
        return jsonify(response), 401

    email, emailResp = helper.get_email_from_token(token)

    if not emailResp:
        response["message"] = "Could not get email from token"
        return jsonify(response), 500
    return get_user_messages_by_email(email)


@app.route("/browsedata/<email>")
def get_user_data_by_email(email):
    response = {}
    token = request.headers['Authorization']
    if not token:
        response["message"] = "No token provided"
        return jsonify(response), 401

    data, success = helper.get_user_data_email(email)
    if not success:
        response["message"] = "User not found"
        return jsonify(response), 404
    else:
        response["message"] = "Userdata gathered successfully"
        response["data"] = data
    return jsonify(response), 200


@app.route("/userdata")
def get_user_data_by_token():
    response = {}
    token = request.headers['Authorization']
    if not token:
        response["message"] = "No token provided"
        return jsonify(response), 401
    email, emailResp = helper.get_email_from_token(token)
    if not emailResp:
        response["message"] = "Could not get email from token"
        return jsonify(response), 500
    return get_user_data_by_email(email)


@app.route("/postmessage", methods=["POST"])
def post_message():
    response = {}
    token = request.headers['Authorization']
    if not token:
        response["message"] = "No token provided"
        return jsonify(response), 401
    data = request.get_json()
    conn = http.client.HTTPConnection('geocode.xyz')
    params = urllib.parse.urlencode(
        {'locate': f'{data["lat"]},{data["long"]}', 'json': 1})
    conn.request("GET", "/?{}".format(params))
    res = conn.getresponse()
    locdata = res.read()
    location = json.loads(locdata.decode('utf-8'))
    if 'success' in location.keys():
        location = "Failed to get location"
    else:
        location = location['city']

    if not all(x for x in data.values()):
        response["message"] = "Some field is missing"
        return jsonify(response), 400

    authorEmail, emailResp = helper.get_email_from_token(token)
    if not emailResp:
        response["message"] = "Author email does not exist"
        return jsonify(response), 404

    if "user" in data:
        formattedData = {"user": data["user"],
                         "message": data["message"],
                         "author": authorEmail,
                         "location": location}
    else:
        formattedData = {"message": data["message"],
                         "author": authorEmail,
                         "user": authorEmail,
                         "location": location}
    postResp = helper.post_message(formattedData)
    if not postResp:
        response["message"] = "Error while posting message"
        return jsonify(response), 500
    else:
        response["message"] = "Message posted successfully"
        return jsonify(response), 201


def generate_token():
    # choose from all lowercase letter
    letters = string.ascii_lowercase
    result_str = ''.join(random.choice(letters) for i in range(32))
    return result_str


if __name__ == '__main__':
    app.debug = True
    serve(app, host='127.0.0.1', port=8080, threads=1)
