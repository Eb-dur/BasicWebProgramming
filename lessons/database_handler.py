import sqlite3
from flask import g

DATABASE_URI = "database.db"

def get_db():
    db = getattr(g, 'db', None)
    if db is None:
        db = g.db = sqlite3.connect(DATABASE_URI)
    return db

def disconnect():
    db = getattr(g, 'db', None)
    if db is not None:
        g.db.close()
        g.db = None

def create_contact(name, number):
    try:
        get_db().execute("insert into contact values(?, ?);", [name, number])
        get_db().commit()
        return True
    except:
        return False

def get_contact(name):
    cursor = get_db().execute("select * from contact where name like ?;", [name])
    matches = cursor.fetchall()
    cursor.close()

    result = []
    for index in range(len(matches)):
        result.append({'name': matches[index][0], 'number': matches[index][1]})
    
    return result
