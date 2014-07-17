/-Defines the default variables for the file alerter process


\d .fa

inputcsv:getenv[`KDBCONFIG],"/filealerter.csv"

polltime:0D00:00:10

alreadyprocessed:getenv[`KDBCONFIG],"/filealerterprocessed"

skipallonstart:0b