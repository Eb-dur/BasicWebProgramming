-- SQLBook: Code
CREATE TABLE IF NOT EXISTS users(
    --UserToken int NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    firstName TEXT NOT NULL,
    familyName TEXT NOT NULL,
    gender TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    PRIMARY KEY (email)
);

CREATE TABLE IF NOT EXISTS usermessages(
    user TEXT NOT NULL,
    author TEXT NOT NULL,
    message TEXT,
    location TEXT NOT NULL, 
    FOREIGN KEY (user) REFERENCES users(email)
);

CREATE TABLE IF NOT EXISTS loggedinusers(
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    PRIMARY KEY (token),
    FOREIGN KEY (email) REFERENCES users(email)

)