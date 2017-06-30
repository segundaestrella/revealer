var fs = require('fs');
var vlq = require('vlq');
var sha1 = require('sha1');
var config = require('./config/config.js');

var obj = JSON.parse(fs.readFileSync(config.path_mapfile, 'utf8'));
var sha1source;
delete obj.sourcesContent;
parseMappings();
calculateSHA1Source();
delete obj.mappings;
var appRouter = function(app) {

 app.post("/errornotification", function(req,res){
  /*
  LOG JSON ERROR OBJECT STRUCTURE
  {
    errorName : error category (InternalError,RangeError,SyntaxError,TypeError,ReferenceError),
    message : error message
    timeError : error occur time
    sha1SourceFile : sha1 code generated from the sourcemap related
                    this field can be used to understand to which release(product version) this error relates to
                    can be also used to retrieve all the errors occurred in the same release
                    can be also used to understand if an error continue to occur release after release or is been fixed
    idError : sha1 code generated from the stringified error object containing
              errorName + message + stack
              this information identify exactly an error occurring in a class and can be used as identifier
    stack : error stacktrace
            if the UI code is minified the coordinates are interpreted and translated on the orginal source file
    userName
    userId
    userAgent : browser info
  }


  */
  if(typeof req.body != 'object'){
    res.send('Parameters received not an error object');
    return;
  }else{
    if(Object.keys(req.body).length == 0){
      res.send('Parameter object received is empty');
      return;
    }
  }
  var parseStack = function(stackEl){

    var checkFile = function(stackEl){
      var fileName = stackEl.url.split('/');
      fileName = fileName[fileName.length - 1];
      return fileName === obj.file;
    }(stackEl);

    if(!checkFile){ /* IF STACKTRACE IS NOT RELATED TO THE SOURCEMAP */
      stackEl.outputObject = {
        fileRow : stackEl.line,
        fileCol : stackEl.column,
        nameArrayValue : stackEl.func,
        fileName  : stackEl.url.split('/').pop()
      }

      return;
    }
    var fileIndex = stackEl.line - 1;
    var tempArray = obj.parsedMapping[fileIndex];
    var colIndex,colIndexNext;
    stackEl.array = null;
    stackEl.outputObject = {};
    for( var i =0; i < tempArray.length - 1 ; i++ ){
      colIndex = tempArray[i][0];
      colIndexNext = tempArray[i+1][0];
      if(colIndex <= stackEl.column && stackEl.column <= colIndexNext){
        stackEl.array = tempArray[i];
        break;
      }
    }
    if(!stackEl.array && stackEl.column >= tempArray[tempArray.length - 1][0]) stackEl.array = tempArray[tempArray.length - 1];

    stackEl.outputObject.fileRow = stackEl.array[2] + 1;
    stackEl.outputObject.fileCol = stackEl.array[3] + 1;
    stackEl.outputObject.nameArrayValue = obj.names[stackEl.array[4]];
    stackEl.outputObject.fileName  = obj.sources[fileIndex];

    delete stackEl.array;
    // stackEl.nameArrayIndex =
    // obj.parsedMapping[fileIndex];
  }

  var errorObj = req.body;
  for(var i=0; i < errorObj.stack.length ; i++ ){
    parseStack(errorObj.stack[i]);
  }
  errorObj.userAgent = req.headers['user-agent'];
  var output = enrichObjectWithMetaInfos(errorObj);


  writeToLog(output,res);


 });

}

function writeToLog(error,res){
  fs.appendFile(config.path_logfile, JSON.stringify(error), function(err) {
    if(err) {
        console.log(err);
        res.send();
    } else {
        console.log("Server-Log: The file was saved!");
        res.send();
    }
  });
}


function parseMappings(){
  var temp = [];
  var parsedLine;
  // colons represent end of the lines
  var vlqs = obj.mappings.split( ';' ).map( function ( line ) {
  	return line.split( ',' );
  });

  var decoded = vlqs.map( function ( line ) {
  	return line.map( vlq.decode );
  });

  var sourceFileIndex = 0,   // second field
    sourceCodeLine = 0,    // third field
    sourceCodeColumn = 0,  // fourth field
    nameIndex = 0;         // fifth field

  obj.parsedMapping = decoded.map( function ( line ) {
    var generatedCodeColumn = 0; // first field - reset each time

    return line.map( function ( segment ) {
      var result;

      generatedCodeColumn += segment[0];

      result = [ generatedCodeColumn ];

      if ( segment.length === 1 ) {
        // only one field!
        return result;
      }

      sourceFileIndex  += segment[1];
      sourceCodeLine   += segment[2];
      sourceCodeColumn += segment[3];

      result.push( sourceFileIndex, sourceCodeLine, sourceCodeColumn );

      if ( segment.length === 5 ) {
        nameIndex += segment[4];
        result.push( nameIndex );
      }

      return result;
    });
  });



  // for(var cont = 0; cont < mappingsArray.length; cont ++){
  //
  //   temp = mappingsArray[cont].split(',');
  //
  //   for(var line = 0; line < temp.length ; line++){
  //     parsedLine = vlq.decode(temp[line]);
  //     temp[line] = {
  //       col : parsedLine[0],
  //       fileIndex : parsedLine[1],
  //       line : parsedLine[2],
  //       colMapping : parsedLine[3],
  //       nameIndex : parsedLine[4]
  //     };
  //   }
  //
  //   mappingsArray[cont] = temp;
  // }
  // obj.parsedMapping = mappingsArray;
}


function enrichObjectWithMetaInfos(obj){
  var output = {};

  var now = new Date();
  var array_source = [];
  output.errorName = obj.name;
  output.message = obj.message;
  output.userName = obj.userName;
  output.userId = obj.userId;
  output.userAgent = obj.userAgent;
  output.stack = [];
  for(var i=0; i < obj.stack.length ; i++ ){
    output.stack.push(obj.stack[i].outputObject);
  }
  output.sha1SourceFile = sha1SourceFile;
  var id = sha1(JSON.stringify(output));
  var day = now.getDate().toString();
  day = (day.length == 2)? day : '0'+day;
  var month = now.getMonth().toString();
  month = (month.length == 2)? month : '0'+month;
  var year = now.getFullYear().toString();
  output.timeError = day + "/" + month + "/" + year +  " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
  output.idError = id;
  return output;
}


function calculateSHA1Source(){
  var file = fs.readFileSync(config.path_mapfile, 'utf8');
  sha1SourceFile = sha1(file);
}
module.exports = appRouter;
