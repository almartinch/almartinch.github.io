const COOKIE_KEY_NAME_IP = 'almartinch-user-ip';
const VERSES = [
    "SUFFERING IS OPT",
    "LIFE IS SUFFERING",
    "YOU SUFFER BUT WHY?",
    "NO MORE NOISE"
];

function randomizeVerse() {
    let verse = VERSES[2].replace(/\s+/g,'');
    const tableElement = document.getElementById("table");
    let newTBody = document.createElement("tbody");
    generateTable(newTBody, verse);
    tableElement.replaceChild(newTBody, tableElement.tBodies[0]);
    
    const buttonElement = document.getElementById("button-verses");
    buttonElement.disabled = true;
    buttonElement.innerHTML = "under construction";

}

function generateTable(tBody, verse) {
    let verseIndex = 0;
    for (let i = 0; i < 4; i++) {
        let row = tBody.insertRow();
        for (let j = 0; j < 4; j++) {
            let cell = row.insertCell();
            let text = document.createTextNode(verse.charAt(verseIndex));
            cell.appendChild(text);
            verseIndex++;
        }
    }
}

function renderGreetingText(ip, returningUser = false) {
    const element = document.querySelector(".user-greeting-text");
    const content = `🪪 welcome${returningUser? " back" : ""}! your public IP address${returningUser? " stored in our books " : " "}is: ${ip}`;
    element.classList.remove("fade");
    setTimeout(() => {
        requestAnimationFrame(() => {
            element.innerHTML = content;
            element.classList.add("fade");
        });
    }, 225);
}

async function refreshGreetingText() {
    await displayUserInformation(true);
}

async function getCookie(key) {
    if(cookieStore) {
        return await cookieStore.get(key);
    }
}
async function setCookie(key, value) {
    if (cookieStore) {
        await cookieStore.set({
            name: key,
            value: value,
            expires: new Date(new Date().getTime() + 24*60*60000) // One day in ms
          });
    }
}
async function deleteCookie(key) {
    if (cookieStore) {
        await cookieStore.delete(key);
    }
}

async function getIpInformation() {
    const url = "https://ipinfo.io/json?token=9dd4022236c442"; // 50k per month free
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        
        return json;
    } catch (error) {
        console.log(error.message);
    }
}

async function displayUserInformation(reset = false) {
    if (reset) {
        await deleteCookie(COOKIE_KEY_NAME_IP);
    }

    const ipCookie = await getCookie(COOKIE_KEY_NAME_IP);
    if (!ipCookie) {
        const ipInformationJson = await getIpInformation();
        if (ipInformationJson) {
            console.log("User information retrieved 🕵");
            console.log(ipInformationJson);
            renderGreetingText(ipInformationJson.ip);
            console.log("Saving cookie 🍪")
            setCookie(COOKIE_KEY_NAME_IP, ipInformationJson.ip);
        }
        
    } else {
        if(ipCookie.value) {
            console.log("Cookie retrieved 🍪")
            renderGreetingText(ipCookie.value, true);
        }
    }
    const buttonElement = document.getElementById("button-refresh");
    buttonElement.disabled = false;
}

document.addEventListener("DOMContentLoaded", async () => {
    await displayUserInformation();
    console.log('almartin.ch run ✅');
})