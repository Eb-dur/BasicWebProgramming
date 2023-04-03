import sqlite3
from flask import g

DATABASE_URI = "database.db"
DATABASE_CONNECTION = sqlite3.connect(DATABASE_URI)


def get_db():
    try:
        # for server connection
        db = getattr(g, 'db', None)
        if db is None:
            db = g.db = sqlite3.connect(DATABASE_URI)
        return db
    except:
        # local debug purpose
        print("g does not work!")
        return DATABASE_CONNECTION


def disconnect():
    db = getattr(g, 'db', None)
    if db is not None:
        g.db.close()
        g.db = None


def get_user_data_email(email: str):
    "Retrieves data from db with key email"
    try:
        cursor = get_db().execute(
            "select * from users where email like ?;", [email])
        matches = cursor.fetchall()
        cursor.close()

        return {
            'email': matches[0][0],
            'fname': matches[0][2],
            'lname': matches[0][3],
            'gender': matches[0][4],
            'city': matches[0][5],
            'country': matches[0][6]
        }, True

    except:
        return "Fail", False


def get_user_messages_email(email: str):
    "Retrieves messages from db with key email"
    try:
        cursor = get_db().execute(
            "select * from usermessages where user like ?;", [email])
        matches = cursor.fetchall()
        cursor.close()

        result = []
        for index in range(len(matches)):
            result.append({
                'author': matches[index][1],
                'message': matches[index][2],
                'location': matches[index][3],
            })

        return result, True
    except:
        "Fail", False


def get_user_password(email):
    try:
        cursor = get_db().execute(
            "SELECT password FROM users WHERE email=?;", [email])
        psw = cursor.fetchone()
        cursor.close()
        return psw[0], True
    except:
        return "Fail", False


def create_user(profileInfo: dict):
    "Creates user and puts in db"
    try:
        get_db().execute("INSERT INTO users VALUES(?, ?, ?, ?, ?, ?, ?);", [
            profileInfo["email"],
            profileInfo["password"],
            profileInfo["fname"],
            profileInfo["lname"],
            profileInfo["gender"],
            profileInfo["city"],
            profileInfo["country"]
        ]
        )
        get_db().commit()
        return True
    except:
        return False


def delete_user(email: str):
    "Removes user and puts in db"
    try:
        get_db().execute("delete from users where email = ?;", [email])
        get_db().commit()
        return True
    except:
        return False


def post_message(messageDict: dict):
    "Creates a message to wall {user,author, message}"
    try:
        get_db().execute("insert into usermessages values(?, ?, ?, ?);", [
            messageDict["user"],
            messageDict["author"],
            messageDict["message"],
            messageDict["location"]
        ]
        )
        get_db().commit()
        return True
    except:
        return False


def update_password(npswDict: dict):
    "Changes password on email {email, npsw}"
    try:
        get_db().execute("update users set password = ? where email = ?;", [
            npswDict['npsw'],
            npswDict['email']
        ])
        get_db().commit()
        return True
    except:
        return False


def bind_token_to_email(token: str, email: str):
    try:
        get_db().execute("DELETE FROM loggedinusers WHERE email=?;", [email])
        get_db().commit()

    except:
        print("Oh fuck")

    try:
        get_db().execute(
            "INSERT INTO loggedinusers VALUES(?,?);", [email, token])
        get_db().commit()
        return True

    except:
        return False


def remove_token(token: str):
    try:
        get_db().execute("DELETE FROM loggedinusers WHERE token=?;", [token])
        get_db().commit()
        return True

    except:
        return False


def get_email_from_token(token: str):
    try:
        cursor = get_db().execute(
            "SELECT email FROM loggedinusers WHERE token=?;", [token])
        email = cursor.fetchone()
        cursor.close()
        return email[0], True

    except:
        return "Fail", False
