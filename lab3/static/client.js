let LOGGED_IN_STATE = 1;
let POS = null;



window.onload = function () {
    //code that is executed as the page is loaded.
    //You shall put your own custom code here.
    //window.alert() is not allowed to be used in your implementation.
    //window.alert("Hello TDDD97!");
    displayView();
};




displayView = function () {
    //TODO: Make this work with database
    let signinToken = localStorage.getItem("signinToken");
    if (signinToken == null) {
        loadWelcomeView();
    }
    else {
        establishSocket(signinToken);
        loadProfileView(signinToken);
        //socket
    }
    return false;

};


// Load the sign in and sign up page.
function loadWelcomeView() {
    // Clear html of body.
    document.body.innerHTML = "";
    // Set up the view.
    let welcomeScript = document.getElementById("welcomeview");
    let welcomePage = document.createElement("div");
    welcomePage.setAttribute("id", "welcomeDiv");
    welcomePage.innerHTML = welcomeScript.innerHTML;
    document.body.appendChild(welcomePage);

    // On submit event for signing up.
    document.getElementById("signupform").onsubmit = function () {
        let formData = document.getElementById('signupform');
        let spsw = formData.spsw;
        let rpsw = formData.rpsw;
        let msg = document.getElementById("sservermsg");
        if (!passwordLenght(spsw.value)) {
            rpsw.value = '';
            msg.innerHTML = 'Password < 5 characters';
            return false;
        }
        if (spsw.value != rpsw.value) {
            rpsw.style.borderColor = 'red';
            msg.innerHTML = "Passwords do not match";
            return false;
        } else {
            rpsw.style.borderColor = spsw.style.borderColor;
        }
        let account = {
            email: formData.semail.value,
            password: formData.spsw.value,
            fname: formData.fname.value,
            lname: formData.lname.value,
            gender: formData.gender.value,
            city: formData.city.value,
            country: formData.country.value
        };

        let req = new XMLHttpRequest();
        req.open("POST", "/signup", true);
        req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                if (req.status == 201) {
                    // Initialize login
                    signIn(formData.semail.value, spsw.value);

                }
                else {
                    let resp = JSON.parse(req.responseText);
                    msg.innerHTML = resp.message;
                }

            }

        }
        req.send(JSON.stringify(account));
        return false;
    };

    // On submit event for sign in.
    document.getElementById("loginform").onsubmit = function () {
        let formData = document.getElementById("loginform");
        let msg = document.getElementById("lservermsg");
        if (!passwordLenght(formData.lpsw.value)) {
            msg.innerHTML = "Password < 5 characters";
            return false;
        }
        else {
            signIn(formData.lemail.value, formData.lpsw.value);

        }
        return false;
    };
};


function signIn(email, password) {
    let msg = document.getElementById("lservermsg");
    req = new XMLHttpRequest();
    req.open("POST", "/signin", true);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.onreadystatechange = function () {
        if (req.readyState == 4) {
            if (req.status == 200) {
                let resp = JSON.parse(req.responseText);
                //change vars
                localStorage.setItem("signinToken", resp.data);
                establishSocket(resp.data);
                loadProfileView(resp.data);
            }
            else {
                let resp = JSON.parse(req.responseText);
                msg.innerHTML = resp.message;
            }

        }
    }
    req.send(JSON.stringify({ "email": email, "password": password }));
    return false;
}


// Check if password is too short.
function passwordLenght(passwordString) {
    if (passwordString.length < 5) {
        return false;
    }
    else {
        return true;
    }
};


