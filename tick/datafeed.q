o:.Q.opt .z.x;

// Gererate fake equity database

// Params
syms:`NOK`YHOO`CSCO`ORCL`AAPL`DELL`IBM;

// Schema
initschema:{[]
 quotes::([]time:`time$();sym:`symbol$();bid:`float$();ask:`float$();bsize:`int$();asize:`int$());
 trades::([]time:`time$();sym:`symbol$();side:`$();price:`float$();size:`int$());
 }

// Utility Functions
rnd:{0.01*floor 100*x};

// Create TAQ database
makedb:{[nq;nt]
 initpxs:syms!20f+count[syms]?30f;
 qts:update px*initpxs sym from update px:1+nq?0.01 from ([]time:`#asc nq?0t;sym:`g#nq?syms);
 qts:select time,sym,bid:rnd px-nq?0.03,ask:rnd px+nq?0.03,bsize:500*1+nq?20,asize:500*1+nq?20 from qts;
 trds:select time,sym,side,price:?[side=`buy;ask-(neg[0.02]+0.01*count[ask]?5);bid-(neg[0.02]+0.01*count[bid]?5)],size:?[side=`buy;asize;bsize]-nt?(distinct 10 xbar til 100) from update side:nt?`buy`sell from qts;
 initschema[];
 update time:.z.T from upsert[`quotes;qts];
 update time:.z.T from upsert[`trades;trds];
 };

h:hopen first "J"$o[`tick];

.z.ts:{makedb[10;10];h(`.u.upd;`quote;quotes);h(`.u.upd;`trade;trades)};
o:.Q.opt .z.x;

// Gererate fake equity database

// Params
syms:`NOK`YHOO`CSCO`ORCL`AAPL`DELL`IBM;

// Schema
initschema:{[]
 quotes::([]time:`time$();sym:`symbol$();bid:`float$();ask:`float$();bsize:`int$();asize:`int$());
 trades::([]time:`time$();sym:`symbol$();side:`$();price:`float$();size:`int$());
 }

// Utility Functions
rnd:{0.01*floor 100*x};

// Create TAQ database
makedb:{[nq;nt]
 initpxs:syms!20f+count[syms]?30f;
 qts:update px*initpxs sym from update px:1+nq?0.01 from ([]time:`#asc nq?0t;sym:`g#nq?syms);
 qts:select time,sym,bid:rnd px-nq?0.03,ask:rnd px+nq?0.03,bsize:500*1+nq?20,asize:500*1+nq?20 from qts;
 trds:select time,sym,side,price:?[side=`buy;ask-(neg[0.02]+0.01*count[ask]?5);bid-(neg[0.02]+0.01*count[bid]?5)],size:?[side=`buy;asize;bsize]-nt?(distinct 10 xbar til 100) from update side:nt?`buy`sell from qts;
 initschema[];
 update time:.z.T from upsert[`quotes;qts];
 update time:.z.T from upsert[`trades;trds];
 };

h:hopen first "J"$o[`tick];

.z.ts:{makedb[10;10];h(`.u.upd;`quote;quotes);h(`.u.upd;`trade;trades)};
