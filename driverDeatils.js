const now = new Date();
const today = now.getFullYear() + '-' +
              String(now.getMonth() + 1).padStart(2, '0') + '-' +
              String(now.getDate()).padStart(2, '0');

console.log(today);

const driverName = document.getElementById("name");
const pScanner = document.getElementById("scanner");
const pPrinter = document.getElementById("printer");
const pSpare = document.getElementById("sparebattery");
const pCount = document.getElementById("count");
const outbriefLink = document.getElementById("outbriefLink");
const locationLink = document.getElementById("locationLink");

window.addEventListener("DOMContentLoaded", () => {
    const rNumber = document.getElementById("route").value;
    const loca = document.getElementById("location").value.toUpperCase();

    const savedRoute = localStorage.getItem("savedRoute");
    const savedLocation = localStorage.getItem("savedLocation");

    if (savedRoute && savedLocation) {
        document.getElementById("route").value = savedRoute;
        document.getElementById("location").value = savedLocation;

        showDriverInfo(); // auto-run
    }
});



const warningMessageToShow = () => {
    const loca = document.getElementById("location").value.toUpperCase();
    const warningh1 = document.getElementById("warning-h1").innerHTML = "⚠️ Important Message";
    const warningMessage = document.getElementById("warning-message");

    let msg = "Please see below if all the information is correct. If any incorrect information, please contact outbrief.";

    if (loca === "BBSA") {
        warningMessage.innerHTML = msg;
    } else {
        warningMessage.innerHTML = "Please see below if all the information is incorrect. If any incorrect information, please contact outbrief.";
    }

    

}


warningMessageToShow()

let getRouteForOutbrief = '';
let loc = '';

async function findDriver(routeNumber, loca) {
    const response = await fetch("https://drivercontrolsheet.onrender.com/get-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            date: today,
            loc: loca,
            route: routeNumber
        })
    });

    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    return data;
}

