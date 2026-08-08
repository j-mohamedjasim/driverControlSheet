const urlParams = new URLSearchParams(window.location.search);
const routeNumber = urlParams.get('route');

document.getElementById('route-number').innerHTML = 'Route Number: ' + (routeNumber || 'Please go back to previous page and check your portals first.');
document.getElementById('location').innerHTML = 'Location: ' + (urlParams.get('loc') || 'Please go back to previous page and check your portals first.');

async function findItems(routeNumber, loca) {
    const today = new Date().toISOString().split('T')[0];

    const response = await fetch("https://drivercontrolsheet.onrender.com/get-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            date: today,
            loc: loca,
            route: routeNumber
        })
    });

    const data = await response.json();
    if (response.ok) {
        const row = data.row;

        return {
            leftInBayP1: row[11],
            leftInBayR1: row[12],
            leftInBayP2: row[13],
            leftInBayR2: row[14],
            leftInBayP3: row[15],
            leftInBayR3: row[16],
            bulkLeftP1: row[17],
            bulkLeftP2: row[18],
            bulkLeftP3: row[19],
            bulkLeftP4: row[20],
            bulkLeftP5: row[21],
            bulkLeftP6: row[22],
            isSigned: row[23]
        };
    }

    return null;
}

async function getDriverInput() {
    const loca = urlParams.get('loc');
    const routeNumber = urlParams.get('route');

    const result = await findItems(routeNumber, loca);

    if (result) {
        document.getElementById('postcode1').value = result.leftInBayP1;
        document.getElementById('reason1').value = result.leftInBayR1;
        document.getElementById('postcode2').value = result.leftInBayP2;
        document.getElementById('reason2').value = result.leftInBayR2;
        document.getElementById('postcode3').value = result.leftInBayP3;
        document.getElementById('reason3').value = result.leftInBayR3;

        document.getElementById('bulk1').value = result.bulkLeftP1;
        document.getElementById('bulk2').value = result.bulkLeftP2;
        document.getElementById('bulk3').value = result.bulkLeftP3;
        document.getElementById('bulk4').value = result.bulkLeftP4;
        document.getElementById('bulk5').value = result.bulkLeftP5;
        document.getElementById('bulk6').value = result.bulkLeftP6;

        if (result.isSigned !== '') {
            document.getElementById('section-h1-signed').innerHTML =
                "Approved by: " + result.isSigned;
            document.getElementById('section-h1-signed').style.color = "green";
        }
    } else {
        alert('No record found for the given route number and location.');
    }
}


getDriverInput();

const submitChangesCheck = async () => {
    const loca = urlParams.get('loc');
    const result = findItems(routeNumber, loca);

    if (!result) {
        alert('No record found.');
        return;
    }

    const checkBayP1 = document.getElementById('postcode1').value;
    const checkBayR1 = document.getElementById('reason1').value;
    const checkBayP2 = document.getElementById('postcode2').value;
    const checkBayR2 = document.getElementById('reason2').value;
    const checkBayP3 = document.getElementById('postcode3').value;
    const checkBayR3 = document.getElementById('reason3').value;

    const checkBulkP1 = document.getElementById('bulk1').value;
    const checkBulkP2 = document.getElementById('bulk2').value;
    const checkBulkP3 = document.getElementById('bulk3').value;
    const checkBulkP4 = document.getElementById('bulk4').value;
    const checkBulkP5 = document.getElementById('bulk5').value;
    const checkBulkP6 = document.getElementById('bulk6').value;

    const hasChanges =
        result.leftInBayP1 !== checkBayP1 ||
        result.leftInBayR1 !== checkBayR1 ||
        result.leftInBayP2 !== checkBayP2 ||
        result.leftInBayR2 !== checkBayR2 ||
        result.leftInBayP3 !== checkBayP3 ||
        result.leftInBayR3 !== checkBayR3 ||
        result.bulkLeftP1 !== checkBulkP1 ||
        result.bulkLeftP2 !== checkBulkP2 ||
        result.bulkLeftP3 !== checkBulkP3 ||
        result.bulkLeftP4 !== checkBulkP4 ||
        result.bulkLeftP5 !== checkBulkP5 ||
        result.bulkLeftP6 !== checkBulkP6;

    if (!hasChanges) {
        alert('No changes detected. Please make changes before submitting.');
        return;
    }

    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch('https://drivercontrolsheet.onrender.com/update-record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: today,
                location: loca,
                route: routeNumber,
                fields: {
                    leftInBayP1: checkBayP1,
                    leftInBayR1: checkBayR1,
                    leftInBayP2: checkBayP2,
                    leftInBayR2: checkBayR2,
                    leftInBayP3: checkBayP3,
                    leftInBayR3: checkBayR3,
                    bulkLeftP1: checkBulkP1,
                    bulkLeftP2: checkBulkP2,
                    bulkLeftP3: checkBulkP3,
                    bulkLeftP4: checkBulkP4,
                    bulkLeftP5: checkBulkP5,
                    bulkLeftP6: checkBulkP6
                }
            })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Changes saved successfully!');
        } else {
            alert('Failed: ' + data.error);
        }
    } catch (error) {
        alert('Network error: ' + error.message);
    }

    // TODO: actual submission logic goes here (e.g. sending updated values to your server/GitHub)
};

document.getElementById('submitButton').addEventListener('click', submitChangesCheck);
