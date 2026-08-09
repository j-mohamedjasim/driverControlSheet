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
        document.getElementById('postcode1').disabled = true;

        document.getElementById('reason1').disabled = false;
        document.getElementById('reason1').value = "";
        document.getElementById('reason1').value = result.leftInBayR1;
        document.getElementById('reason1').disabled = true;

        document.getElementById('postcode2').disabled = false;
        document.getElementById('postcode2').value = "";
        document.getElementById('postcode2').value = result.leftInBayP2;
        document.getElementById('postcode2').disabled = true;

        document.getElementById('reason2').disabled = false;
        document.getElementById('reason2').value = "";
        document.getElementById('reason2').value = result.leftInBayR2;
        document.getElementById('reason2').disabled = true;

        document.getElementById('postcode3').disabled = false;
        document.getElementById('postcode3').value = "";
        document.getElementById('postcode3').value = result.leftInBayP3;
        document.getElementById('postcode3').disabled = true;

        document.getElementById('reason3').disabled = false;
        document.getElementById('reason3').value = "";
        document.getElementById('reason3').value = result.leftInBayR3;
        document.getElementById('reason3').disabled = true;

        //start of bulk values from below:

        document.getElementById('bulk1').disabled = false;
        document.getElementById('bulk1').value = "";
        document.getElementById('bulk1').value = result.bulkLeftP1;
        document.getElementById('bulk1').disabled = true;

        document.getElementById('bulk2').disabled = false;
        document.getElementById('bulk2').value = "";
        document.getElementById('bulk2').value = result.bulkLeftP2;
        document.getElementById('bulk2').disabled = true;

        document.getElementById('bulk3').disabled = false;
        document.getElementById('bulk3').value = "";
        document.getElementById('bulk3').value = result.bulkLeftP3;
        document.getElementById('bulk3').disabled = true;

        document.getElementById('bulk4').disabled = false;
        document.getElementById('bulk4').value = "";
        document.getElementById('bulk4').value = result.bulkLeftP4;
        document.getElementById('bulk4').disabled = true;

        document.getElementById('bulk5').disabled = false;
        document.getElementById('bulk5').value = "";
        document.getElementById('bulk5').value = result.bulkLeftP5;
        document.getElementById('bulk5').disabled = true;

        document.getElementById('bulk6').disabled = false;
        document.getElementById('bulk6').value = "";
        document.getElementById('bulk6').value = result.bulkLeftP6;
        document.getElementById('bulk6').disabled = true;

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

    const response = await fetch("https://drivercontrolsheet.onrender.com/update-aprovals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            date: today,
            loc: locA,
            route: rte,
            appBy: approve
        })
    });

    if (!response.ok) {
        return null;
    }
    
    return data;
    const data = await response.json();

    if (data.status === "success") {
        alert("Approval sucessfully submitted.");
        rte.innerHTML = "";
    } else {
        alert("Something went wrong.");
    }
}

document.getElementById("submit-for-approve").addEventListener('click', approveForSubmission);