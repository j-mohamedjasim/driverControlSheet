document
    .getElementById("showOutbriefedBtn")
    .addEventListener("click", async () => {

        try {
            const location = document.getElementById("locationInput").value.toUpperCase();
            const response = await fetch(
                "https://drivercontrolsheet.onrender.com/api/outbriefed-routes", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        location: location
                    })
                }
            );

            const data = await response.json();
            console.log(data)

            const tbody = document.querySelector(
                "#outbriefTable tbody"
            );

            tbody.innerHTML = "";

            data.forEach(item => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${item.route}</td>
                    <td>${item.driver_name}</td>
                    <td>${item.outbrief}</td>
                `;

                tbody.appendChild(row);
            });

        } catch (error) {
            console.error("Error loading routes:", error);
        }
    });