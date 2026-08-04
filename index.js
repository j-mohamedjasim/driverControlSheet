const date = new Date();
const showTodayDate = date.toISOString().split('T')[0];

const todayDate = document.getElementById("date").innerHTML = showTodayDate;