function loadProfileView(userToken) {
    // Set to home page
    LOGGED_IN_STATE = 1;

    // Clear html of body
    document.body.innerHTML = "";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (positionObject) {
            POS = positionObject;
            console.log(POS);
        });
    }

    // Load logged in view to home
    let profileView = document.getElementById("profileView");
    let profileDiv = document.createElement("div");

    profileDiv.setAttribute("id", "profileDiv");
    profileDiv.innerHTML = profileView.innerHTML;
    document.body.appendChild(profileDiv);

    // Set up user info from server.
    let req = new XMLHttpRequest();
    req.open("GET", "/userdata", true);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.setRequestHeader("Authorization", userToken);
    let response = null;
    req.onreadystatechange = function () {
        if (req.readyState == 4) {
            if (req.status == 200) {
                response = JSON.parse(req.responseText);
                let userData = response.data;
                document.getElementById("userfname").innerHTML = userData.fname;
                document.getElementById("userlname").innerHTML = userData.lname;
                document.getElementById("usergender").innerHTML = userData.gender;
                document.getElementById("usercity").innerHTML = userData.city;
                document.getElementById("usercountry").innerHTML = userData.country;
                document.getElementById("useremail").innerHTML = userData.email;
                document.getElementById("home").style.backgroundColor = "grey";
                loadUserWall();
            }
            else {
                loadWelcomeView();
                return false;
            }
        }
        return false;
    }
    req.send();


    // On click event for posting to your own wall.
    document.getElementById("userPostbtn").addEventListener("click", function () {
        let msg = document.getElementById("postError");
        let message = document.getElementById("userPostinput");
        if (message.value) {
            //TODO: Make this work with SERVER
            let req = new XMLHttpRequest();
            req.open("POST", "/postmessage", true);
            req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            req.setRequestHeader("Authorization", userToken);
            let response = null;
            req.onreadystatechange = function () {
                if (req.readyState == 4) {
                    if (req.status == 201) {
                        message.value = "";
                        loadUserWall();
                    }
                    else {
                        // what to do when error?
                        response = JSON.parse(req.responseText);
                        msg.innerHTML = response.message;
                    }
                }
            }
            req.send(JSON.stringify({ "message": message.value, "lat": POS.coords.latitude, "long": POS.coords.longitude }));
        }
        else {
            msg.innerHTML = "Nothing to post on wall"
        }
        return false;
    });

    document.getElementById("changepsw").onsubmit = function () {
        let formData = document.getElementById('changepsw');
        let opsw = formData.oldpsw;
        let npsw = formData.npsw;
        let rnpsw = formData.rnpsw;
        let msg = document.getElementById("changepswmsg");
        msg.style.color = "red";
        if (!passwordLenght(opsw.value)) {
            msg.innerHTML = 'Old password < 5 characters';
            return false;
        }
        if (opsw.value == npsw.value) {
            msg.innerHTML = "New password has to be different";
            return false;
        }
        if (!passwordLenght(npsw.value)) {
            rnpsw.value = '';
            msg.innerHTML = 'New password < 5 characters';
            return false;
        }
        if (npsw.value != rnpsw.value) {
            msg.innerHTML = "New passwords do not match";
            return false;
        }
        msg.innerHTML = response.message;
        req = new XMLHttpRequest();
        req.open("PUT", "/changepsw", true);
        req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        req.setRequestHeader("Authorization", userToken);
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    response = JSON.parse(req.responseText);
                    msg.innerHTML = response.message;
                    return false;
                }
                else if (req.status == 400) {
                    msg.innerHTML = response.message;
                    return false;
                }
            }
        }
        req.send(JSON.stringify({ "oldpassword": opsw.value, "npsw": npsw.value, "repeatpassword": rnpsw.value }));
        return false;

    };

    // On click event to post to an other users wall.
    document.getElementById("profilePostbtn").addEventListener("click", function () {
        let msg = document.getElementById("searchError");
        let message = document.getElementById("profilePostInput");
        let otherUserEmail = document.getElementById("profileemail").innerHTML;
        let pos = null;
        if (!otherUserEmail) {
            msg.innerHTML = "No wall to post on"
            return false;
        }
        if (message.value) {
            let req = new XMLHttpRequest();
            req.open("POST", "/postmessage", true);
            req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            req.setRequestHeader("Authorization", userToken);
            let response = null;
            req.onreadystatechange = function () {
                if (req.readyState == 4) {
                    if (req.status == 201) {
                        message.value = "";
                        reloadbtn();
                        return false;
                    }
                    else if (req.status == 400) {
                        // what to do when error?
                        response = JSON.parse(req.responseText);
                        msg.innerHTML = response.message;
                        return false;
                    }
                }
            }
            req.send(JSON.stringify({ "message": message.value, "user": otherUserEmail, "lat": POS.coords.latitude, "long": POS.coords.longitude }));
        }
        else {
            msg.innerHTML = "Nothing to post";
        }
    });

    // On click event for finding an other user in the browse view.
    document.getElementById("searchEmailbtn").addEventListener("click", function () {
        let searchedEmail = document.getElementById("searchEmail").value;
        loadBrowseWall(searchedEmail);
    });

    // On click event for the tabs
    let btns = document.querySelectorAll(".tab");
    btns.forEach(btn => {
        btn.addEventListener("click", function () {
            btn.style.backgroundcolor = "grey";
            decideTabView(btn.id);
        });
    })

    // On click event for signout button.
    document.getElementById("signoutbtn").addEventListener("click", function () {
        //TODO: Make this work with SERVER
        req.open("POST", "/signout", true);
        req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        req.setRequestHeader("Authorization", userToken);
        req.onreadystatechange = function () {
            if (req.readyState == 4 && req.status == 200) {
                localStorage.removeItem("signinToken");
                loadWelcomeView();
            }
        }
        req.send();
    });
};

function postMessage(positionObject, msg, otherUserEmail = false) {
    let positionReq = new XMLHttpRequest();

}



function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getCoordinates);
    }
    else {

    }

}



// Get the messages of your wall from the server.
function loadUserWall() {
    let msg = document.getElementById("postError");
    let userToken = localStorage.getItem("signinToken");
    let messages = null;
    let req = new XMLHttpRequest();
    req.open("GET", "/usermessages", true);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.setRequestHeader("Authorization", userToken);
    req.onreadystatechange = function () {
        if (req.readyState == 4) {
            if (req.status == 200) {
                messages = JSON.parse(req.responseText);
                let wall = document.getElementById("userWallMessages");

                if (messages.data.length > 0) {
                    msg.innerHTML = "";
                    while (wall.firstChild) {
                        wall.removeChild(wall.firstChild);
                    }
                    messages.data.forEach(element => {
                        let message = document.createElement("li");
                        let writer = document.createElement("p");
                        writer.innerHTML = "Posted by " + element.author + " posted from " + element.location + ": ";
                        message.appendChild(writer);

                        message.appendChild(document.createElement("br"));


                        let content = document.createElement("p");
                        content.innerHTML = element.message;
                        message.appendChild(content);
                        wall.appendChild(message);
                    });
                }
            } else {
                messages = JSON.parse(req.responseText);
                msg.innerHTML = messages.message;
            }
        }
    }
    req.send();
};


