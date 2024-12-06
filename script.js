const COOKIE_KEY_NAME_IP = 'almartinch-user-ip';

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
    const url = "https://ipinfo.io/json";
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