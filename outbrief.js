const urlParams = new URLSearchParams(window.location.search);
const routeNumber = urlParams.get('route');

document.getElementById('route-number').innerHTML = 'Route Number: ' + (routeNumber || 'Please go back to previous page and check your portals first.');
document.getElementById('location').innerHTML = 'Location: ' + (urlParams.get('loc') || 'Please go back to previous page and check your portals first.');

let photoUpload = false;

// function to fetch data from the server and display it in the HTML for CEBS

async function cebs() {
    const loca = urlParams.get('loc');
    const driver = decodeURIComponent(urlParams.get('driver') || '');
    const today = new Date().toISOString().split('T')[0];

    const response = await fetch("https://drivercontrolsheet.onrender.com/get-record-cebs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            date: today,
            loc: loca,
            route: routeNumber
        })
    });

    const data = await response.json();
    if (!response.ok) return;

    const container = document.getElementById('cases-container');
    const template = document.querySelector('.case-box.template');

    data.rows.forEach(row => {
        const item = {
            id: row[0],
            date: row[1],
            route: row[2],
            due_date: row[3],
            type: row[4],
            tracking: row[5],
            address: row[6],
            instruction: row[7],
            status: row[8],
            not_complete_status: row[9],
            req_by: row[10],
            req_pin: row[11],
            driver_name: row[12],
            location: row[13]
        };

        if (item.type.toLowerCase() === 'dispute' && item.driver_name !== driver){
            return; // Skip this item if it's a dispute and the driver name doesn't match
        } // Filter by driver name

        // clone box
        const box = template.cloneNode(true);
        box.classList.remove('template');
        box.style.display = 'block';

        // fill data
        box.querySelector('.tracking').textContent = item.tracking;
        box.querySelector('.case-type').textContent = 'Case Type: ' + item.type;
        box.querySelector('.case-address').textContent = 'Address: ' + item.address;
        box.querySelector('.instruction').textContent = 'Instruction: ' + item.instruction;
        box.querySelector('.case-handler').textContent = 'Case handled by: ' + item.req_by;

        // color logic
        let bg = '';
        let text = '';

        switch (item.type.toLowerCase()) {
            case 'bayout':
                bg = 'rgb(180, 241, 180)';
                text = 'rgb(1, 107, 1)';
                break;
            case 'reattempt':
                bg = 'rgb(225, 164, 84)';
                text = 'rgb(173, 100, 4)';
                break;
            case 'dispute':
                bg = 'rgb(216, 136, 136)';
                text = 'rgb(237, 3, 3)';
                break;
            case 'collection':
                bg = 'rgb(182, 126, 222)';
                text = 'rgb(88, 3, 149)';
                break;
            default:
                bg = 'rgb(127, 193, 224)';
                text = 'rgb(2, 83, 120)';
        }

        box.style.backgroundColor = bg;
        box.style.color = text;
        box.style.border = `2px solid ${text}`;
        box.style.boxShadow = `0 0 10px ${text}`;
        box.style.padding = '10px';
        box.style.margin = '10px';
        box.style.borderRadius = '10px';

        // buttons
        const completeBtn = box.querySelector('.complete-btn');
        const notCompleteBtn = box.querySelector('.not-complete-btn');

        //button styles
        completeBtn.style.backgroundColor = bg;
        completeBtn.style.color = text;
        completeBtn.style.fontWeight = 'bold';
        completeBtn.style.borderRadius = '20px';
        completeBtn.style.padding = '5px 10px';
        completeBtn.style.marginRight = '10px';
        completeBtn.style.cursor = 'pointer';
        completeBtn.style.width = '200px';
        completeBtn.style.textAlign = 'center';
        completeBtn.style.border = `2px solid ${text}`;
        completeBtn.style.fontSize = '16px';
        completeBtn.style.fontFamily = 'Stack Sans Text", sans-serif';

        notCompleteBtn.style.backgroundColor = '#727c72';
        notCompleteBtn.style.color = text;
        notCompleteBtn.style.fontWeight = 'bold';
        notCompleteBtn.style.borderRadius = '20px';
        notCompleteBtn.style.padding = '5px 10px';
        notCompleteBtn.style.marginRight = '10px';
        notCompleteBtn.style.cursor = 'pointer';
        notCompleteBtn.style.width = '200px';
        notCompleteBtn.style.textAlign = 'center';
        notCompleteBtn.style.border = `2px solid ${text}`;
        notCompleteBtn.style.fontSize = '16px';
        notCompleteBtn.style.fontFamily = 'Stack Sans Text", sans-serif';

        // set initial text
        completeBtn.textContent =
            item.status.toLowerCase() === 'complete' ? 'Completed' : 'Complete';

        // COMPLETE BUTTON
        completeBtn.addEventListener('click', () => {
            updateStatus(item.id, 'Complete', completeBtn);
        });

        // NOT COMPLETE BUTTON
        notCompleteBtn.addEventListener('click', () => {
            openReasonPopup(item.id, notCompleteBtn);
        });

        container.appendChild(box);
    });
}

