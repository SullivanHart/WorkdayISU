let courseTables;

// load the tables after they have been found
async function getTables() {
  courseTables = await waitForTables();
}

// wait for course tables then returns them
function waitForTables() {
  return new Promise((resolve) => {
    let prevTblCnt = 0;
    let stableTimer;

    const checkStable = () => {
      const containers = document.querySelectorAll('[data-automation-id="rivaWidget"]');
      const fltrdTbls = getFltrdTables( containers );
      const currTblCnt = fltrdTbls.length;

      if (currTblCnt === prevTblCnt && currTblCnt > 0) {
        tableObserver.disconnect();
        resolve(Array.from(fltrdTbls));
      } else {
        prevTblCnt = currTblCnt;
        stableTimer = setTimeout(checkStable, 500);
      }
    };

    const tableObserver = new MutationObserver(() => {
      clearTimeout(stableTimer);
      stableTimer = setTimeout(checkStable, 500);
    });

    tableObserver.observe(document.body, { childList: true, subtree: true });

    // initial check 
    checkStable();
  });
}

// Filter tables to only allow enrolled ones
function getFltrdTables( containers ) {

  let fltrdTbls = [];

  if( containers ){
    for( let i = 0; i < containers.length; i++ ){
      if( isContainerEnrolled( containers[ i ] ) ){
        fltrdTbls.push( containers[ i ].querySelector( "table" ) );
      }
    }
  }

  return fltrdTbls;
}

// Check if a table contains enrolled courses
function isContainerEnrolled( container ){
  return getContainerName( container ) == 'My Enrolled Courses';
}

// Get the name of a table
function getContainerName( container ) {

  const name = container.querySelector(':scope span.gwt-InlineLabel.WATJ[data-automation-id="gridTitleLabel"]');
  return name.getAttribute( 'title' );

}

// external check for if tables have already been loaded
function isTablesLoaded() {
  return Array.isArray(courseTables) && courseTables.length > 0;
}
