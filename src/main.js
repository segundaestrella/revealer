TraceKit.report.subscribe(function yourLogger(errorReport) {
  try{
    var xhr = new XMLHttpRequest();
    $.each(errorReport.stack,function(index,s){

      delete s.context;
    })
    errorReport.userName = index_displayName;
    errorReport.userId = index_userInfoId;
    xhr.open('POST', 'http://localhost:9999/errornotification', true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(errorReport));
  }catch(e){

  }
});


window.onerror = function (msg, url, lineNo, columnNo, error) {
   TraceKit.report(error);
}


//TypeError
function TypeErrorExample() {
  var foo = {};
  return foo.bar();
}

// TypeErrorExample();

//SyntaxError

function SyntaxErrorExample(){
  eval('alert("Hello world)');
}

// SyntaxErrorExample();

//ReferenceError
function ReferenceErrorExample(){
  var sux = x + y;
  alert(sum);
}

// ReferenceErrorExample();

//RangeError
function RangeErrorExample(){
  Array.apply(null, new Array(1000000)).map(Math.random);
}

RangeErrorExample();

//InternalError

function InternalErrorExample(){
  function loop(x) {
    if (x >= 1000000000000)
      return;
    // do stuff
    loop(x + 1);
  }
  loop(0);
}

// InternalErrorExample();
