let LOGGED_IN_STATE = 1;


displayView = function () {
    let signinToken = localStorage.getItem("signinToken");
    // the code required to display a view
    if (signinToken === null) {
        loadWelcomeView();
    }
    else {
        let userData = serverstub.getUserDataByToken(signinToken)
        if (!userData.success) {
            loadWelcomeView();
        }
        else {
            loadProfileView(signinToken);
        }
    }
};


window.onload = function () {
    //code that is executed as the page is loaded.
    //You shall put your own custom code here.
    //window.alert() is not allowed to be used in your implementation.
    //window.alert("Hello TDDD97!");
    displayView();
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
        let response = packAndSendSignUp(formData);
        if (response.success) {
            // Initialize login
            let responseToSignIn = serverstub.signIn(formData.semail.value, spsw.value);
            if (responseToSignIn.success) {
                localStorage.setItem("signinToken", responseToSignIn.data);
                document.body.innerHTML = "";
                loadProfileView(responseToSignIn.data);
            } else {
                msg.innerHTML = "When logging in: " + responseToSignIn.message;
                return false;
            }
            return false;
        }
        else {
            msg.innerHTML = response.message;
            return false;
        }
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
            let response = serverstub.signIn(formData.lemail.value, formData.lpsw.value);
            if (response.success) {
                localStorage.setItem("signinToken", response.data);
                document.body.innerHTML = "";
                loadProfileView(response.data);
            } else {
                msg.innerHTML = response.message;
                return false;
            }
            return false;
        }
    };
};

// Send data to server for sign up.
function packAndSendSignUp(signUpData) {
    let account = {
        email: signUpData.semail.value,
        password: signUpData.spsw.value,
        firstname: signUpData.fname.value,
        familyname: signUpData.lname.value,
        gender: signUpData.gender.value,
        city: signUpData.city.value,
        country: signUpData.country.value
    };
    return serverstub.signUp(account);
}

// Check if password is too short.
function passwordLenght(passwordString) {
    if (passwordString.length < 5) {
        return false;
    }
    else {
        return true;
    }
}


function loadProfileView(userToken) {
    // Set to home page
    LOGGED_IN_STATE = 1;

    // Clear html of body
    document.body.innerHTML = "";

    // Load logged in view to home
    let profileView = document.getElementById("profileView");
    let profileDiv = document.createElement("div");

    profileDiv.setAttribute("id", "profileDiv");
    profileDiv.innerHTML = profileView.innerHTML;
    document.body.appendChild(profileDiv);

    // Set up user info from server.
    let userData = serverstub.getUserDataByToken(userToken).data;
    document.getElementById("userfname").innerHTML = userData.firstname;
    document.getElementById("userlname").innerHTML = userData.familyname;
    document.getElementById("usergender").innerHTML = userData.gender;
    document.getElementById("usercity").innerHTML = userData.city;
    document.getElementById("usercountry").innerHTML = userData.country;
    document.getElementById("useremail").innerHTML = userData.email;
    document.getElementById("home").style.backgroundColor = "grey";
    loadUserWall();

    // On click event for posting to your own wall.
    document.getElementById("userPostbtn").addEventListener("click", function () {
        let msg = document.getElementById("postError");
        let message = document.getElementById("userPostinput");
        if (message.value) {
            let response = serverstub.postMessage(userToken, message.value, userData.email);
            if (response.success) {
                message.value = "";
                loadUserWall();
                return false;
            }
            else {
                msg.innerHTML = response.message;
            }
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
        let response = serverstub.changePassword(userToken, opsw.value, npsw.value);
        msg.innerHTML = response.message;
        if (response.success) {
            msg.style.color = "green";
            return false;
        }
        return false;
    };

    // On click event to post to an other users wall.
    document.getElementById("profilePostbtn").addEventListener("click", function () {
        let msg = document.getElementById("searchError");
        let message = document.getElementById("profilePostInput");
        let otherUserEmail = document.getElementById("profileemail").innerHTML;
        if (!otherUserEmail) {
            msg.innerHTML = "No wall to post on"
            return false;
        }
        if (message.value) {
            let response = serverstub.postMessage(userToken, message.value, otherUserEmail);
            if (response.success) {
                message.value = "";
                loadBrowseWall(otherUserEmail);
            }
            else {
                msg.innerHTML = response.message;
            }
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
        let signOut = serverstub.signOut(userToken);
        if (signOut.success) {
            localStorage.setItem("signinToken", null);
            loadWelcomeView();
        }
    });
};


// Get the messages of your wall from the server.
function loadUserWall() {
    let msg = document.getElementById("postError");
    let userToken = localStorage.getItem("signinToken");
    let messages = serverstub.getUserMessagesByToken(userToken);
    let wall = document.getElementById("userWallMessages");

    if (messages.data.length > 0) {
        msg.innerHTML = "";
        while (wall.firstChild) {
            wall.removeChild(wall.firstChild);
        }
        messages.data.forEach(element => {
            let message = document.createElement("li");
            let writer = document.createElement("p");
            writer.innerHTML = "Posted by " + element.writer + ":";
            message.appendChild(writer);

            message.appendChild(document.createElement("br"));


            let content = document.createElement("p");
            content.innerHTML = element.content;
            message.appendChild(content);
            wall.appendChild(message);
        });
    }
};


// Get the messages of the found user in the browse tab.
function loadBrowseWall(email) {
    let userToken = localStorage.getItem("signinToken");
    let msg = document.getElementById("searchError");
    let wall = document.getElementById("profileWallMessages");
    let messages = serverstub.getUserMessagesByEmail(userToken, email);
    let profileInfoRequest = serverstub.getUserDataByEmail(userToken, email);
    let profileData = profileInfoRequest.data;

    if (messages.success && profileInfoRequest.success) {
        while (wall.firstChild) {
            wall.removeChild(wall.firstChild);
        }

        document.getElementById("profilefname").innerHTML = profileData.firstname;
        document.getElementById("profilename").innerHTML = profileData.familyname;
        document.getElementById("profilegender").innerHTML = profileData.gender;
        document.getElementById("profilecity").innerHTML = profileData.city;
        document.getElementById("profilecountry").innerHTML = profileData.country;
        document.getElementById("profileemail").innerHTML = profileData.email;

        if (messages.data.length > 0) {

            msg.innerHTML = ""

            messages.data.forEach(element => {
                let message = document.createElement("li");
                let writer = document.createElement("p");
                writer.innerHTML = "Posted by " + element.writer + ": ";
                message.appendChild(writer);

                message.appendChild(document.createElement("br"));

                let content = document.createElement("p");
                content.innerHTML = element.content;
                message.appendChild(content);
                wall.appendChild(message);
            });

        }
    }
    else {
        msg.innerHTML = messages.message;
    }
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
