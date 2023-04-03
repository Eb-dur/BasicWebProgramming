function storeContact(formData){
    let name = formData.name.value;
    let number = formData.number.value;
    let readcontacts = localStorage.getItem("contacts");
    let contacts = null;
    if (readcontacts == null){
        let contacts = new Array();
    }
    else{
        let contacts = JSON.parse(localStorage.getItem("contacts"));
    }
    

    let contact = {
        cname : name,
        cnumber : number
    };

    contacts.push(contact);

    let contactsString = JSON.stringify(contacts);
    console.log(contact);
    console.log(contactsString);
    localStorage.setItem("contact",contactsString);
}


function searchContact(formData){
    let name = formData.name.value;
    let readcontacts = localStorage.getItem("contacts");
    if (readcontacts != null){
        let contacts = JSON.parse(readcontacts);
        contacts.array.forEach(element,function(contact){
        document.getElementById("searchlist").innerHTML += "<li>" + contact   
        });
    }
    else{
        document.getElementById("usermessages").innerText = "No contacts avaliable";

    }

}