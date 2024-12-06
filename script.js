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
    
    const buttonElement = document.getElementById("button");
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

function renderIp(ip) {
    if(ip) {
        document.getElementById("user-ip").textContent = `🪪 your address is ${ip}`;
    }
}

async function getCookie(key) {
    if(cookieStore) {
        return await cookieStore.get(key);
    }
}
async function setCookie(key, value) {
    if (cookieStore) {
        await cookieStore.set(key, value);
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

async function displayUserInformation() {
    let ip;

    const ipCookie = await getCookie(COOKIE_KEY_NAME_IP);
    ip = ipCookie?.value;

    const ipInformationJson = await getIpInformation();
    if (ipInformationJson) {
        console.log(ipInformationJson);
        const ipIsDifferent = ipInformationJson.ip != ip;
        if (ipIsDifferent) {
            ip = ipInformationJson.ip;
            console.log('New or updated ip');
            setCookie(COOKIE_KEY_NAME_IP, ip);
        }
    }

    renderIp(ip);
}

document.addEventListener("DOMContentLoaded", async function () {
    await displayUserInformation();
    console.log('almartin.ch run');
})