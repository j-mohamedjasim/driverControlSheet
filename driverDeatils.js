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
    } else {
        countHand = '5️⃣➕';
    }

    if (result.requestedClear === 'Yes') {
        document.getElementById("req2clear").disabled = true;
        document.getElementById("message-to-r2c").innerHTML = "Request to Clear has already been sent for this driver.";
        document.getElementById("message-to-r2c").style.color = "green";
    } else {
        document.getElementById("req2clear").disabled = false;
        document.getElementById("message-to-r2c").innerHTML = "";
    }

    driverName.innerHTML = "Driver 👨‍💼 : " + result.name;
    pScanner.innerHTML = "Scanner: " + result.scanner;
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
        if (data.success) {
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