async function updateStatus(id, newStatus, buttonRef) {
    try {
        const response = await fetch("https://drivercontrolsheet.onrender.com/update-cebs-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: id,
                status: newStatus
            })
        });

        const result = await response.json();

        if (response.ok) {
            buttonRef.textContent = 'Completed';
        }
    } catch (err) {
        console.error("Error updating status:", err);
    }
}


function openReasonPopup(id, buttonRef) {
    const modal = document.getElementById('reasonModal');
    modal.style.display = 'block';

    document.getElementById('reasonSubmit').onclick = () => {
        const reason = document.getElementById('reasonInput').value.trim();

        if (!reason) {
            alert("Please enter a reason");
            return;
        }

        updateNotCompleteReason(id, reason, buttonRef);
        buttonRef.textContent = 'Reason Added';

        modal.style.display = 'none';
        document.getElementById('reasonInput').value = '';
    };

    document.getElementById('reasonCancel').onclick = () => {
        modal.style.display = 'none';
        document.getElementById('reasonInput').value = '';
    };
}

async function updateNotCompleteReason(id, reason, buttonRef) {
    try {
        const response = await fetch("https://drivercontrolsheet.onrender.com/update-cebs-not-complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: id,
                not_complete_status: reason
            })
        });

        const result = await response.json();
        console.log(result);

        if (response.ok) {
            // Update ONLY the clicked button
            buttonRef.textContent = 'Reason Added';
            buttonRef.style.backgroundColor = '#d9534f';
            buttonRef.style.color = 'white';
        }
    } catch (err) {
        console.error("Error updating reason:", err);
    }
}

cebs();

async function findItems(routeNumber, loca) {
    const now = new Date();
    const today = now.getFullYear() + '-' +
              String(now.getMonth() + 1).padStart(2, '0') + '-' +
              String(now.getDate()).padStart(2, '0');

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
            isSigned: row[23],
            rdna: row[26],
            timecards: row[27]
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

        if (result.rdna === 'Yes') {
            document.getElementById('radio-button-rdna-yes').checked = true;
        } else if (result.rdna === 'No') {
            documnet.getElementById('radio-button-rdna-no').checked = true;
        }

        if (result.timecards === 'Yes') {
            document.getElementById('radio-button-time-yes').checked = true;
        } else if (result.timecards === 'No') {
            document.getElementById('radio-button-time-no').checked = true;
        }

        if (result.isSigned !== '') {
            document.getElementById('section-h1-signed').innerHTML =
                "Approved by: " + result.isSigned;
            document.getElementById('section-h1-signed').style.color = "green";
        }
    } else {
        alert('No record found for the given route number and location.');
        window.location.href = 'index.html';
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

    const rdnaYes = document.getElementById("radio-button-rdna-yes");
    const rdnaNo = document.getElementById("radio-button-rdna-no");

    const timeYes = document.getElementById("radio-button-time-yes");
    const timeNo = document.getElementById("radio-button-time-no");

    if (!rdnaYes.checked && !rdnaNo.checked || !timeYes.checked && !timeNo.checked) {
        alert("RDNA and Time card status must be selected before submitting.")
        return;
    }

    if (photoUpload !== true) {
        alert("Please take picture of your bay before submitting.")
        return
    }

    let rdnaStatuss = "";
    let timeStatuss = "";

    if (rdnaYes.checked) {
        rdnaStatuss = 'Yes';
    } else {
        rdnaStatuss = 'No';
    }

    if (timeYes.checked){
        timeStatuss = 'Yes';
    } else {
        timeStatuss = 'No';
    }

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
                    bulkLeftP6: checkBulkP6,
                    rdnaStatus: rdnaStatuss,
                    timeStatus: timeStatuss
                }
            })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Changes saved successfully!');
            window.location.href = 'index.html';
        } else {
            alert('Failed: ' + data.error);
        }
    } catch (error) {
        alert('Network error: ' + error.message);
    }

    // TODO: actual submission logic goes here (e.g. sending updated values to your server/GitHub)
};


document.getElementById('submitButton').addEventListener('click', submitChangesCheck);

const video = document.getElementById("camera");

navigator.mediaDevices.getUserMedia({ video: {facingMode: "environment"} })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("Camera error:", err);
  });

const canvas = document.getElementById("canvas");
const preview = document.getElementById("preview");

document.getElementById("captureBtn").onclick = () => {
    const w = video.videoWidth;
    const h = video.videoHeight;

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);

    canvas.toBlob(
        blob => {
            preview.src = URL.createObjectURL(blob);
            window.capturedBlob = blob;
        },
        "image/jpeg",
        0.5
    );
};

document.getElementById("uploadBtn").onclick = () => {
    if (!window.capturedBlob) {
        alert("Please capture a photo first.");
        return;
    }
    const today = new Date().toISOString().split('T')[0];
    const loca = urlParams.get('loc');
    const formData = new FormData();
    formData.append("photo", window.capturedBlob, "driver.jpg");
    formData.append("loc", loca);
    formData.append("route", routeNumber);
    formData.append("date", today);

    fetch("https://drivercontrolsheet.onrender.com/upload-photo", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        console.log("Uploaded:", data);
        alert("Photo uploaded successfully!");
        photoUpload = true;
    })
    .catch(err => console.error(err));
};
