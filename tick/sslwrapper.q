/- Usage 
/- q sslwrapper RawMessageFile TickerplantHost:Port NumberOfUpdatePerTimer [-t N] 
\l ssl1final.q
upd:{f[x;y]}

/- Get the name of the raw file and the number of updates per second from the command line
rawfile:hsym`$.z.x 0
updatespertimer:0^"I"$.z.x 2        

/- read in the raw file
r:get rawfile

/- Create a timer function to process some messages
.z.ts:{value each updatespertimer#r; r::updatespertimer _ r;}
if[0=system"t"; system"t 1000"];
