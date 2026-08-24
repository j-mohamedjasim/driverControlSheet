const approveSearchFunction = async () => {
    const locA = document.getElementById("locationA").value.trim().toUpperCase();
    const rte = document.getElementById("routeA").value.trim();
    const approve = document.getElementById("approve").value.trim();
    const now = new Date();
    const today = now.getFullYear() + '-' +
              String(now.getMonth() + 1).padStart(2, '0') + '-' +
              String(now.getDate()).padStart(2, '0');

    if (locA === "" || rte === "" || approve === "" ) {
        alert("Location or Route or Approver fields must not be empty");
        return;
    }
    const result = await findItems(rte, locA);

    if (result) {
        document.getElementById('postcode1').disabled = false;
        document.getElementById('postcode1').value = "";
        document.getElementById('postcode1').value = result.leftInBayP1;

        document.getElementById('reason1').disabled = false;
        document.getElementById('reason1').value = "";
        document.getElementById('reason1').value = result.leftInBayR1;

        document.getElementById('postcode2').disabled = false;
        document.getElementById('postcode2').value = "";
        document.getElementById('postcode2').value = result.leftInBayP2;

        document.getElementById('reason2').disabled = false;
        document.getElementById('reason2').value = "";
        document.getElementById('reason2').value = result.leftInBayR2;

        document.getElementById('postcode3').disabled = false;
        document.getElementById('postcode3').value = "";
        document.getElementById('postcode3').value = result.leftInBayP3;

        document.getElementById('reason3').disabled = false;
        document.getElementById('reason3').value = "";
        document.getElementById('reason3').value = result.leftInBayR3;
        

        //start of bulk values from below:

        document.getElementById('bulk1').disabled = false;
        document.getElementById('bulk1').value = "";
        document.getElementById('bulk1').value = result.bulkLeftP1;

        document.getElementById('bulk2').disabled = false;
        document.getElementById('bulk2').value = "";
        document.getElementById('bulk2').value = result.bulkLeftP2;

        document.getElementById('bulk3').disabled = false;
        document.getElementById('bulk3').value = "";
        document.getElementById('bulk3').value = result.bulkLeftP3;

        document.getElementById('bulk4').disabled = false;
        document.getElementById('bulk4').value = "";
        document.getElementById('bulk4').value = result.bulkLeftP4;

        document.getElementById('bulk5').disabled = false;
        document.getElementById('bulk5').value = "";
        document.getElementById('bulk5').value = result.bulkLeftP5;

        document.getElementById('bulk6').disabled = false;
        document.getElementById('bulk6').value = "";
        document.getElementById('bulk6').value = result.bulkLeftP6;

        //below are the RDNA and timecard status:

        const rdna = result.rdna;
        const timecards = result.timecards;

        if (rdna === 'Yes') {
            document.getElementById('radio-button-rdna-yes-auth').checked = true;
        } else if (rdna === 'No') {
            document.getElementById('radio-button-rdna-no-auth').checked = true;
        } else {
            document.getElementById('radio-button-rdna-yes-auth').checked = false;
            document.getElementById('radio-button-rdna-no-auth').checked = false;
        }

        if (timecards === 'Yes') {
            document.getElementById('radio-button-time-yes-auth').checked = true;
        } else if (timecards === 'No') {
            document.getElementById('radio-button-time-no-auth').checked = true;
        } else {
            document.getElementById('radio-button-time-yes-auth').checked = false;
            document.getElementById('radio-button-time-no-auth').checked = false;
        }

    } else {
        alert('No record found for the given route number and location. Please ask the driver to contact with dispatch.');
    }
}

document.getElementById("showButton").addEventListener('click', approveSearchFunction);

const approveForSubmission = async () => {
    const locA = document.getElementById("locationA").value.trim().toUpperCase();
    const rte = document.getElementById("routeA").value.trim();
    const approve = document.getElementById("approve").value.trim();
    const approveButton = document.getElementById("submit-for-approve");
    const now = new Date();
    const today = now.getFullYear() + '-' +
              String(now.getMonth() + 1).padStart(2, '0') + '-' +
              String(now.getDate()).padStart(2, '0');
    if (locA === "" || rte === "" || approve === "" ) {
        alert("Location or Route or Approver fields must not be empty");
        return;
    }

    const postcode1 = document.getElementById('postcode1').value.trim().toUpperCase();
    const reason1 = document.getElementById('reason1').value.trim();
    const postcode2 = document.getElementById('postcode2').value.trim().toUpperCase();
    const reason2 = document.getElementById('reason2').value.trim();
    const postcode3 = document.getElementById('postcode3').value.trim().toUpperCase();
    const reason3 = document.getElementById('reason3').value.trim();

    const bulk1 = document.getElementById('bulk1').value.trim().toUpperCase();
    const bulk2 = document.getElementById('bulk2').value.trim().toUpperCase();
    const bulk3 = document.getElementById('bulk3').value.trim().toUpperCase();
    const bulk4 = document.getElementById('bulk4').value.trim().toUpperCase();
    const bulk5 = document.getElementById('bulk5').value.trim().toUpperCase();
    const bulk6 = document.getElementById('bulk6').value.trim().toUpperCase();

    let rdna = '';
    let timecards = '';

    const rdnaYes = document.getElementById('radio-button-rdna-yes-auth');
    const rdnaNo = document.getElementById('radio-button-rdna-no-auth');
    const timeYes = document.getElementById('radio-button-time-yes-auth');
    const timeNo = document.getElementById('radio-button-time-no-auth');

    if (!rdnaYes.checked && !rdnaNo.checked || !timeYes.checked && !timeNo.checked) {
        alert('You need to select RDNA or Timecards status before approve the driver');
        return;
    }

    if (rdnaYes.checked) {
        rdna = 'Yes';
    } else {
        rdna = 'No';
    }

    if (timeYes.checked) {
        timecards = 'Yes';
    } else {
        timecards = 'No';
    }

    const response = await fetch("https://drivercontrolsheet.onrender.com/update-aprovals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            date: today,
            loc: locA,
            route: rte,
            appBy: approve,
            leftInBayP1: postcode1,
            leftInBayR1: reason1,
            leftInBayP2: postcode2,
            leftInBayR2: reason2,
            leftInBayP3: postcode3,
            leftInBayR3: reason3,
            bulkLeftP1: bulk1,
            bulkLeftP2: bulk2,
            bulkLeftP3: bulk3,
            bulkLeftP4: bulk4,
            bulkLeftP5: bulk5,
            bulkLeftP6: bulk6,
            rdnaStatus: rdna,
            timeStatus: timecards

        })
    });

    if (!response.ok) {
        return null;
    }

    const data = await response.json();

    if (data.status === "success") {
        alert("Approval sucessfully submitted.");
        rte.innerHTML = "";
    } else {
        alert("Something went wrong.");
    }
    return data;
}

document.getElementById("submit-for-approve").addEventListener('click', approveForSubmission);