async function showDriverInfo() {
    const rNumber = document.getElementById("route").value;
    const loca = document.getElementById("location").value.toUpperCase();

    warningMessageToShow();
    //reassign warning value.

    localStorage.setItem("savedRoute", rNumber);
    localStorage.setItem("savedLocation", loca);

    if (!loca || !rNumber) {
        alert("Please enter both a location and a route number.");
        return;
    }

    const result = await findDriver(rNumber, loca);
    console.log("Result:", result);

    if (!result || result.error) {
        driverName.innerHTML = "No record found. Please contact dispatch.";
        pScanner.innerHTML = "";
        pPrinter.innerHTML = "";
        pSpare.innerHTML = "";
        pCount.innerHTML = "";
        document.getElementById("greeting").innerHTML = "";
        document.getElementById("message").innerHTML = "";
        return;
    }

    let countHand = '';

    if (result.count === '1') {
        countHand = '☝️';
    } else if (result.count === '2') {
        countHand = '✌️';
    } else if (result.count === '3') {
        countHand = '٣';
    } else if (result.count === '4') {
        countHand = '٤';
    } else if (result.count === '5') {
        countHand = '🖐';
    } else if (result.count === '0'){
        countHand = '0️⃣';
    } else {
        countHand = '5️⃣➕';
    }

    if (result.requestedclear === 'Yes') {
        document.getElementById("req2clear").disabled = true;
        document.getElementById("message-to-r2c").innerHTML = "Request to Clear has already been sent. Please wait for debrief to confirm.";
        document.getElementById("message-to-r2c").style.color = "green";
    } else {
        document.getElementById("req2clear").disabled = false;
        document.getElementById("message-to-r2c").innerHTML = "";
    }

    const greeting = document.getElementById("greeting");
    const greetMessage = document.getElementById("message");

    greeting.innerHTML = `Hey, ${result.name}!`;
    const messages = () => {
        const currentHour = new Date().getHours();
        let greetTime = '';
        if (currentHour < 12) {
            greetTime = "Good morning! ☀️";
        } else if (currentHour < 18) {
            greetTime = "Good afternoon! 🌤️";
        } else {
            greetTime = "Good evening! 🌙";
        }

        const randomMessage = [
            "Hope you're having a great day! 😎",
            "Keep up the good work! 💪",
            "You're doing awesome! 🌟",
            "Stay positive and keep going! 🌈",
            "Remember to take breaks and stay hydrated! 💧",
            "You're a rockstar! 🤘",
            "Keep pushing forward! 🚀",
            "Believe in yourself! 🌟",
            "You're making a difference! 🌍",
            "Stay focused and keep grinding! 🔥",
            "Hope you're well", 
            "Ready for today",
            "Let's make it a productive day",
            "Wishing you a smooth shift",
            "Keep up the great work",
            "Stay safe out there",
            "Hope you have a good day",
            "Let's get this done",
            "Wishing you a successful day",
            "Keep pushing forward",
            "Stay positive and motivated",
            "Hope everything goes well today",
            "Let's make it a great day",
            "Wishing you a productive shift",
            "Keep up the momentum",
            "Stay focused and determined",
            "Hope you have a smooth day",
            "Let's tackle today's challenges",
            "Wishing you a successful shift",
            "Keep up the good work and stay motivated",
            "Stay positive and keep pushing forward",
            "Hope you have a great day ahead",
            "Let's make today a productive one",
            "Wishing you a smooth and successful day",
            "Keep up the great work and stay focused",
            "Stay motivated and keep striving for success",
            "Hope you have a fantastic day at work",
            "Let's make it a productive and successful day",
            "Stay safe out there",
            "Lets make it a good one",
            "Thanks for your hard work",
            "Appreciate your effort",
            "Hope your route goes smoothly",
            "Have a safe run",
            "Lets smash it today",
            "Good to see you",
            "Hope your day starts well",
            "All the best today",
            "Lets keep moving",
            "Stay sharp",
            "Hope traffic treats you well",
            "Lets deliver excellence",
            "Thanks for being on time",
            "Hope your scanner behaves today",
            "Have a strong shift",
            "Hope weather stays good",
            "Lets get it done",
            "Stay focused",
            "Hope your route is light",
            "Hope your van runs smooth",
            "Lets make it efficient",
            "Stay positive",
            "Hope your deliveries go well",
            "Lets aim high",
            "Thanks for showing up",
            "Hope your route is clear",
            "Lets stay organised",
            "Stay hydrated",
            "Hope your day flies by",
            "Lets make progress",
        ]
        const pickAMessage = Math.floor(Math.random() * randomMessage.length);
        return `${greetTime} - ${randomMessage[pickAMessage]}.`;
    }

    greetMessage.innerHTML = messages();

    driverName.innerHTML = "Driver 👨‍💼 : " + result.name;
    pScanner.innerHTML = "Scanner: 📱 " + result.scanner;
    pPrinter.innerHTML = "Printer 🖨 : " + result.printer;
    pSpare.innerHTML = "Spare Battery 🔋 : " + result.sparebattery;
    pCount.innerHTML = "Count " + countHand + " : " + result.count;

    outbriefLink.href = `outbrief.html?route=${rNumber}&loc=${loca}`;
    if (result.isTransferred === 'Yes') {
        document.getElementById("req2clear").disabled = true;
        document.getElementById("message-to-r2c").innerHTML = "Request to Clear has already been sent for this driver.";
        document.getElementById("message-to-r2c").style.color = "green";
    }
}

document.getElementById("showButton").addEventListener("click", showDriverInfo);

const req2clearButton = () => {
    const rNumber = document.getElementById("route").value;
    const loca = document.getElementById("location").value.toUpperCase();

    const now = new Date();
    const hours = now.getHours();

    if (hours < 12) {
        const confirmed = confirm("Are you sure you want to request to clear now?");
        if (!confirmed) {
            return;
        }
    }

    if (!loca || !rNumber) {
        alert("Please enter both a location and a route number.");
        return;
    }

    fetch("https://drivercontrolsheet.onrender.com/request-clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            date: today,
            loc: loca,
            route: rNumber
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            document.getElementById("req2clear").disabled = true;
            document.getElementById("message-to-r2c").innerHTML = "Request to Clear has been sent successfully.";
            document.getElementById("message-to-r2c").style.color = "green";
        } else {
            document.getElementById("message-to-r2c").innerHTML = "Failed to send Request to Clear. Please try again.";
            document.getElementById("message-to-r2c").style.color = "red";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        document.getElementById("message-to-r2c").innerHTML = "An error occurred. Please try again.";
        document.getElementById("message-to-r2c").style.color = "red";
    });
};

document.getElementById("req2clear").addEventListener("click", req2clearButton);
