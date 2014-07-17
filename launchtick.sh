# Load the environment
. ./setenv.sh

# launch the tickerplant, rdb, hdb
q tickerplant.q exampleschema hdb -p 13010 </dev/null >$KDBLOG/torqtp.txt 2>&1 &
q torq.q :13010 :13012 -load tick/r.q -p 13011 </dev/null >$KDBLOG/torqrdb.txt 2>&1 &
q torq.q -load hdb/exampleschema -p 13012 </dev/null >$KDBLOG/torqhdb.txt 2>&1 &

# launch the requestor and feedhandler processes
q torq.q -load code/processes/requestor.q -p 13008 </dev/null >$KDBLOG/torqrequestor.txt 2>&1 &
q torq.q -load code/processes/feedhandler.q -p 13009 </dev/null >$KDBLOG/torqfeedhandler.txt 2>&1 &

# launch the discovery service
q torq.q -load code/processes/discovery.q -p 1337 </dev/null >$KDBLOG/torqdiscovery.txt 2>&1 &

# launch the gateway
q torq.q -load code/processes/gateway.q -p 13020 -.servers.CONNECTIONS hdb rdb </dev/null >$KDBLOG/torqgw.txt 2>&1 &

# launch the monitor
q torq.q -load code/processes/monitor.q -p 20001 </dev/null >$KDBLOG/torqmonitor.txt 2>&1 &

# launch housekeeping
#q torq.q -load code/processes/housekeeping.q -p 20003 </dev/null >$KDBLOG/torqhousekeeping.txt 2>&1 &

# to kill it, run this:
#q torq.q -load code/processes/kill.q -p 20000 -.servers.CONNECTIONS rdb tickerplant hdb gateway housekeeping monitor discovery </dev/null >$KDBLOG/torqkill.txt 2>&1 &
