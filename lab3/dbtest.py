import database_helper
from email_validator import validate_email, EmailNotValidError

email = "my+äddress@gmail.com"
is_new_account = True  # False for login pages

try:
    # Check that the email address is valid.
    validation = validate_email(email, check_deliverability=is_new_account)

    # Take the normalized form of the email address
    # for all logic beyond this point (especially
    # before going to a database query where equality
    # may not take into account Unicode normalization).
    email = validation.email
    print(email)
except EmailNotValidError as e:
    # Email is not valid.
    # The exception message is human-readable.
    print(str(e))


def test_db():
    userdata = {
        "email": "test10@bajs.se",
        "password": "123456",
        "fname": "hej",
        "lname": "test",
        "gender": "man",
        "city": "Linkan",
        "country": "Sweden"
    }

    print(database_helper.create_user(userdata))


data = {"name": ""}

for element in data.values():
    if element:
        print("yes1")
    else:
        print("no1")

if data["name"]:
    print("yes")
else:
    print("no")

print(all(x for x in data.values()))
