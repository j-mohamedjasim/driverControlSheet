const today = new Date().toISOString().split('T')[0];

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

    console.log(date, loc, route);

    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    return data;

    // Convert SQL row array → object with column names
    const record = {};
    data.columns.forEach((col, index) => {
        record[col] = data.row[index];
    });

    return record;
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
        driverName.innerHTML = "No record found. Please contact outbrief.";
        pScanner.innerHTML = "";
        pPrinter.innerHTML = "";
        pSpare.innerHTML = "";
        pCount.innerHTML = "";
        return;
    }

    driverName.innerHTML = "Driver: " + result.name;
    pScanner.innerHTML = "Scanner: " + result.scanner;
    pPrinter.innerHTML = "Printer: 🖨 " + result.printer;
    pSpare.innerHTML = "Spare Battery: 🔋 " + result.sparebattery;
    pCount.innerHTML = "Count: " + result.count;
}


document.getElementById("showButton").addEventListener("click", showDriverInfo);
