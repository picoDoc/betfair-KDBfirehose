$(function(){

  var $statusMsg = $("#status-msg");

  /* Bind Events */
  KDBCONNECT.bind("event","ws_event",function(data){
    // Data is default message that is set in monitor.js
    $statusMsg.html(data);
  });
  KDBCONNECT.bind("event","error",function(data){
    $statusMsg.html("Error - " + data);
  });

  /* Bind data - Data type "start" will execute the callback function */
  KDBCONNECT.bind("data","start",function(data){
    // Check that data is not empty
    if(data.hbtable.length !== 0){ $("#heartbeat-table").html(MONITOR.jsonTable(data.hbtable)); }   // Write HTML table to div element with id heartbeat-table  
    if(data.lmtable.length !== 0){ $("#logmsg-table").html(MONITOR.jsonTable(data.lmtable));    }  // Write HTML table to div element with id logmsg-table 
    if(data.lmchart.length !== 0){ MONITOR.barChart(data.lmchart,"logmsg-chart","Error Count","myTab"); }  // Log message error chart
  });
  KDBCONNECT.bind("data","upd",function(data){
    if(data.tabledata.length===0) return;
    if(data.tablename === "heartbeat"){ $("#heartbeat-table").html(MONITOR.jsonTable(data.tabledata));  }
    if(data.tablename === "logmsg"){ $("#logmsg-table").html(MONITOR.jsonTable(data.tabledata));  }
    if(data.tablename === "lmchart"){ MONITOR.barChart(data.tabledata,"logmsg-chart","Error Count","myTab"); } 
  });
  KDBCONNECT.bind("data","bucketlmchart",function(data){
    if(data[0].length>0){ MONITOR.barChart(data[0],"logmsg-chart","Error Count","myTab");}
  });

  /* 
    UI - Highlighting 
    highlightRow(tableId,colNumber,conditionArray,cssClass);
  */
  MONITOR.highlightRow('#heartbeat-table',5,["=","true"],"warning-row");
  MONITOR.highlightRow('#heartbeat-table',6,["=","true"],"error-row");
  MONITOR.highlightColCell('#logmsg-table','logmsg-error',4);  

  /* Bucket chart input - Grab value from input and send function argument */
  MONITOR.bucketChart('#bucket-time',"bucketlmchart");

  /* Extra UI configurations - Logmsg tabs */
  $('#myTab a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
    $(window).scrollTop($(this).offset().top);
  });
  $('#bucket-time').click(function (e) {
    e.preventDefault();
    $(window).scrollTop($(this).offset().top);
  });
});