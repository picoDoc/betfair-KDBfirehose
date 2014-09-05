#!/bin/bash
# Requestinator, version 0

# Purpose of this file is to make api calls to the Betfair API-NG
# It will take arguments calling on a function to make a specifc api call.
# Such as get session token, get market data etc.

# Init variables
SESSION_TOKEN=666

# Arguments
args=("$@")

# prints all arguments
#echo $@ 

# prints specific item in argument list
#echo ${args[0]} ${args[1]} ${args[2]}

# Currently only work with first argument
option=${args[0]}

# param to be used in that option
param=${args[1]}


#get session token and set to variable
function getSessionToken(){
  out=$(curl -s -q -k --cert auth/client-2048.crt --key auth/client-2048.key https://identitysso.betfair.com/api/certlogin -d "username=picoDoc&password=gMJ4qBBc" -H "X-Application: pulled torq")
  echo ${out}
  export SESSION_TOKEN=${out}
}

#get latest market data
function getMarketData(){
  out=$(curl -s -X POST --header "Accept: application/json" --header "Content-Type: application/json" --header "X-Application: pulled torq" --header "X-Authentication:   $SESSION_TOKEN" --data "[ { \"jsonrpc\": \"2.0\", \"method\": \"SportsAPING/v1.0/listEventTypes\", \"params\": { \"filter\": {} }, \"id\": 1 } ]" https://api.betfair.com/exchange/betting/json-rpc/v1)
  echo ${out}
}

# switch case statement for sorting out what functions to run
case $option in 
  getSessionToken)
    # run getSessionToken function
    # return any json
    getSessionToken
    set SESSION_TOKEN
    ;;
  getMarketData)
    # run getMarketData function
    # return any json
    getMarketData
    echo "getMarketData empty at the moment"
    ;;
  *)
    # default help stuff
    echo "HELP AND USAGE INFO"
    echo ""
    echo "sh requestinator.sh getSessionToken -- gets session token"
    echo "sh requestinator.sh getMarketData -- gets market data"
esac
