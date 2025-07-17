// Parsing the course info for calendar
//const exampleCourse = {
//courseName: "CPR E 308",
//startDay: "2024-09-03",
//endDay: "2024-12-23",
//startTime: "15:00",
//endTime: "16:00",
//location: "Coover 1313"
//}

var calendarObjects;
const dayOfWeekToNum = new Map([
  ["Su", 0],
  ["M", 1],
  ["T", 2],
  ["W", 3],
  ["R", 4],
  ["F", 5],
  ["Sa", 6], // TODO: Sa & Su might not be right, test with weekend classes?
]);

function parseCourseInfo() {

  calendarObjects = [];
  for (let i = 0; i < courseTables.length; i++) { // TODO: change to [0]? Or otherwise verify that it's the correct table
    const courseRows = courseTables[i].rows;
    for (let j = 2; j < courseRows.length; j++) {
      const courseRow = courseRows[j];
      let courseName = getCourseName(courseRow);
      if ( courseName == '') {
        continue;
      }

      let meeting_patterns = courseRow.childNodes[9].innerText.split("\n");
      let start_blocks = courseRow.childNodes[11].innerText.split("\n");
      let end_blocks = courseRow.childNodes[12].innerText.split("\n");

      // Should be one meeting pattern block per row
      meeting_block = meeting_patterns[ 0 ].trim();

      // Skip online or otherwise empty meeting blocks
      if ( meeting_block == '' ){ 
        continue;
      }

      startDay = start_blocks[ 0 ].trim();
      endDay = end_blocks[ 0 ].trim();

      let daysOfWeek = getDaysOfWeek(meeting_block);
      let startTime = getStartTime(meeting_block);
      let endTime = getEndTime(meeting_block);
      let location = getLocation(meeting_block);

      for (let dayOfWeek of daysOfWeek) {
        let calendarObject = {
          courseName: courseName,
          startDay: getActualStartDate(startDay, dayOfWeek),
          endDay: getActualEndDate(endDay, dayOfWeek),
          startTime: startTime,
          endTime: endTime,
          location: location,
        };
        calendarObjects.push(calendarObject);
      }
    }
  }
}

function getCourseName(courseRow) {
  return courseRow.childNodes[5].innerText.trim();
}

// ---------------------- Logic ----------------------

// gets the actual start date which is:
// 1. later than the start date listed on the course table
// 2. on dayOfWeek
function getActualStartDate(startDay, dayOfWeek) {
  let startDateVals = startDay.split("/");
    
  let startDayOfWeek = getDayOfWeek(
    Number(startDateVals[2]),
    Number(startDateVals[0]),
    Number(startDateVals[1]),
  );

  let dif = (dayOfWeekToNum.get(dayOfWeek) - startDayOfWeek + 7) % 7;

  startDateVals[1] = (Number(startDateVals[1]) + dif).toString();
  return `${startDateVals[2]}-${startDateVals[0]}-${startDateVals[1].padStart(2, "0")}`;
}

// gets the actual end date which is:
// 1. earlier than the end date listed on the course table
// 2. on dayOfWeek
function getActualEndDate(endDay, dayOfWeek) {
  let endDateVals = endDay.split("/");

  let endDayOfWeek = getDayOfWeek(
    Number(endDateVals[2]),
    Number(endDateVals[0]),
    Number(endDateVals[1]),
  );
  let dif = (endDayOfWeek - dayOfWeekToNum.get(dayOfWeek) + 7) % 7;
  endDateVals[1] = (Number(endDateVals[1]) - dif).toString();
  return `${endDateVals[2]}-${endDateVals[0]}-${endDateVals[1].padStart(2, "0")}`;
}

// Formula obtained from https://cs.uwaterloo.ca/~alopez-o/math-faq/node73.html#:~:text=For%20a%20Gregorian%20date%2C%20add,7%20and%20take%20the%20remainder.
// input: int year, int month, int day
// output: int, 0 is Sunday → 6 is Saturday
function getDayOfWeek(year, month, day) {
  // treat Jan and Feb as months of the preceding year
  if (month == 1 || month == 2) year -= 1;
  const k = day;
  const m = ((month + 9) % 12) + 1;
  const C = Math.floor(year / 100);
  const Y = year % 100;
  const W =
    (k +
      Math.floor(2.6 * m - 0.2) -
      2 * C +
      Y +
      Math.floor(Y / 4) +
      Math.floor(C / 4)) %
    7;
  return (W + 7) % 7;
}

function getDaysOfWeek(block) {
  let day_section = block.split("|")[0].trim();
  let days = Array.from(day_section.split(''));
  return handleExceptionalDays(days);
}

function handleExceptionalDays(days) {
  for (let i = days.length; i >= 0; i--) {
    if (!dayOfWeekToNum.has(days[i])) days.splice(i, 1);
  }
  return days;
}

function getTimeSection(block) {
  return block.split("|")[1].trim();
}

function isAm(timeSection) {
  return timeSection.split(" ")[1] == "AM";
}

// converts to 24-hour clock if needed
// input: ([1-12] [a.m.|p.m.]) or 24-hour-clock
function parseTime(time) {
  let timeNum = time.split(" ")[0].trim();
  if ((!isAm(time) && parseInt(timeNum.split(":")[0]) < 12) || (isAm(time) && parseInt(timeNum.split(":")[0]) == 12)) {
    timeNum = `${(parseInt(timeNum.split(":")[0]) + 12) % 24}:${timeNum.split(":")[1].trim()}`
  }
  return ("0" + timeNum).slice(-5);
}

function getStartTime(block) {
  let start_time = getTimeSection(block).split("-")[0].trim();
  return parseTime(start_time);
}

function getEndTime(block) {
  let end_time = getTimeSection(block).split("-")[1].trim();
  return parseTime(end_time);
}

function getLocation(block) {
  let loc_section = block.split("|")[2].trim();
  return loc_section;
}
  