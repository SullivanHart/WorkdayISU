// Functions to translating calendar objects into one large iCal file

const ctTimeZone = "America/Chicago";

function createExportButton() {

  const headerContents = document.querySelector(".WNIM");
  if (!headerContents){
    console.log( 'Header not found', headerContents );
    return;
  }

  if (!courseTables || !isTablesLoaded() ){
    console.log( 'Courses are invalid', courseTables );
    return;
  }

  const link = document.createElement("a");
  let now = new Date();
  let fileName = `ISU-classes-${now.getFullYear()}-${("0" + (now.getMonth() + 1)).slice(-2)}-${("0" + now.getDate()).slice(-2)}.ics`;
  link.setAttribute("download", fileName);

  const downloadText = document.createElement("span");
  downloadText.classList.add("WIQM");
  downloadText.textContent = "Export Calendar";


  const downloadButton = document.createElement("button");
  downloadButton.classList.add("WGQM", "WKQM", "WJ3N", "WD5", "WCPM");
  downloadButton.appendChild( downloadText );

  downloadButton.addEventListener("click", () => {
    const iCalContent = createCalendarString();
    const blob = new Blob([iCalContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.click();
  });

  const downloadItem = document.createElement("li")
  downloadItem.classList.add("WOIM")
  downloadItem.appendChild( downloadButton );

  headerContents.appendChild(downloadItem);
}


// ---------------------- Logic ----------------------

function addEvent(calendarObject) {
  const date = new Date();
  let currTime = `DTSTAMP:${date.getFullYear()}${("0" + (date.getMonth() + 1)).slice(-2)}${("0" + date.getDate()).slice(-2)}T${("0" + date.getHours()).slice(-2)}${("0" + date.getMinutes()).slice(-2)}${("0" + date.getSeconds()).slice(-2)}\r\n`;
  let eventString = "BEGIN:VEVENT\r\nRRULE:FREQ=WEEKLY;INTERVAL=1;UNTIL=";
  eventString +=
    getEndDate(calendarObject) +
    "T235959\r\n" +
    generateUUID() +
    generateSummary(calendarObject) +
    generateStartDate(calendarObject) +
    generateStartEndDate(calendarObject) +
    currTime +
    generateLocation(calendarObject) +
    "END:VEVENT\r\n";
  return eventString;
}

function generateVTIMEZONE() {
  return `BEGIN:VTIMEZONE\r\nTZID:America/Chicago\r\nBEGIN:STANDARD\r\nDTSTART:20241103T090000Z\r\nRRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=11\r\nTZOFFSETFROM:-0700\r\nTZOFFSETTO:-0800\r\nTZNAME:PST\r\nEND:STANDARD\r\nBEGIN:DAYLIGHT\r\nDTSTART:20240310T100000Z\r\nRRULE:FREQ=YEARLY;BYDAY=2SU;BYMONTH=3\r\nTZOFFSETFROM:-0800\r\nTZOFFSETTO:-0700\r\nTZNAME:PDT\r\nEND:DAYLIGHT\r\nEND:VTIMEZONE\r\n`;
}

function createCalendarString() {
  parseCourseInfo();
  let calendar =
    "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:better-workday-calendar\r\n";
  calendar += generateVTIMEZONE();
  for (let calendarObject of calendarObjects) {
    calendar += addEvent(calendarObject);
  }
  calendar += "END:VCALENDAR";
  return calendar;
}

function getEndDate(calendarObject) {
  return calendarObject.endDay.replaceAll("-", "");
}

function generateUUID() {
  let uuid = "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16),
  );
  return "UID:" + uuid + "\r\n";
}

function generateSummary(calendarObject) {
  return `SUMMARY:${calendarObject.courseName}\r\n`;
}

function generateStartDate(calendarObject) {
  return (
    "DTSTART;TZID=" +
    ctTimeZone +
    ":" +
    calendarObject.startDay.replaceAll("-", "") +
    "T" +
    calendarObject.startTime.replaceAll(":", "") +
    "00\r\n"
  );
  // get start date and return it in the format YYYYMMDDTHHMMSS
}

function generateStartEndDate(calendarObject) {
  return (
    "DTEND;TZID=" +
    ctTimeZone +
    ":" +
    calendarObject.startDay.replaceAll("-", "") +
    "T" +
    calendarObject.endTime.replaceAll(":", "") +
    "00\r\n"
  );
  //get the end of the start date and return it in the format YYYYMMDDTHHMMSS
}

function generateLocation(calendarObject) {
  return `LOCATION:${calendarObject.location}\r\n`;
}
