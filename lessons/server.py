from flask import Flask, request, jsonify

import database_handler

app = Flask(__name__)

@app.route("/", methods = ['GET'])
def root():
    return "", 200

@app.teardown_request
def teardown(exception):
    database_handler.disconnect()

@app.route('/contact/create/', methods = ['POST'])
def save_contact():
    data = request.get_json()
    if 'name' in data and 'number' in data:
        if len(data['name']) <= 120 and len(data['number']) <= 20:
            resp = database_handler.create_contact(data['name'], data['number'])
            if resp:
                return "", 201
            else:
                return "", 409
        else:
            return '', 400
    else:
        return '', 400

@app.route('/contact/find/<name>', methods = ['GET'])
def query_contact(name):
    if name is not None:
        resp = database_handler.get_contact(name)
        return jsonify(resp), 200
    else:
        return "", 400
    


if __name__ == '__main__':
    app.debug = True
    app.run()