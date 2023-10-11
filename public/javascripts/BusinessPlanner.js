const currentDate = new Date().toISOString().split('T')[0];
document.getElementById('startDate').setAttribute("min", currentDate);
document.getElementById('endDate').setAttribute("min", currentDate);

function addtask() {
    const element = document.createElement("fieldset");
    element.setAttribute("class", "report");
    element.setAttribute("method", "post");
    element.setAttribute("action", "/businessplanner/submittingtasks...");
    const lbl1 = document.createElement("h3");
    const lbl1txt = document.getElementById("projtit").innerHTML;
    lbl1.innerHTML = lbl1txt;
    const lbl2 = document.createElement("label");
    lbl2.setAttribute("for", "activity");
    const lbl3 = document.createElement("label");
    lbl3.setAttribute("for", "milestone");
    const lbl4 = document.createElement("label");
    lbl4.setAttribute("for", "comment");
    const lbl5 = document.createElement("label");
    lbl5.setAttribute("for", "status");
    const lbl2txt = document.createTextNode("ACTIVITY");
    lbl2.appendChild(lbl2txt);
    const lbl3txt = document.createTextNode("MILESTONE");
    lbl3.appendChild(lbl3txt);
    const lbl4txt = document.createTextNode("REMARKS");
    lbl4.appendChild(lbl4txt);
    const lbl5txt = document.createTextNode("MILESTONE STATUS");
    lbl5.appendChild(lbl5txt);
    const h1 = document.createElement("h1");
    const h1txt = document.createTextNode("ADD TASK");
    h1.appendChild(h1txt);
    element.appendChild(h1);
    const label0 = document.createElement("label");
    const lbltxt = document.createTextNode("SUBMISSION WEEK ");
    label0.appendChild(lbltxt);
    element.appendChild(label0);
    const dt0 = document.createElement("input");
    dt0.setAttribute("type", "date");
    dt0.setAttribute("name", "date");
    dt0.setAttribute("id", "date");
    element.appendChild(dt0);
    const dt1 = document.createElement("input");
    dt1.setAttribute("type", "date");
    dt1.setAttribute("name", "date0");
    dt1.setAttribute("id", "date0");
    element.appendChild(dt1);
    const br0 = document.createElement("br");
    const br00 = document.createElement("br");
    element.appendChild(br0);
    element.appendChild(br00);
    element.appendChild(lbl1);
    const txtarea = document.createElement("textarea");
    txtarea.setAttribute("name", "activity");
    txtarea.setAttribute("rows", "6");
    txtarea.setAttribute("placeholder", "Enter activity here");
    txtarea.setAttribute("required", "");
    const txtarea2 = document.createElement("textarea");
    txtarea2.setAttribute("name", "comment");
    txtarea2.setAttribute("rows", "4");
    txtarea2.setAttribute("placeholder", "Enter remarks here");
    txtarea2.setAttribute("required", "");
    const select1 = document.createElement("select");
    select1.setAttribute("name", "milestone");
    select1.setAttribute("style", "width: 55%");
    select1.setAttribute("required", "");
    const select11 = document.getElementById("milestonetit").innerHTML;
    select1.innerHTML = select11;
    const select2 = document.createElement("select");
    select2.setAttribute("name", "status");
    select2.setAttribute("required", "");
        const opt21 = document.createElement("option");
            opt21.setAttribute("value", "ongoing");
            const opt21node = document.createTextNode("Ongoing");
            opt21.appendChild(opt21node);
        const opt22 = document.createElement("option");
            opt22.setAttribute("value", "completed");
            const opt22node = document.createTextNode("Completed");
            opt22.appendChild(opt22node);
        select2.appendChild(opt21);
        select2.appendChild(opt22);
    element.appendChild(lbl3);
    const br30 = document.createElement("br");
    element.appendChild(br30);
    element.appendChild(select1);
    const br31 = document.createElement("br");
    element.appendChild(br31);
    const br32 = document.createElement("br");
    element.appendChild(br32);
    element.appendChild(lbl2);
    const br4 = document.createElement("br");
    element.appendChild(br4);
    element.appendChild(txtarea);
    const p0 = document.createElement("p");
    const p0txt = document.createTextNode("Invalid input");
    p0.setAttribute("style", "color: red; font-size: 0.9vw; display: none; margin: -0.2vw 0 -2.25vw");
    p0.appendChild(p0txt);
    element.appendChild(p0);
    const br5 = document.createElement("br");
    element.appendChild(br5);
    const br6 = document.createElement("br");
    element.appendChild(br6);
    element.appendChild(lbl5);
    element.appendChild(select2);
    const br11 = document.createElement("br");
    element.appendChild(br11);
    const br33 = document.createElement("br");
    element.appendChild(br33);
    element.appendChild(lbl4);
    const br9 = document.createElement("br");
    element.appendChild(br9);
    element.appendChild(txtarea2);
    const p = document.createElement("p");
    const ptxt = document.createTextNode("Invalid input");
    p.setAttribute("style", "color: red; font-size: 0.9vw; display: none; margin: -0.2vw 0 -2.25vw");
    p.appendChild(ptxt);
    element.appendChild(p);
    const br10 = document.createElement("br");
    element.appendChild(br10);
    const btn = document.createElement("button");
    btn.setAttribute("type", "submit");
    btn.setAttribute("class", "reportsubmit");
    const btnNode = document.createTextNode("SUBMIT");
    btn.appendChild(btnNode);
    element.appendChild(btn);
    document.getElementById("form").appendChild(element);
    validate();
}
function running() {
    const d = new Date();
    let today = Date.now();
    let day = d.getDay();
    let mon = today - ((day - 1) * 86400000);
    let fri = mon + (4 * 86400000);
    const mond = new Date(mon);
    const frid = new Date(fri);
    let monday = mond.getDate();
    if(monday<10) monday = "0" + monday;
    let mondm = mond.getMonth();
    if(mondm<10) mondm = "0" + mondm;
    let mondy = mond.getFullYear();
    let friday = frid.getDate();
    if(friday<10) friday = "0" + friday;
    let fridm = frid.getMonth();
    if(fridm<10) fridm = "0" + fridm;
    let fridy = frid.getFullYear(),
    remtask = document.getElementById("remtask"),
    submitbtn = document.getElementById("submitbtn"),
    submitallbtn = document.getElementById("submitallbtn");

    if(document.querySelectorAll("fieldset").length == 1) {
        remtask && (remtask.style.display = "none");
        submitbtn && (submitbtn.style.display = "inline-block");
        submitallbtn && (submitallbtn.style.display = "none");
    }
    else {
        remtask && (remtask.style.display = "inline-block");
        submitbtn && (submitbtn.style.display = "none");
        submitallbtn && (submitallbtn.style.display = "inline-block");
    }
}
setInterval(running, 1);
function retrieve() {
    const tasksR = document.getElementsByTagName("fieldset");
    if(typeof(Storage) !== "undefined") {
        document.body.innerHTML = localStorage.getItem("body");
        const title = JSON.parse(localStorage.getItem("titles"));
        const milestone = JSON.parse(localStorage.getItem("milestoner"));
        const activity = JSON.parse(localStorage.getItem("activities"));
        const remark = JSON.parse(localStorage.getItem("remarks"));
        const status = JSON.parse(localStorage.getItem("stat"));
        for(var i=0; i<tasksR.length; i++) {
            tasksR[i].children[6].innerText = title[i];
            tasksR[i].children[9].value = milestone[i];
            tasksR[i].children[14].value = activity[i];
            tasksR[i].children[24].value = remark[i];
            tasksR[i].children[19].value = status[i];
        }
    }
    donTSave();
    validate();
}
function save() {
    const tasks = document.getElementsByTagName("fieldset");
    if(typeof(Storage) !== "undefined") {
        const title = [];
        const milestone = [];
        const activity = [];
        const remark = [];
        const status = [];
        for(var i=0; i<tasks.length; i++) {
            title[i] = tasks[i].children[6].innerText;
            milestone[i] = tasks[i].children[9].value;
            activity[i] = tasks[i].children[14].value;
            remark[i] = tasks[i].children[24].value;
            status[i] = tasks[i].children[19].value;
        }
        localStorage.setItem("titles", JSON.stringify(title));
        localStorage.setItem("milestoner", JSON.stringify(milestone));
        localStorage.setItem("activities", JSON.stringify(activity));
        localStorage.setItem("remarks", JSON.stringify(remark));
        localStorage.setItem("stat", JSON.stringify(status));
        localStorage.setItem("body", document.body.innerHTML);
    }
    donTSave();
}
function removetask() {
    document.getElementById("form").lastElementChild.remove();
}
function exportintoDocx() {
    var header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+"xmls:w='urn:schemas-microsoft-com:office:word' "+"xmlns='http://www.w3.org/TR/REC-html40'>"+"<head><meta charset='utf-8'><title>Export HTML to Word Document with Javascript</title></head><body>";
    var footer = "</body></html>";
    var sourceHTML = header + document.getElementById("ppreport").contentWindow.document.body.innerHTML + footer;
    var source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    var fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'IT SOLUTION AND INNOVATION WEEKLY REPORTING TRACKER.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
}
function showprojbars() {
    document.getElementById("projbar").setAttribute("class", "projbar");
    document.getElementById("navproj").style.display = "block";
    document.getElementById("projbar").setAttribute("onclick", "hideprojbars()");
}
function hideprojbars() {
    document.getElementById("projbar").setAttribute("class", "navbara");
    document.getElementById("navproj").style.display = "none";
    document.getElementById("projbar").setAttribute("onclick", "showprojbars()");
}
function submitAll() {
    const submitbtns = document.getElementsByTagName("form");
    for(var i=0; i<submitbtns.length; i++) {
        setTimeout(submitbtns[i].lastElementChild.click(), 10);
    }
}
function addproject() {
    const element = document.createElement("fieldset");
    element.setAttribute("class", "report");
    element.setAttribute("method", "post");
    element.setAttribute("action", "/businessplanner/addingnewproject...");
    const h1 = document.createElement("h1");
    const h1txt = document.createTextNode("ADD NEW PROJECT");
    h1.appendChild(h1txt);
    element.appendChild(h1);
    const lbl1 = document.createElement("label");
    lbl1.setAttribute("for", "title");
    const lbl1txt = document.createTextNode("PROJECT TITLE");
    lbl1.appendChild(lbl1txt);
    element.appendChild(lbl1);
    const br1 = document.createElement("br");
    element.appendChild(br1);
    const txtbox1 = document.createElement("input");
    txtbox1.setAttribute("type", "text");
    txtbox1.setAttribute("name", "title");
    txtbox1.setAttribute("required", "");
    element.appendChild(txtbox1);
    const br2 = document.createElement("br");
    element.appendChild(br2);
    const br3 = document.createElement("br");
    element.appendChild(br3);
    const lbl2 = document.createElement("label");
    const lbl2txt = document.createTextNode("PROJECT DESCRIPTION");
    lbl2.appendChild(lbl2txt);
    element.appendChild(lbl2);
    const br4 = document.createElement("br");
    element.appendChild(br4);
    const txtbox2 = document.createElement("textarea");
    txtbox2.setAttribute("name", "desc");
    txtbox2.setAttribute("rows", "4");
    txtbox2.setAttribute("placeholder", "Enter description here");
    txtbox2.setAttribute("required", "");
    element.appendChild(txtbox2);
    const p = document.createElement("p");
    const ptxt = document.createTextNode("Invalid input");
    p.setAttribute("style", "color: red; font-size: 0.9vw; display: none; margin: -0.2vw 0 -2.25vw");
    p.appendChild(ptxt);
    element.appendChild(p);
    const br5 = document.createElement("br");
    element.appendChild(br5);
    const br6 = document.createElement("br");
    element.appendChild(br6);
    const br7 = document.createElement("br");
    element.appendChild(br7);
    const br8 = document.createElement("br");
    element.appendChild(br8);
    const br9 = document.createElement("br");
    element.appendChild(br9);
    const button = document.createElement("button");
    button.setAttribute("type", "submit");
    button.setAttribute("class", "reportsubmit");
    const buttontxt = document.createTextNode("SAVE PROJECT");
    button.appendChild(buttontxt);
    element.appendChild(button);
    document.getElementById("formproject").appendChild(element);
    validate();
}
function removeprojform() {
    document.getElementById("formproject").lastChild.remove();
}
function addmilestone() {
    document.getElementById("popup").style.display = "block";
    document.getElementById("bdproj").style.pointerEvents = "none";
}
function remove(id) {
    id.parentNode.remove();
}
function addnewmilestone() {
    const fieldset = document.createElement("fieldset");
    fieldset.setAttribute("class", "report");
    const h1 = document.createElement("h1");
    const h1txt = document.createTextNode("ADD ANOTHER MILESTONE");
    h1.appendChild(h1txt);
    fieldset.appendChild(h1);
    const select1 = document.createElement("h3");
    const select11 = document.getElementById("projselect").innerHTML;
    select1.innerHTML += select11;
    fieldset.appendChild(select1);
    const br3 = document.createElement("br");
    fieldset.appendChild(br3);
    const lbl2 = document.createElement("label");
    const lbl2txt = document.createTextNode("MILESTONE TITLE");
    lbl2.appendChild(lbl2txt);
    lbl2.setAttribute("for", "input");
    fieldset.appendChild(lbl2);
    const br4 = document.createElement("br");
    fieldset.appendChild(br4);
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("name", "title");
    input.setAttribute("required", "");
    fieldset.appendChild(input);
    const br5 = document.createElement("br");
    fieldset.appendChild(br5);
    const br6 = document.createElement("br");
    fieldset.appendChild(br6);
    const lbl3 = document.createElement("label");
    const lbl3txt = document.createTextNode("MILESTONE DESCRIPTION");
    lbl3.appendChild(lbl3txt);
    lbl3.setAttribute("for", "desc");
    fieldset.appendChild(lbl3);
    const br7 = document.createElement("br");
    fieldset.appendChild(br7);
    const textarea = document.createElement("textarea");
    textarea.setAttribute("name", "desc");
    textarea.setAttribute("rows", "4");
    textarea.setAttribute("placeholder", "Enter description here");
    textarea.setAttribute("required", "");
    fieldset.appendChild(textarea);
    const p = document.createElement("p");
    const ptxt = document.createTextNode("Invalid input");
    p.setAttribute("style", "color: red; font-size: 0.9vw; display: none; margin: -0.2vw 0 -2.25vw");
    p.appendChild(ptxt);
    fieldset.appendChild(p);
    const br8 = document.createElement("br");
    fieldset.appendChild(br8);
    const br9 = document.createElement("br");
    fieldset.appendChild(br9);
    const lbl4 = document.createElement("label");
    const lbl4txt = document.createTextNode("PRIORITY ");
    lbl4.appendChild(lbl4txt);
    lbl4.setAttribute("for", "priority");
    fieldset.appendChild(lbl4);
    const select2 = document.createElement("select");
    select2.setAttribute("name", "priority");
    select2.setAttribute("required", "");
        const option1 = document.createElement("option");
            option1.setAttribute("value", "High");
            const option1txt = document.createTextNode("High");
            option1.appendChild(option1txt);
            select2.appendChild(option1);
        const option2 = document.createElement("option");
            option2.setAttribute("value", "Medium");
            const option2txt = document.createTextNode("Medium");
            option2.appendChild(option2txt);
            select2.appendChild(option2);
        const option3 = document.createElement("option");
            option3.setAttribute("value", "Low");
            const option3txt = document.createTextNode("Low");
            option3.appendChild(option3txt);
            select2.appendChild(option3);
    fieldset.appendChild(select2);
    const lbl5 = document.createElement("label");
    const lbl5txt = document.createTextNode("DATE TO BE COMPLETED ");
    lbl5.appendChild(lbl5txt);
    lbl5.setAttribute("for", "date");
    fieldset.appendChild(lbl5);
    const input2 = document.createElement("input");
    input2.setAttribute("type", "date");
    input2.setAttribute("name", "date");
    input2.setAttribute("required", "");
    fieldset.appendChild(input2);
    const br10 = document.createElement("br");
    fieldset.appendChild(br10);
    const br11 = document.createElement("br");
    fieldset.appendChild(br11);
    document.getElementById("milestone").appendChild(fieldset);
    validate();
}
function remMilestoneForm() {
    document.getElementById("milestone").lastChild.remove();
}
function openTab() {
    var iframe = document.getElementById("ppreport");
    var contentWindow = iframe.contentWindow;
    contentWindow.focus();
    contentWindow.print();
}
function donTSave() {
    document.getElementById("popup").style.display = "none";
    document.getElementById("bdproj").style.pointerEvents = "auto";
}
function saveproj() {
    document.getElementsByTagName("form")[0].setAttribute("action", "/businessplanner/submittingnewprojects...");
    document.getElementById("submitbtn").click();
    document.getElementById("submitallbtn").click();
}
function delmilestone() {
    const milestone = document.getElementById("milestone-title").value;
    document.getElementById("milestone-box").setAttribute('value', milestone);
    document.getElementById("popup-milestone").style.display = "block";
}
function toggleDropdownBar() {
    document.getElementById("dropdownContent").classList.toggle("show");
}
function toggleSignOutDropdown(field) {
    document.getElementById(field).classList.toggle("show");
}
function logout() {
    document.getElementById("logoutBox").style.display = "block";
    document.getElementsByClassName("navbar")[0].style.pointerEvents = "none";
    document.getElementsByClassName("header")[0].style.pointerEvents = "none";
    document.getElementsByClassName("bodyhead")[0].style.pointerEvents = "none";
    document.getElementsByClassName("body")[0].style.pointerEvents = "none";
    toggleSignOutDropdown("signOutDropdown");
}
function showError() {
    document.getElementById("error").style.display = "block";
    document.getElementsByClassName("navbar")[0].style.pointerEvents = "none";
    document.getElementsByClassName("header")[0].style.pointerEvents = "none";
    document.getElementsByClassName("bodyhead")[0].style.pointerEvents = "none";
    document.getElementsByClassName("body")[0].style.pointerEvents = "none";
    toggleSignOutDropdown("signOutDropdown");
}
function closeError() {
    document.getElementById("error").style.display = "none";
    document.getElementsByClassName("navbar")[0].style.pointerEvents = "auto";
    document.getElementsByClassName("header")[0].style.pointerEvents = "auto";
    document.getElementsByClassName("bodyhead")[0].style.pointerEvents = "auto";
    document.getElementsByClassName("body")[0].style.pointerEvents = "auto";
    toggleSignOutDropdown("signOutDropdown");
}
function logoutCancel() {
    document.getElementById("logoutBox").style.display = "none";
    document.getElementsByClassName("bodyhead")[0].style.pointerEvents = "auto";
    document.getElementsByClassName("body")[0].style.pointerEvents = "auto";
    document.getElementsByClassName("navbar")[0].style.pointerEvents = "auto";
    document.getElementsByClassName("header")[0].style.pointerEvents = "auto";
}

