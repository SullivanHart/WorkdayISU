let courseTables;

// loads the tables once they have been found
async function getTables() {
  courseTables = await waitForTables();
}

// wait for the course tables and return it
function waitForTables() {
  return new Promise((resolve) => {
    if (isTablesLoaded()) {
      return resolve(Array.from(document.getElementsByTagName("table")));
    }

    const tableObserver = new MutationObserver(() => {
      if (isTablesLoaded()) {
        resolve(Array.from(document.getElementsByTagName("table")));
        tableObserver.disconnect();
      }
    });
    tableObserver.observe(document.body, { childList: true, subtree: true });
  });
}

// check if the table is loaded
function isTablesLoaded() {
  let tables = document.getElementsByTagName("table");
  return doTablesExist(tables);
}

// check if the tables exist
function doTablesExist(tables) {
  return !!tables ? tables.length > 0 : false;
}