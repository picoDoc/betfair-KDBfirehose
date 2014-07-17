/*jslint indent: 4, maxerr: 50, white: true, browser: true, debug: true, todo: true,plusplus: true */
/*global clearInterval: false, clearTimeout: false, document: false, event: false, frames: false, history: false, Image: false, location: false, name: false, navigator: false, Option: false, parent: false, screen: false, setInterval: false, setTimeout: false, window: false, XMLHttpRequest: false */

/**
  Lets you easily connect to a kdb+ server with WebSocket enabled
  and then send and receive data. It contains functions for formatting JSON
  object data into HTML formatted tables and also a chart function. Data types
  can be bound to a specific function, this allows control over specific data
  that the front end might receive from the kdb+ server.
  @module KDBCONNECT
  @main KDBCONNECT
  @author Glen Smith at AquaQ Analytics
*/
var KDBCONNECT = {};
/**
  Holds default config data
  @property config
  @for KDBCONNECT
  @type Object
*/
KDBCONNECT.VERSION = "1.0.1"
/**
  Holds default config data
  @property config
  @for KDBCONNECT
  @type Object
*/
KDBCONNECT.config = {
  /**
    URL to WebSocket server
    @attribute {String} URL string
    @type String
  */
  url: ""
};
/** 
  Object holds callback functions for specific data events 
  @property callbacks
  @for KDBCONNECT
  @type Object
*/
KDBCONNECT.callbacks = {};
/** 
  Object holds event functions for specific events e.g. WebSocket opened so display a message
  @property events
  @for KDBCONNECT
  @type Object
*/
KDBCONNECT.events = {};
/** 
  Bind events to a function, once the corresponding handler is used it will access one of the callbacks/events objects for the correct function.
  e.g. Bind data type received "start" with function that displays each bit of data. This function is stored in KDBCONNECT.callbacks
  @method bind 
  @param type {String} Type of event e.g. data or event
  @param event {String} Name of specific event
  @param callback {function} The callback that handles the response.
*/
KDBCONNECT.bind = function(type,event,callback){
	"use strict";
  var callbacks = type === "data" ? "callbacks" : "events";
  KDBCONNECT[callbacks][event] = KDBCONNECT[callbacks][event] || [];
  KDBCONNECT[callbacks][event].push(callback);
  return this;
};
/** 
  Handles events that are called.
  @method eventHandler
  @param event {String} Event that was binded using bind function
  @param data {String|Object} Data that the callback function will use
*/
KDBCONNECT.eventHandler = function(event,data){
	"use strict";
  var chain = KDBCONNECT.events[event],i;
  if(chain === undefined){
    return;
  }
  for(i=0;i<chain.length;i++){
    chain[i](data);
  }
};
/** 
  Handles data events that are called. 
  @method dataHandler
  @param event {String} Event that was binded using bind function
  @param data {String|Object} Data that the callback function will use
*/
KDBCONNECT.dataHandler = function(event,data){
  "use strict";
  var chain = KDBCONNECT.callbacks[event],i;
  if(chain === undefined){
    return;
  }
  for(i=0;i<chain.length;i++){
    chain[i](data);
  }
};
/** 
  Holds core functionality needed for this KDBCONNECT script to work
  @module KDBCONNECT  
  @submodule core  
*/
KDBCONNECT.core = (function() {
  "use strict";
  /**
    Initially holds a boolean value false and later holds WebSocket object
    @property websocket
    @for core
    @type {Boolean|Object}
  */
  var websocket = false;
  /** 
    Checks if WebSocket is still open 
    @method checkSocket
    @param {object} socket - Current WebSocket 
    @return {boolean} True if WebSocket is open and ready
  */
  function checkSocket(socket) {
    if(  (socket.hasOwnProperty("readyState") || ("readyState" in socket)) && socket.readyState === 1 ){	// State is open - socket.hasOwnProperty doesn't work in some browsers use in
      return true;
    }
    return false;
  }
  /** 
    Sends a command to kdb+ server, implements checks
    @method sendcmd
    @param socket {Object} Current WebSocket 
    @param option {String} The argument you want to send to kdb+ server
  */
  function sendcmd(socket,option) {	// Send a message through the websocket, it is serialized before hand
    try{
      if(checkSocket(socket)){
        websocket.send(serialize(JSON.stringify(option)));	// Sends serialized websocket request 
      } else{
        openWebSocket();	// If websocket is closed, try opening it
      }
    }catch(err){
      console.log("ERROR - send - " + err);
      KDBCONNECT.eventHandler("error",err.message);
    }
  }
  /** 
    Used on first start of script, gets default information
    @method start
    @param socket {Object} Current WebSocket 
  */  
  function start(socket) {
    sendcmd(socket,{func:"start"});	// Request data start away then refresh 10 secs
  }
  /** 
    Opens WebSocket, sets default handlers and also implements checks 
    @method openWebSocket
  */  
  function openWebSocket() {	
    var url = KDBCONNECT.config.url;	
    if ((window.hasOwnProperty("WebSocket")) && !websocket){	// Check if WebSocket is enabled in browser and as websocket is initial declared as false
                                  // using ! changes false to true. Once the websocket is true, it will not pass this statement
      try{
        /**
          Displays current status of WebSocket
          
          @event Status message
          @param {String} event ws_connect 
          @param {String} message Connecting
        */
        KDBCONNECT.eventHandler("ws_event","Connecting...");
        websocket = new WebSocket(url);	// GLOBAL - Initialize a websocket using the url 
        websocket.binaryType = 'arraybuffer';	// Required by c.js 
        websocket.onopen=function(){	// What to do when the websocket opens
          console.log("WebSocket opened...");
        /**
          Displays current status of WebSocket
          
          @event Status message
          @param {String} event ws_onopen 
          @param {String} message Connected         
        */          
          KDBCONNECT.eventHandler("ws_event","Connected");
          start(websocket);
        };
        websocket.onclose=function(){	// What to do when the websocket closes
          websocket = false;	// Resets websocket back to false
          KDBCONNECT.core.websocket = websocket;
          console.log("Websocket closed...");
          /**
            Displays current status of WebSocket
            
            @event Status message
            @param {String} event ws_onclose 
            @param {String} message Connected                    
          */                
          KDBCONNECT.eventHandler("ws_event","Disconnected");
        };
        websocket.onmessage=function(e){	// What to do when a message is recieved
          if(e.data){	
            var data,name,alldata;
            data = JSON.parse(deserialize(e.data));
            window.devdata  = data;
            name = data.name;
            alldata = data.data;              
            /**
              Where the WebSocket data is handled
              
              @event Data Handler
              @param {String} type Type of data e.g. "start"
              @param {Array} alldata Data from WebSocket
            */                       
            KDBCONNECT.dataHandler(name,alldata);// Send dataHandler serialized data
          }
        };
        websocket.onerror=function(err){
          console.log("ERROR - Please start up kdb+ process or check your connection url");
          /**
            Display error information
            
            @event error websocket.onerror
            @param {String} event error 
            @param {String} message err.data                
           */                
          KDBCONNECT.eventHandler("error",err.data);
        };
        KDBCONNECT.core.websocket = websocket;
      } catch(err){
        console.log("ERROR - Websocket could not be opened");
        /**
          Display error information
          
          @event error openWebSocket
          @param {String} event error 
          @param {String} message err.data        
         */                        
        KDBCONNECT.eventHandler("error",err.data);
        return false;
      }
    }else{
      KDBCONNECT.eventHandler("error",'Browser does not support WebSockets, please visit <a href="http://browsehappy.com/">Browse Happy</a> and upgrade to a HTML5 enabled browser.');
      return false;
    }
  }
  /** 
    Closes WebSocket
    @method closeWebSocket
  */  
  function closeWebSocket() {	
    try{
      websocket.onclose = function (){ return false;}; // disable onclose handler first
      websocket.close();	// Close websocket
    } catch(err){
      /**
        Display error information 
        
        @event error closeWebSocket
        @param {String} event error 
        @param {String} message err.data        
       */                            
      KDBCONNECT.eventHandler("error",err.data);
    }
    console.log("Websocket is closed...");
  }
  /** 
    Adds event listeners to web page that close the WebSocket when the page is closed.
    @method listeners
  */  
  function listeners(){
    // Close WebSocket when page is closed
    if(window.attachEvent) {	
      window.attachEvent('beforeunload', function() {
        KDBCONNECT.core.closeWebSocket();
      });
    }
    else if(window.addEventListener) {
      window.addEventListener('beforeunload', function() {
        KDBCONNECT.core.closeWebSocket();
      }, true);
    }
  }
  /** 
    Starts up script 
    @method init
    @param host {String} Host of kdb+ server 
    @param port {String|Number} Port of kdb+ server
    @param [secureflag=0] {boolean} Whether you want secure WebSocket enabled
  */  
  function init(host,port,secureflag) {	
    // Throw an error if host and port are not entered
    if(host === undefined){ throw ("init - A host must be defined"); }
    if(port === undefined){ throw ("init - A port must be defined"); }
    
    // Change default config settings to those set by user
    secureflag = secureflag === undefined ? 0 : secureflag;
    KDBCONNECT.config.url = (secureflag === 1 ? "wss://" : "ws://") + host + ":" + port;
  
    // Adds event listeners
    listeners();
    
    // Start up WebSocket
    openWebSocket();
  }
  return {	// This part allows you to set what functions can be accessed from outside
    init: init,
    openWebSocket: openWebSocket,
    closeWebSocket: closeWebSocket,
    websocket: websocket,
    sendcmd: sendcmd
  };
}());
