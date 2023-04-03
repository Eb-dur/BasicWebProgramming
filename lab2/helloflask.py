from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def hello_world():
    return render_template("client.html")


@app.route('/signup')
def signup():
    return False

if __name__ == '__main__':
    app.debug = True
    app.run()