// Get the messages of the found user in the browse tab.
function loadBrowseWall(email) {

    let userToken = localStorage.getItem("signinToken");
    let msg = document.getElementById("searchError");
    let wall = document.getElementById("profileWallMessages");
    let messages = null;
    let req = new XMLHttpRequest();
    req.open("GET", `/browsemessages/${email}`, true);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.setRequestHeader("Authorization", userToken);
    req.onreadystatechange = function () {
        if (req.readyState == 4) {
            if (req.status == 200) {
                messageSuccess = true;
                messages = JSON.parse(req.responseText);
                while (wall.firstChild) {
                    wall.removeChild(wall.firstChild);
                }
                if (messages.data.length > 0) {

                    msg.innerHTML = ""
                    messages.data.forEach(element => {
                        let message = document.createElement("li");
                        let writer = document.createElement("p");
                        writer.innerHTML = "Posted by " + element.author + " posted from " + element.location + ": ";
                        message.appendChild(writer);
                        message.appendChild(document.createElement("br"));
                        let content = document.createElement("p");
                        content.innerHTML = element.message;;
                        message.appendChild(content);
                        wall.appendChild(message);
                    });

                }
            }
            else {
                messages = JSON.parse(req.responseText);
                msg.innerHTML = messages.message;

            }
        }
        let req2 = new XMLHttpRequest();

        req2.open("GET", `/browsedata/${email}`, true);
        req2.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        req2.setRequestHeader("Authorization", userToken);
        req2.onreadystatechange = function () {
            if (req2.readyState == 4) {
                if (req2.status == 200) {
                    response = JSON.parse(req2.responseText);
                    let profileData = response.data;
                    document.getElementById("profilefname").innerHTML = profileData.fname;
                    document.getElementById("profilename").innerHTML = profileData.lname;
                    document.getElementById("profilegender").innerHTML = profileData.gender;
                    document.getElementById("profilecity").innerHTML = profileData.city;
                    document.getElementById("profilecountry").innerHTML = profileData.country;
                    document.getElementById("profileemail").innerHTML = profileData.email;
                }
                else {
                    response = JSON.parse(req2.responseText);
                    msg.innerHTML = response.message;
                }
            }
        }
        req2.send();
    }
    req.send();
};

// Change between tabs.
function decideTabView(buttonId) {
    let homeDiv = document.getElementById("homeView");
    let accountDiv = document.getElementById("accountView");
    let browseDiv = document.getElementById("browseView");
    let home = document.getElementById("home");
    let account = document.getElementById("account");
    let browse = document.getElementById("browse");


    switch (buttonId) {
        case 'home':
            LOGGED_IN_STATE = 1;

            home.style.backgroundColor = "grey";
            account.style.backgroundColor = "lightgrey";
            browse.style.backgroundColor = "lightgrey";

            homeDiv.style.display = "block";
            accountDiv.style.display = "none";
            browseDiv.style.display = "none";
            reloadbtn();
            return false;

        case "account":
            LOGGED_IN_STATE = 2;

            home.style.backgroundColor = "lightgrey";
            account.style.backgroundColor = "grey";
            browse.style.backgroundColor = "lightgrey";

            accountDiv.style.display = "block";
            homeDiv.style.display = "none";
            browseDiv.style.display = "none";
            return false;

        case "browse":
            LOGGED_IN_STATE = 3;

            home.style.backgroundColor = "lightgrey";
            account.style.backgroundColor = "lightgrey";
            browse.style.backgroundColor = "grey";

            browseDiv.style.display = "block";
            accountDiv.style.display = "none";
            homeDiv.style.display = "none";
            let email = document.getElementById("profileemail").innerHTML;
            if (email) {
                reloadbtn();
            }
            return false;

        case "reload":
            reloadbtn();
            return false;

        default:
            return false;
    }
};

// Functionallity of reload button.
// TODO: This can be improved.
function reloadbtn() {
    if (LOGGED_IN_STATE == 1) {
        document.getElementById("userWallMessages").innerHTML = "";
        loadUserWall();
        return false;
    }
    else if (LOGGED_IN_STATE == 3) {
        let email = document.getElementById("profileemail").innerHTML;
        document.getElementById("profileWallMessages").innerHTML = "";
        loadBrowseWall(email);
        return false;
    }
    else {
        return false;
    }
};

function establishSocket(userToken) {
    var socket = new WebSocket('ws://localhost:8000/socketconnect/' + userToken);
    socket.onmessage = function (event) {
        if (event.data == "signout") {
            localStorage.removeItem("signinToken");
            loadWelcomeView();
        }
    }
}
