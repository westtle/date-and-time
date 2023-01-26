let hour;
let minute;
let second;

let year;
let month;
let day;

let currentDay;

let timeOffset;
let timezoneText;
let timeFormat = "12-hour";

// HTML.
const hourHTML = document.querySelector(".hour_");
const minuteHTML = document.querySelector(".minute_");
const secondHTML = document.querySelector(".second_");
const monthDayYearHTML = document.querySelector("._month-day-year");

const currentDayHTML = document.querySelector("._current-day");

const hourHand = document.querySelector(".hour-hand__");
const minuteHand = document.querySelector(".minute-hand__");
const secondHand = document.querySelector(".second-hand__");

const pmAm = document.querySelector(".pm-am_");

const selectTimezone = document.querySelector("._timezone");
const applyButton = document.querySelector("._apply-button");

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
    const daysName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthsName = ["January", "February", "March", "April",
                        "May", "June", "July", "August",
                        "September", "October", "November", "December"];
    
    hourHTML.innerText = hour;
    minuteHTML.innerText = minute;
    secondHTML.innerText = second;

    monthDayYearHTML.innerText = `${monthsName[month]} ${day}, ${year}`;

    currentDayHTML.innerText = daysName[currentDay];

    // Update clock hand.
    let secondDeg = second / 60;
    let minuteDeg = (secondDeg + minute) / 60;
    let hourDeg = (minuteDeg + date.hour()) / 12;

    secondHand.style.transform = `rotate(${secondDeg * 360 + 90 + minute * 360}deg)`;
    minuteHand.style.transform = `rotate(${minuteDeg * 360 + 90}deg)`;
    hourHand.style.transform = `rotate(${hourDeg * 360 + 90}deg)`;

    // If under 10, add 0 at start (ex. 9 to 09).
    if (timeFormat == "12-hour" && hour == 0 || hour == -12) {
        hourHTML.innerText = `12`;
    } else if (hour < 10) {
        hourHTML.innerText = `0${hour}`;
    };
    
    if (minute < 10) {
        minuteHTML.innerText = `0${minute}`;
    };
    
    if (second < 10) {
        secondHTML.innerText = `0${second}`;
    };
    
    if (day < 10) {
        monthDayYearHTML.innerText = `${monthsName[month]} 0${day}, ${year}`;
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

    document.querySelector(".offset_").innerText = `(${timeOffset})`;
};

function setTimezone(e) {
    let minuteValue = "00";

    let selectValue = selectTimezone.value;
    let isDaylightSavingTime = selectTimezone.options[selectTimezone.selectedIndex].dataset.dst; // See if selected timezone is in DST.

    if (isDaylightSavingTime) {
        daylightSavingIcon.style.opacity = 1;
    } else {
        daylightSavingIcon.style.opacity = 0.6;
    };

    if (selectValue.includes(".5")) {
        minuteValue = "30";
        selectValue = selectValue.slice(0, selectValue.length - 2);
    } else if (selectValue.includes(".75")) {
        minuteValue = "45";
        selectValue = selectValue.slice(0, selectValue.length - 3);
    }

    if (selectValue >= 10) {
        selectValue = `+${selectValue}`;
    } else if (selectValue >= 0) {
        selectValue = `+0${selectValue}`;
    } else if (selectValue <= -10) {
        selectValue = `-${selectValue.slice(1)}`;
    } else if (selectValue < 0) {
        selectValue = `-0${selectValue.slice(1)}`;
    };

    timeOffset = `${selectValue}:${minuteValue}`;

    setTime();
    saveTimezone(selectTimezone.options[selectTimezone.selectedIndex].innerText);
};

function setFormat() {
    if (this.innerText == "12-hour") {
        twentyFourHourFormat.dataset.selected = "false";
        twelveHourFormat.dataset.selected = "true";
        timeFormat = "12-hour";

        setTime();
    } else if (this.innerText == "24-hour") {
        twelveHourFormat.dataset.selected = "false";
        twentyFourHourFormat.dataset.selected = "true";
        timeFormat = "24-hour";

        setTime();
    };
};

function loadTimezoneOptions() {
    fetch("./assets/timezones.json")
        .then(response => response.json())
        .then(data => data.forEach(timezone => {
            let option = document.createElement("option");

            if (timezone.isdst) {
                option.dataset.dst = true;
            };

            // Select last selected.
            if (timezone.text == timezoneText) {
                option.selected = true;
                if (timezone.isdst) {
                    daylightSavingIcon.style.opacity = 1;
                };
            };

            option.value = timezone.offset;
            option.innerText = timezone.text;
            selectTimezone.append(option);
        }));
};

// Local Storage.
const time_zone_offset = "Time_Zone_Offset";
const time_zone_text = "Time_Zone_Text";

function saveTimezone(timezoneText) {
    localStorage.setItem(time_zone_offset, JSON.stringify(timeOffset));
    localStorage.setItem(time_zone_text, JSON.stringify(timezoneText));
};

function loadTimezone() {
    const timezoneFromStorage = JSON.parse(localStorage.getItem(time_zone_offset)) || "+00:00";
    timeOffset = timezoneFromStorage;

    const timezoneTextFromStorage = JSON.parse(localStorage.getItem(time_zone_text)) || "(UTC) Coordinated Universal Time";
    timezoneText = timezoneTextFromStorage;
};

applyButton.addEventListener("click", setTimezone);
twelveHourFormat.addEventListener("click", setFormat);
twentyFourHourFormat.addEventListener("click", setFormat);

document.addEventListener("DOMContentLoaded", () => {
    loadTimezone();
    loadTimezoneOptions();
    setTime();    
});

setInterval(setTime, 1000);