function validate() {
const validateRE = (stringVal) =>{
    const whiteList = /^[a-zA-Z0-9().'",\s-]*$/;
    return whiteList.test(stringVal);
}

setTimeout(() => {
       const validate2 = (e) => {
        if(e.target.value) {
            return e.target.value
        } else {
            return null
        }
       }

       let  textareas = document.getElementsByTagName('textarea'),
            txtareas = Array.from(textareas),
            holdText = [], textval = [];
            
        for (var i=0; i<textareas.length; i++) {
            let textarea = textareas[i];
            textarea.addEventListener('input', (event) =>
       {
        
        let i = txtareas.indexOf(event.target);
        textval[i] = event.target.value;

        if(validateRE(textval[i])) {
            holdText[i] = textarea.value,
            textarea.value = textval[i]

            for(let j = 0; j<textareas.length; j++) {
                if(i == j) {
            textarea.nextElementSibling.style.display = "none";

                }
            }
        } else {
            textarea.value = ''
        textarea.value = holdText[i] ?? ''
        textarea.nextElementSibling.style.display = "block"
        }


        /*validateRE(textval[i]) ? 
        (
            holdText[i] = textarea.value,
            textarea.value = textval[i],
            textarea.parentElement.children[9].style.display = "none"
         ) : 
        (
        textarea.value = '',
        textarea.value = holdText[i] ?? '',
        //textarea.nextElementSibling.innerHTML = `${textval} is not allowed`,
        textarea.parentElement.children[9].style.display = "block");*/
       });
        }

       
}, 100);
}

validate();

/*const validator = (e) => {
    
    const validateRE = (stringVal) =>{
        const whiteList = /^[a-zA-Z0-9().'",\s-]*$/;
        return whiteList.test(stringVal);
    }
    if(validateRE(e.target.value)) {
        return e.target.value;
    } else return null;
}
const value = document.querySelector(".text-area");
    value.onChange = function () {
        console.log(this.value);
        console.log("mnnmbmn")
    }
const handleValChange = (e) => {
    
    console.log(e.target.value);
    const isValid = validator(e);
    if(isValid) {
        setValue(isValue);
        document.nextElementSibling.style.display = "none";
    } else document.nextElementSibling.style.display = "block";
}*/



      // submitallbtn?.addEventListener('click',validate);


//document.getElementById("submitbtn").addEventListener("click", function(event) {validate(event);});
//document.getElementById("submitallbtn").addEventListener("click", function(event) {validate(event);});