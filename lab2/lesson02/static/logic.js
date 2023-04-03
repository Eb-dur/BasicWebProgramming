
function storeContact(formData){
    let name = formData.name.value;
    let number = formData.number.value;

    let contact = {
        name : name,
        number : number
    };
    let messageDiv = document.getElementById("message");
    let req = new XMLHttpRequest();
    req.open("POST", "/contact/create", true);
    req.setRequestHeader("Content-type", "application/json;charset=UTF-8")
    req.setRequestHeader("Authorization", "12332432iuh32kj4gh3h2jkg")

    req.send(JSON.stringify(contact));
    req.onreadystatechange =  function(){
        if (req.readyState == 4){
            if (req.status == 201){
                messageDiv.innerHTML = "User Created!";

            }else if (req.status == 409){
                messageDiv.innerHTML = "User already exists!";

            }else if (req.status == 400){
                messageDiv.innerHTML = "Wrong data format!";

            }

        }

    }

    /*let readContacts = localStorage.getItem("contacts");
    let contacts = null;
    if (readContacts == null){
        contacts = new Array();
    }else{
        contacts = JSON.parse(localStorage.getItem("contacts"));
    }
    let contact = {
        cname : name,
        cnumber : number
    };

    contacts.push(contact);
    let contactsString = JSON.stringify(contacts);
    localStorage.setItem("contacts", contactsString);*/
    
}

function searchContact(formData){
    let name = formData.name.value;

    let messageDiv = document.getElementById("usermessages");
    let req = new XMLHttpRequest();
    req.open("GET", "/contact/find/" + name, true);
    req.send(null);
    req.onreadystatechange =  function(){
        if (req.readyState == 4){
            if (req.status == 200){
                let resp = JSON.parse(req.responseText);
                for (c in resp){
                    console.log(c);
                    messageDiv.innerHTML += resp[c].name + ", " + resp[c].number + " ";

                }

            }else if (req.status == 400){
                messageDiv.innerHTML = "Wrong data format!";

            }

        }

    }

    /*let readContacts = localStorage.getItem("contacts");
    if (readContacts != null){
        let contacts = JSON.parse(readContacts);
        contacts.forEach(function(contact){
            if (contact.cname == formData.name.value)
                document.getElementById("searchlist").innerHTML += "<li>" + contact.cname + " " + contact.cnumber + "</li>"
        });
    }else{
        document.getElementById("usermessages").innerText = "No contacts available!";
    }*/
}

