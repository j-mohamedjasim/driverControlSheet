window.addEventListener("load", () => {
    const savedLocation = localStorage.getItem("location");

    if (savedLocation) {
        document.getElementById("locationInput").value = savedLocation;

        document
            .getElementById("btnOutbriefedRoutes")
            .click();
    }
});

document.getElementById("showOutbriefedBtnReload").addEventListener("click", async () => {

        try {

            const location = document
                .getElementById("locationInput")
                .value
                .trim()
                .toUpperCase();

            localStorage.setItem("location", location);

            const response = await fetch(
                "https://drivercontrolsheet.onrender.com/api/outbriefed-routes",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        location: location
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();

            const tbody = document.querySelector("#outbriefTable tbody");

            tbody.innerHTML = "";

            if (data.length === 0) {

                tbody.innerHTML = `
                    <tr>
                        <td colspan="3" style="text-align:center;">
                            No drivers outbriefed
                        </td>
                    </tr>
                `;

            } else {

                data.forEach(item => {

                    const row = document.createElement("tr");

                    row.innerHTML = `
                        <td>${item.route}</td>
                        <td>${item.driver_name}</td>
                        <td>${item.outbrief}</td>
                    `;

                    tbody.appendChild(row);

                });

            }

        } catch (error) {
            console.error("Error loading routes:", error);

            const tbody = document.querySelector("#outbriefTable tbody");

            tbody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align:center;color:red;">
                        Error loading routes
                    </td>
                </tr>
            `;
        }

    });

document.getElementById("showOutbriefedBtn").addEventListener("click", async () => {

        try {

            const location = document
                .getElementById("locationInput")
                .value
                .trim()
                .toUpperCase();

            localStorage.setItem("location", location);

            const response = await fetch(
                "https://drivercontrolsheet.onrender.com/api/outbriefed-routes",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        location: location
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();

            const tbody = document.querySelector("#outbriefTable tbody");

            tbody.innerHTML = "";

            if (data.length === 0) {

                tbody.innerHTML = `
                    <tr>
                        <td colspan="3" style="text-align:center;">
                            No drivers outbriefed
                        </td>
                    </tr>
                `;

            } else {

                data.forEach(item => {

                    const row = document.createElement("tr");

                    row.innerHTML = `
                        <td>${item.route}</td>
                        <td>${item.driver_name}</td>
                        <td>${item.outbrief}</td>
                    `;

                    tbody.appendChild(row);

                });

            }

        } catch (error) {
            console.error("Error loading routes:", error);

            const tbody = document.querySelector("#outbriefTable tbody");

            tbody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align:center;color:red;">
                        Error loading routes
                    </td>
                </tr>
            `;
        }

    });