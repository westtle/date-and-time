let hour;
let minute;
let second;

let year;
let month;
let day;

let currentDay;

let timeOffset = "+00:00";
let timeFormat = "12-hour";

// HTML.
const hourDiv = document.querySelector("#--hour");
const minuteDiv = document.querySelector("#--minute");
const secondDiv = document.querySelector("#--second");

const monthDayYearDiv = document.querySelector("._month-day-year");

const currentDayDiv = document.querySelector("._current-day");

const hourHand = document.querySelector(".hour-hand");
const minuteHand = document.querySelector(".minute-hand");
const secondHand = document.querySelector(".second-hand");

const pmAm = document.querySelector("#--pm-am");

const selectTimezone = document.querySelector(".__select-time select");
const applyButton = document.querySelector(".__select-time button");

const twelveHourFormat = document.querySelector("._time-format").children[0];
const twentyFourHourFormat = document.querySelector("._time-format").children[1];

const daylightSavingIcon = document.querySelector("._daylight-saving");

function setTime() {

    // Get date & time from MomentJS.
    let date = moment.utc().utcOffset(`${timeOffset}`);

    hour = date.hour();
    minute = date.minute();
    second = date.second();

    year = date.year();
    month = date.month();
    day = date.date();

    currentDay = date.day();

    if (timeFormat == "12-hour") {
        if (hour >= 13) {
            hour -= 12;
        };
    };

    // Update DOM.
    const monthsName = ["January", "February", "March", "April",
                        "May", "June", "July", "August",
                        "September", "October", "November", "December"];

    const daysName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    hourDiv.innerText = hour;
    minuteDiv.innerText = minute;
    secondDiv.innerText = second;

    monthDayYearDiv.innerText = `${monthsName[month]} ${day}, ${year}`;

    currentDayDiv.innerText = daysName[currentDay];

    // Update clock hand.
    let secondDeg = second / 60;
    let minuteDeg = (secondDeg + minute) / 60;
    let hourDeg = (minuteDeg + date.hour()) / 12;

    secondHand.style.transform = `rotate(${secondDeg * 360 + 90 + minute * 360}deg)`;
    minuteHand.style.transform = `rotate(${minuteDeg * 360 + 90}deg)`;
    hourHand.style.transform = `rotate(${hourDeg * 360 + 90}deg)`;

    // If under 10, add 0 at start (ex. 9 to 09).
    if (hour == 0 || hour == -12) {
        hourDiv.innerText = `12`;
    } else if (hour < 10) {
        hourDiv.innerText = `0${hour}`;
    };
    
    if (minute < 10) {
        minuteDiv.innerText = `0${minute}`;
    };
    
    if (second < 10) {
        secondDiv.innerText = `0${second}`;
    };
    
    if (day < 10) {
        monthDayYearDiv.innerText = `${monthsName[month]} 0${day}, ${year}`;
    };

    // Set PM or AM.
    if (timeFormat == "12-hour") {
        if (date.hour() >= 12) {
            pmAm.innerText = "PM";
        } else if (date.hour() >= 0) {
            pmAm.innerText = "AM";
        };

        pmAm.style.display = "inline";
    } else {
        pmAm.style.display = "none";
    };
};

function setTimezone(e) {
    let minuteValue = "00";

    let inputValue = selectTimezone.value;
    let isDaylightSavingTime = selectTimezone.options[selectTimezone.selectedIndex].dataset.dst; // See if selected timezone is in DST.

    if (isDaylightSavingTime) {
        daylightSavingIcon.style.opacity = 1;
    } else {
        daylightSavingIcon.style.opacity = 0.6;
    };

    if (inputValue.includes(".5")) {
        minuteValue = "30";
        inputValue = inputValue.slice(0, inputValue.length - 2);
    } else if (inputValue.includes(".75")) {
        minuteValue = "45";
        inputValue = inputValue.slice(0, inputValue.length - 3);
    }

    if (inputValue >= 10) {
        inputValue = `+${inputValue}`;
    } else if (inputValue >= 0) {
        inputValue = `+0${inputValue}`;
    } else if (inputValue <= -10) {
        inputValue = `-${inputValue.slice(1)}`;
    } else if (inputValue < 0) {
        inputValue = `-0${inputValue.slice(1)}`;
    };

    timeOffset = `${inputValue}:${minuteValue}`;
    document.getElementById("--offset").innerText = `(${timeOffset})`;

    setTime();
};

function setFormat() {
    if (this.innerText == "12-hour") {
        twentyFourHourFormat.classList.remove("selected-format");
        twelveHourFormat.classList.add("selected-format");
        timeFormat = "12-hour";

        setTime();
    } else if (this.innerText == "24-hour") {
        twelveHourFormat.classList.remove("selected-format");
        twentyFourHourFormat.classList.add("selected-format");
        timeFormat = "24-hour";

        setTime();
    };
};

// Add dropdown options.
fetch("./assets/timezones.json")
    .then(response => response.json())
    .then(data => data.forEach(timezone => {
        let option = document.createElement("option");
        if (timezone.text == "(UTC) Coordinated Universal Time") {
            option.selected = true;
        };

        if (timezone.isdst) {
            option.dataset.dst = true;
        };

        option.value = timezone.offset;
        option.innerText = timezone.text;
        selectTimezone.append(option)
    }))
    .catch(error => console.log(error));

applyButton.addEventListener("click", setTimezone);
twelveHourFormat.addEventListener("click", setFormat);
twentyFourHourFormat.addEventListener("click", setFormat);

document.addEventListener("DOMContentLoaded", () => {
    setTime();
});

setInterval(setTime, 1000);