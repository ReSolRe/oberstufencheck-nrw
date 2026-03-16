/*
 * OberstufenCheck NRW – Schullaufbahnplaner für die gymnasiale Oberstufe
 * © 2026 Gregor Steinke. Alle Rechte vorbehalten.
 * Lizenziert unter AGPL-3.0. Kommerzielle Nutzung nur mit schriftlicher Genehmigung.
 * https://www.gnu.org/licenses/agpl-3.0.html
 */
import { useState, useMemo, useCallback, useEffect } from "react";

/* ═══════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════ */
const FAE=[
  {id:"D",n:"Deutsch",af:"I",tp:"pfl",h:3,lk:1,a1:1},{id:"E",n:"Englisch",af:"I",tp:"ffs",h:3,lk:1,a1:1},
  {id:"F",n:"Französisch",af:"I",tp:"ffs",h:3,lk:1,a1:1},{id:"L",n:"Latein",af:"I",tp:"ffs",h:3,lk:1,a1:1},
  {id:"S",n:"Spanisch",af:"I",tp:"ffs",h:3,lk:1,a1:1},{id:"S0",n:"Spanisch (neu)",af:"I",tp:"nfs",h:4,lk:0,a1:0},
  {id:"F0",n:"Franz. (neu)",af:"I",tp:"nfs",h:4,lk:0,a1:0},{id:"L0",n:"Latein (neu)",af:"I",tp:"nfs",h:4,lk:0,a1:0},
  {id:"KU",n:"Kunst",af:"I",tp:"ku",h:3,lk:1,a1:0},{id:"MU",n:"Musik",af:"I",tp:"ku",h:3,lk:1,a1:0},
  {id:"LI",n:"Literatur",af:"I",tp:"kua",h:3,lk:0,a1:0,qo:1},
  {id:"GE",n:"Geschichte",af:"II",tp:"gw",h:3,lk:1},{id:"SW",n:"Sozialwiss.",af:"II",tp:"gw",h:3,lk:1},
  {id:"EK",n:"Geographie",af:"II",tp:"gw",h:3,lk:1},{id:"PA",n:"Erziehungswiss.",af:"II",tp:"gw",h:3,lk:1},
  {id:"PL",n:"Philosophie",af:"II",tp:"gw",h:3,lk:1},{id:"PS",n:"Psychologie",af:"II",tp:"gw",h:3},
  {id:"M",n:"Mathematik",af:"III",tp:"pfl",h:3,lk:1,a1:1},{id:"BI",n:"Biologie",af:"III",tp:"nw",h:3,lk:1,a1:1},
  {id:"PH",n:"Physik",af:"III",tp:"nw",h:3,lk:1,a1:1},{id:"CH",n:"Chemie",af:"III",tp:"nw",h:3,lk:1,a1:1},
  {id:"IF",n:"Informatik",af:"III",tp:"nt",h:3,lk:1},{id:"TC",n:"Technik",af:"III",tp:"nt",h:3},{id:"EL",n:"Ernährungsl.",af:"III",tp:"nt",h:3},
  {id:"KR",n:"Kath. Rel.",af:"X",tp:"rel",h:3,lk:1},{id:"ER",n:"Ev. Rel.",af:"X",tp:"rel",h:3,lk:1},
  {id:"SP",n:"Sport",af:"X",tp:"sp",h:3},
];
const FM={};FAE.forEach(function(f){FM[f.id]=f;});
const isFS=function(f){return f&&(f.tp==="ffs"||f.tp==="nfs");};
const isRel=function(f){return f&&f.tp==="rel";};
const QH=["Q1.1","Q1.2","Q2.1","Q2.2"];const HJ=["EF.1","EF.2","Q1.1","Q1.2","Q2.1","Q2.2"];
const VERSION="v2.0.0";const VDATE="2026-03-09";
// Minimal default: Fächer die JEDE Schule anbietet
const DEFVF=["D","E","F","M","KU","MU","GE","SW","PL","BI","SP","KR","ER"];
// Default LK-Angebot (typische Schule)
const DEFLK=["D","E","M","BI","GE","PA"];

/* ═══════════════════════════════════════════════
   THEME
   ═══════════════════════════════════════════════ */
const T={
  pri:"#6d28d9",priL:"#f3f0ff",priD:"#4c1d95",
  acc:"#0ea5e9",accL:"#e0f2fe",
  bg:"#f8f8fb",card:"#ffffff",bdr:"#e5e4ea",
  tx:"#18152b",txL:"#78758a",
  err:"#dc2626",errBg:"#fef2f2",
  warn:"#d97706",warnBg:"#fffbeb",
  ok:"#059669",okBg:"#ecfdf5",
  infoBg:"#f5f3ff",infoC:"#5b21b6",
};
const AFS={I:"#f3f0ff",II:"#fefce8",III:"#ecfdf5",X:"#f4f4f6"};

/* ═══════════════════════════════════════════════
   GLOBAL STYLES (injected once)
   ═══════════════════════════════════════════════ */
const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Outfit',sans-serif;background:${T.bg};color:${T.tx};-webkit-font-smoothing:antialiased;line-height:1.5}
button,select,input{font-family:inherit}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}

/* ── PRINT ── */
.printOnly{display:none!important}
@media print{
  .noP{display:none!important}
  .printOnly{display:block!important}
  .prG,.expertGrid{grid-template-columns:1fr!important}
  body{background:#fff!important;color:#000!important;font-size:11pt}
  .matrixWrap{border:2px solid #333!important;border-radius:0!important;overflow:visible!important}
  .matrixWrap table{min-width:0!important;font-size:10pt!important;width:100%!important}
  .matrixWrap th{background:#ddd!important;color:#000!important;padding:4px!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .matrixWrap td{padding:3px!important;border:1px solid #aaa!important}
  .matrixWrap td div{height:auto!important;color:#000!important}
  .wizCard,.hdrBar{box-shadow:none!important;border:none!important}
  a{color:#000!important;text-decoration:none!important}
  button{display:none!important}
  h1,h2,h3{color:#000!important}
}
@page{margin:12mm 15mm;size:A4}

/* ── RESPONSIVE ── */
.expertGrid{display:grid;grid-template-columns:1fr 220px;gap:14px;max-width:1080px;margin:0 auto;padding:14px 16px}
.wizWrap{max-width:600px;margin:0 auto;padding:20px 16px}
.wizCard{background:${T.card};border-radius:16px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,.05);border:1px solid ${T.bdr};animation:fadeUp .25s ease;margin-bottom:14px}
.landGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.selGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;max-width:420px}
.matrixWrap{overflow-x:auto;border-radius:12px;border:1px solid ${T.bdr};-webkit-overflow-scrolling:touch}
.matrixWrap table{min-width:420px}
.hdrBar{padding:10px 18px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
.chipGrid{display:flex;flex-wrap:wrap;gap:6px}
button,label{transition:all .15s ease}
.chipGrid>button:hover{transform:translateY(-1px);box-shadow:0 2px 8px rgba(0,0,0,.08)}
.chipGrid>button:active{transform:scale(.97)}

@media(max-width:768px){
  .expertGrid{grid-template-columns:1fr!important;padding:10px 12px;gap:10px}
  .wizWrap{padding:14px 10px}
  .wizCard{padding:16px;border-radius:14px}
  .landGrid{grid-template-columns:1fr}
  .selGrid{grid-template-columns:1fr;max-width:100%}
  .hdrBar{padding:10px 14px}
  .chipGrid{gap:6px}
  .chipGrid>button{width:100%!important;text-align:left!important}
}
@media(max-width:480px){
  .wizWrap{padding:12px 8px}
  .wizCard{padding:14px;border-radius:14px}
  .matrixWrap table{font-size:10px!important;min-width:360px}
  .matrixWrap th,.matrixWrap td{padding:1px!important}
  .hdrBar{padding:8px 12px;flex-wrap:wrap;gap:6px}
}
`;

/* ═══════════════════════════════════════════════
   VALIDATION
   ═══════════════════════════════════════════════ */
function doVal(bl,lk,ab,vf,pr){
  var E=[],W=[];
  var b=function(f,h){return!!(bl[f]&&bl[f][h]);};
  var bEF=function(f){return b(f,"EF.1")&&b(f,"EF.2");};
  var bQ=function(f){return QH.every(function(h){return b(f,h);});};
  var bAll=function(f){return HJ.every(function(h){return b(f,h);});};
  var vt=function(tp){return vf.filter(function(id){return FM[id]&&FM[id].tp===tp;});};
  var aEF=function(ids){return ids.some(function(id){return bEF(id);});};
  var ffs=vt("ffs"),nfs=vt("nfs"),nw=vt("nw"),gw=vt("gw"),rel=vt("rel");
  var nwt=vf.filter(function(id){var f=FM[id];return f&&(f.tp==="nw"||f.tp==="nt");});
  if(!bEF("D"))E.push("Deutsch muss in der gesamten EF belegt werden → Tab EF");
  if(!aEF(ffs))E.push("Eine fortgeführte Fremdsprache muss in der EF belegt werden → Tab EF");
  if(!bEF("M"))E.push("Mathe muss in der gesamten EF belegt werden → Tab EF");
  if(!aEF(vf.filter(function(id){return id==="KU"||id==="MU";})))E.push("Kunst oder Musik muss in der EF belegt werden → Tab EF");
  if(!aEF(gw))E.push("Ein Fach aus dem Bereich Gesellschaftswiss. muss in der EF belegt werden → Tab EF");
  if(!aEF(nw))E.push("Eine Naturwissenschaft muss in der EF belegt werden → Tab EF");
  if(!aEF(rel.concat(vf.indexOf("PL")>=0?["PL"]:[])))E.push("Religion oder Philosophie muss in der EF belegt werden → Tab EF");
  if(!bEF("SP"))E.push("Sport muss in der gesamten EF belegt werden → Tab EF");
  var z2fs=ffs.filter(function(id){return bEF(id);}).length>=2||nfs.some(function(id){return bEF(id);});
  var z2nt=nwt.filter(function(id){return bEF(id);}).length>=2;
  // Doppelte Sprachen
  [["F","F0","Französisch"],["L","L0","Latein"],["S","S0","Spanisch"]].forEach(function(p){if(bEF(p[0])&&bEF(p[1]))E.push(p[2]+" kann nicht gleichzeitig fortgeführt und neu einsetzend belegt werden → Tab EF");});
  if(!z2fs&&!z2nt)E.push("Du brauchst eine 2. Fremdsprache oder ein 2. NaWi/Tech-Fach (Schwerpunkt-Regel) → Tab Schule/EF");
  if(pr&&!pr.hat2FSSekI&&!nfs.some(function(id){return bAll(id);}))E.push("Deine neu einsetzende Fremdsprache muss von EF.1 bis Q2.2 durchgehend belegt werden → Tab EF");
  if(pr&&pr.befreitReligion&&bEF("PL")&&!gw.filter(function(id){return id!=="PL";}).some(function(id){return bEF(id);}))E.push("Philosophie als Reli-Ersatz darf nicht dein einziges GW-Fach sein – belege noch ein weiteres → Tab EF");
  if(!bQ("D"))E.push("Deutsch muss auch in der gesamten Q-Phase belegt werden → Tab Q1+Q2");
  if(!ffs.some(function(id){return bQ(id);})&&!nfs.some(function(id){return bQ(id);}))E.push("Mindestens eine Fremdsprache muss die gesamte Q-Phase durchlaufen → Tab Q1+Q2");
  if(!bQ("M"))E.push("Mathe muss auch in der gesamten Q-Phase belegt werden → Tab Q1+Q2");
  if(!nw.some(function(id){return bQ(id);}))E.push("Eine Naturwissenschaft muss die gesamte Q-Phase durchlaufen → Tab Q1+Q2");
  if(!bQ("SP"))E.push("Sport muss in der gesamten Q-Phase belegt werden → Tab Q1+Q2");
  var gwF=gw.filter(function(id){return bEF(id)&&bQ(id);});
  if(gwF.length===0&&gw.some(function(id){return bEF(id);}))E.push("Dein GW-Fach aus der EF muss auch in der Q-Phase weiterbelegt werden → Tab Q1+Q2");
  var geOK=bAll("GE")||(bEF("GE")&&b("GE","Q1.1")&&b("GE","Q1.2"));
  var swOK=bAll("SW")||(bEF("SW")&&b("SW","Q1.1")&&b("SW","Q1.2"));
  if(!geOK&&!(b("GE","Q2.1")&&b("GE","Q2.2")))W.push("Du brauchst noch einen Zusatzkurs Geschichte in Q2 (2 Halbjahre) → Tab Q1+Q2");
  if(!swOK&&!(b("SW","Q2.1")&&b("SW","Q2.2")))W.push("Du brauchst noch einen Zusatzkurs SoWi in Q2 (2 Halbjahre) → Tab Q1+Q2");
  if(lk.lk1&&FM[lk.lk1]&&!FM[lk.lk1].a1)E.push(FM[lk.lk1].n+" kann nicht 1. LK sein – nur Deutsch, Mathe, fortgef. FS oder NaWi → Tab Q1+Q2");
  if(lk.lk1&&!bEF(lk.lk1))W.push((FM[lk.lk1]?FM[lk.lk1].n:"LK1")+": Sollte schon in der EF belegt sein → Tab EF");
  if(lk.lk2&&!bEF(lk.lk2))W.push((FM[lk.lk2]?FM[lk.lk2].n:"LK2")+": Sollte schon in der EF belegt sein → Tab EF");
  if(lk.lk2&&FM[lk.lk2]&&FM[lk.lk2].tp==="nfs")E.push("Eine neu einsetzende Fremdsprache kann nicht als LK gewählt werden → Tab Q1+Q2");
  var ai=[lk.lk1,lk.lk2,ab.a3,ab.a4].filter(Boolean);
  if(ai.length===4){
    var afs=ai.map(function(id){return FM[id];}).filter(Boolean);
    if(!afs.some(function(f){return f.af==="I"&&(f.id==="D"||isFS(f));}))E.push("Aufgabenfeld I fehlt: Deutsch oder eine Fremdsprache muss Abifach sein → Tab Abi");
    if(!afs.some(function(f){return f.af==="II"||isRel(f);}))E.push("Aufgabenfeld II fehlt: Ein GW-Fach oder Religion muss Abifach sein → Tab Abi");
    if(!afs.some(function(f){return f.af==="III";}))E.push("Aufgabenfeld III fehlt: Mathe oder eine NaWi muss Abifach sein → Tab Abi");
    var dmfs=ai.filter(function(id){return id==="D"||id==="M"||isFS(FM[id]);});
    if(dmfs.length<2)E.push("Mindestens 2 deiner 4 Abifächer müssen Deutsch, Mathe oder eine Fremdsprache sein → Tab Abi");
    if(ai.some(function(id){return isRel(FM[id]);})&&ai.indexOf("SP")>=0)E.push("Religion und Sport dürfen nicht gleichzeitig Abiturfächer sein → Tab Abi");
    [ab.a3,ab.a4].filter(Boolean).forEach(function(id){if(!bEF(id))E.push((FM[id]?FM[id].n:id)+" muss ab der EF belegt sein, wenn du es als Abiturfach willst → Tab EF");});
  }
  var h2a=function(ids,hjs){return ids.some(function(id){for(var i=0;i<hjs.length-1;i++){if(b(id,hjs[i])&&b(id,hjs[i+1]))return true;}return false;});};
  var kuAll=vf.filter(function(id){return id==="KU"||id==="MU"||id==="LI";});
  if(!h2a(kuAll,QH))E.push("In der Q-Phase musst du 2 Halbjahre lang Kunst, Musik oder Literatur belegen → Tab Q1+Q2");
  var relPh=rel.concat(pr&&pr.befreitReligion&&vf.indexOf("PL")>=0?["PL"]:[]);
  if(!h2a(relPh,QH))W.push("Religion oder Philosophie sollte mindestens 2 Halbjahre in der Q-Phase belegt werden → Tab Q1+Q2");
  var stdHJ=function(hj){return vf.filter(function(id){return b(id,hj);}).reduce(function(s,id){var isLK=QH.indexOf(hj)>=0&&(lk.lk1===id||lk.lk2===id);return s+(isLK?5:(FM[id]?FM[id].h:3));},0);};
  HJ.forEach(function(hj){var s=stdHJ(hj);var tab=hj.indexOf("EF")===0?" → Tab EF":" → Tab Q1+Q2";if(s>0&&s>36)W.push(hj+": "+s+" Wochenstunden – das sind "+(s-36)+" zu viel (max. 36)"+tab);if(s>0&&s<32)W.push(hj+": Erst "+s+" Wochenstunden – du brauchst mindestens 32"+tab);});
  // Lücken-Erkennung: Pflichtfächer und Abiturfächer dürfen keine Halbjahre aussetzen
  var checkGap=function(id,label){
    var belegt=HJ.map(function(hj){return b(id,hj);});
    var first=-1,last=-1;
    for(var g=0;g<6;g++){if(belegt[g]){if(first<0)first=g;last=g;}}
    if(first>=0&&last>first){for(var g2=first+1;g2<last;g2++){if(!belegt[g2]){W.push((FM[id]?FM[id].n:id)+": Lücke in "+HJ[g2]+" – "+label+" → Tab "+(HJ[g2].indexOf("EF")===0?"EF":"Q1+Q2"));}}}
  };
  // Pflichtfächer auf Lücken prüfen
  ["D","M","SP"].forEach(function(id){checkGap(id,"Pflichtfach muss durchgehend belegt sein");});
  [lk.lk1,lk.lk2,ab.a3,ab.a4].filter(Boolean).forEach(function(id){checkGap(id,"Abiturfach muss durchgehend belegt sein");});
  return{errors:E,warnings:W};
}

/* ═══════════════════════════════════════════════
   WIZARD HELPERS
   ═══════════════════════════════════════════════ */
function buildPlan(a){
  var bl={},ids=["D","M","SP"];
  ["fortgefFS","kunstmusik","naturwissenschaft","gesellschaftswiss"].forEach(function(k){if(a[k])ids.push(a[k]);});
  if(a.religion==="PL_ersatz")ids.push("PL");else if(a.religion)ids.push(a.religion);
  if(a.weitereFaecher)ids=ids.concat(a.weitereFaecher);
  ids=ids.filter(function(v,i,ar){return ar.indexOf(v)===i&&FM[v];});
  ids.forEach(function(id){bl[id]={};var onlyQ=FM[id]&&FM[id].qo;HJ.forEach(function(h){if(!onlyQ||QH.indexOf(h)>=0)bl[id][h]=true;});});
  var lk={lk1:a.lk1||"",lk2:a.lk2||""};
  [lk.lk1,lk.lk2].forEach(function(id){if(id&&FM[id]){if(!bl[id])bl[id]={};QH.forEach(function(h){bl[id][h]=true;});}});
  if(a.gesellschaftswiss!=="GE"&&ids.indexOf("GE")<0){if(!bl.GE)bl.GE={};bl.GE["Q2.1"]=true;bl.GE["Q2.2"]=true;}
  if(a.gesellschaftswiss!=="SW"&&ids.indexOf("SW")<0){if(!bl.SW)bl.SW={};bl.SW["Q2.1"]=true;bl.SW["Q2.2"]=true;}
  return{bl:bl,lk:lk,ab:{a3:a.abi3||"",a4:a.abi4||""}};
}
function chkSchw(ids){
  var fs=ids.filter(function(id){var f=FM[id];return f&&(f.tp==="ffs"||f.tp==="nfs");}).length;
  var nt=ids.filter(function(id){var f=FM[id];return f&&(f.tp==="nw"||f.tp==="nt");}).length;
  return{sp:fs>=2,nw:nt>=2,ok:fs>=2||nt>=2,bd:fs>=2&&nt>=2};
}

/* ═══════════════════════════════════════════════
   UI COMPONENTS
   ═══════════════════════════════════════════════ */
function Tag(p){return <span style={{display:"inline-flex",alignItems:"center",padding:"2px 9px",borderRadius:20,fontSize:10.5,fontWeight:600,color:p.c||T.tx,backgroundColor:p.bg||T.priL,whiteSpace:"nowrap"}}>{p.children}</span>;}

function Hint(p){return <div style={{padding:"10px 12px",borderRadius:10,backgroundColor:T.infoBg,fontSize:12,color:T.infoC,marginTop:10,lineHeight:1.6,borderLeft:"3px solid "+T.pri}}>{"💡 "}{p.children}</div>;}

function Warn(p){return <div style={{padding:"10px 12px",borderRadius:10,backgroundColor:T.warnBg,fontSize:12,color:T.warn,marginTop:10,borderLeft:"3px solid "+T.warn}}>{"⚠️ "}{p.children}</div>;}

function ErrBox(p){return <div style={{padding:"12px 14px",borderRadius:12,backgroundColor:T.errBg,fontSize:12.5,color:T.err,marginTop:12,borderLeft:"3px solid "+T.err}}>{"❌ "}{p.children}</div>;}

function Chips(p){
  var sel=p.selected;
  return <div className="chipGrid">
    {p.options.map(function(o){
      var a=p.multi?(sel||[]).indexOf(o.id)>=0:sel===o.id;
      return <button key={o.id} onClick={function(){p.onSelect(o.id);}}
        style={{padding:"12px 18px",borderRadius:14,border:"2px solid "+(a?T.pri:"transparent"),
          backgroundColor:a?T.priL:"#f4f2fa",cursor:"pointer",textAlign:"left",
          transition:"all .2s",boxShadow:a?"0 2px 12px rgba(108,43,217,.15)":"none",
          transform:a?"scale(1.02)":"scale(1)"}}>
        <div style={{fontSize:14,fontWeight:a?700:500,color:a?T.pri:T.tx}}>
          {p.multi?(a?"☑ ":"☐ "):a?"◉ ":"○ "}{o.label}
        </div>
        {o.desc&&<div style={{fontSize:11,color:T.txL,marginTop:3}}>{o.desc}</div>}
      </button>;
    })}
  </div>;
}

function Matrix(p){
  var vf=p.vf,bl=p.bl,lk=p.lk,ab=p.ab,hjs=p.hjs,tog=p.onToggle,showAbi=p.showAbi;
  var locked=p.locked||[];
  var kl=p.klausur||{}; // {fachId: true} for schriftliche Fächer
  var grp={I:[],II:[],III:[],X:[]};
  vf.forEach(function(id){if(FM[id]&&!(FM[id].qo&&hjs.every(function(h){return h.indexOf("EF")===0;})))grp[FM[id].af].push(FM[id]);});
  var stdH=function(hj){return vf.filter(function(id){return bl[id]&&bl[id][hj];}).reduce(function(s,id){return s+(QH.indexOf(hj)>=0&&(lk.lk1===id||lk.lk2===id)?5:(FM[id]?FM[id].h:3));},0);};
  var cntH=function(hj){return vf.filter(function(id){return bl[id]&&bl[id][hj];}).length;};
  // Determine S/M for a cell
  var getType=function(fid,hj){
    var isQ=QH.indexOf(hj)>=0;
    var isLK=isQ&&(lk.lk1===fid||lk.lk2===fid);
    if(isLK)return "LK";
    // Zusatzkurs: GE/SW in Q2 ohne vorherige Belegung in EF
    if(isQ&&(fid==="GE"||fid==="SW")){
      var inEF=bl[fid]&&(bl[fid]["EF.1"]||bl[fid]["EF.2"]);
      var inQ1=bl[fid]&&(bl[fid]["Q1.1"]||bl[fid]["Q1.2"]);
      if(!inEF&&!inQ1&&(hj==="Q2.1"||hj==="Q2.2"))return "ZK";
    }
    // Schriftlich: Pflicht-Klausurfächer, Abi, explizit gewählt
    var isAbi=isQ&&(ab.a3===fid||ab.a4===fid);
    if(isAbi)return "S";
    if(kl[fid])return "S";
    if(fid==="D"||fid==="M")return "S";
    if(FM[fid]&&(FM[fid].tp==="ffs"||FM[fid].tp==="nfs"))return "S";
    return "M";
  };
  return <div className="matrixWrap"><table style={{borderCollapse:"collapse",width:"100%",fontSize:12}}>
    <thead><tr style={{background:"linear-gradient(135deg,"+T.pri+","+T.priD+")"}}>
      <th style={{padding:5,fontSize:10,fontWeight:700,color:"#fff",width:24}}>AF</th>
      <th style={{padding:5,fontSize:10,fontWeight:700,color:"#fff",minWidth:90,textAlign:"left"}}>Fach</th>
      {hjs.map(function(h){return <th key={h} style={{padding:5,fontSize:10,fontWeight:700,color:"#fff",minWidth:44,textAlign:"center"}}>{h}</th>;})}
      {showAbi&&<th style={{padding:5,fontSize:10,fontWeight:700,color:"#fff",width:28}}>Abi</th>}
    </tr></thead>
    <tbody>{["I","II","III","X"].map(function(af){return grp[af].map(function(f,i){
      var aN=lk.lk1===f.id?"1.":lk.lk2===f.id?"2.":ab.a3===f.id?"3.":ab.a4===f.id?"4.":"";
      return <tr key={f.id} style={{backgroundColor:i%2===0?AFS[af]:AFS[af]+"88",transition:"background .15s"}}>
        {i===0&&<td rowSpan={grp[af].length} style={{padding:2,fontWeight:700,fontSize:9,color:T.txL,textAlign:"center",verticalAlign:"middle",backgroundColor:AFS[af],borderRight:"2px solid "+T.bdr}}>{af!=="X"?af:"–"}</td>}
        <td style={{padding:"2px 4px",borderBottom:"1px solid "+T.bdr,fontSize:11.5,fontWeight:500}}>{f.n}</td>
        {hjs.map(function(hj){
          var isLK=QH.indexOf(hj)>=0&&(lk.lk1===f.id||lk.lk2===f.id);
          var bel=bl[f.id]&&bl[f.id][hj];
          var fullIdx=HJ.indexOf(hj);
          var blocked=false;
          if(!bel&&!isLK&&fullIdx>0){
            var warBelegt=false;var abgewaehlt=false;
            for(var gi=0;gi<fullIdx;gi++){
              if(bl[f.id]&&bl[f.id][HJ[gi]])warBelegt=true;
              else if(warBelegt){abgewaehlt=true;break;}
            }
            if(warBelegt&&abgewaehlt)blocked=true;
          }
          var tp=bel?getType(f.id,hj):"";
          var isLocked=locked.indexOf(f.id)>=0;
          var label=!bel?(blocked?"✕":"–"):tp==="LK"?"LK":tp==="ZK"?"ZK":String(isLK?5:(f.h||3));
          var clr=!bel?(blocked?"#e8b4b4":"#ccc"):tp==="LK"?T.pri:tp==="ZK"?T.acc:T.ok;
          return <td key={hj} style={{padding:0,borderBottom:"1px solid "+T.bdr,textAlign:"center",cursor:isLK||blocked||locked.indexOf(f.id)>=0?"default":"pointer",backgroundColor:blocked?"#f8f0f0":""}} onClick={function(){if(!isLK&&!blocked&&locked.indexOf(f.id)<0&&tog)tog(f.id,hj);}}>
            <div style={{height:22,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:bel?700:400,color:clr,fontSize:blocked?9:11,userSelect:"none",transition:"all .15s"}}>{label}</div>
          </td>;})}
        {showAbi&&<td style={{padding:2,borderBottom:"1px solid "+T.bdr,textAlign:"center",fontWeight:700,fontSize:11,color:aN?T.pri:"#ddd"}}>{aN||"–"}</td>}
      </tr>;});})}
      <tr style={{background:T.priL+"66"}}><td colSpan={2} style={{padding:3,fontWeight:700,fontSize:10,textAlign:"right"}}>Kurse</td>
        {hjs.map(function(hj){var c=cntH(hj);return <td key={hj} style={{padding:2,textAlign:"center",fontWeight:600,fontSize:10,color:T.txL}}>{c||"–"}</td>;})}
        {showAbi&&<td style={{padding:2,textAlign:"center",fontWeight:600,fontSize:10,color:T.txL}}></td>}
      </tr>
      <tr style={{background:T.priL+"44"}}><td colSpan={2} style={{padding:3,fontWeight:700,fontSize:10,textAlign:"right"}}>Wstd.</td>
        {hjs.map(function(hj){var s=stdH(hj);return <td key={hj} style={{padding:2,textAlign:"center",fontWeight:700,fontSize:11,color:s>=32&&s<=36?T.ok:s>0?T.warn:T.txL}}>{s||"–"}</td>;})}
        {showAbi&&<td/>}
      </tr>
    </tbody></table></div>;
}

/* ═══════════════════════════════════════════════
   HELP OVERLAY
   ═══════════════════════════════════════════════ */
function HelpOverlay(p){
  if(!p.show)return null;
  var qa=[
    {q:"Was bedeutet durchgehend belegen?",a:"Das Fach muss in jedem Halbjahr des angegebenen Zeitraums ohne Unterbrechung belegt werden. Einmal abgewählt = endgültig weg."},
    {q:"Muss ich mich sofort für sprachlich oder naturwiss. entscheiden?",a:"Nein! Du kannst in der EF beides belegen und dich erst in der Q-Phase festlegen. Der Schwerpunkt ergibt sich automatisch aus deiner Fächerwahl."},
    {q:"Was sind LK und GK?",a:"Leistungskurse (LK) haben 5 Wochenstunden und werden vertieft unterrichtet. Grundkurse (GK) haben 3 Stunden. Du wählst 2 LKs ab der Q-Phase."},
    {q:"Was bedeutet 2-aus-3?",a:"Mindestens 2 deiner 4 Abiturfächer müssen Deutsch, Mathematik oder eine Fremdsprache sein."},
    {q:"Was sind Aufgabenfelder (AF)?",a:"AF I = sprachlich-literarisch-künstlerisch (Deutsch, Fremdsprachen, Kunst, Musik). AF II = gesellschaftswissenschaftlich (Geschichte, SoWi, Erdkunde usw.). AF III = mathematisch-naturwissenschaftlich (Mathe, Bio, Physik, Chemie, Info). Alle 3 AF müssen in deinen Abiturfächern vorkommen."},
    {q:"Was sind Zusatzkurse?",a:"Wer Geschichte oder SoWi nicht bis Q2 belegt, muss im letzten Jahr einen Zusatzkurs (2 Halbjahre) im jeweils anderen Fach belegen."},
    {q:"Wie viele Stunden pro Woche?",a:"Ziel: ~34 Wochenstunden pro Halbjahr (Toleranz: 32–36). In der Q-Phase zählen LKs mit 5 statt 3 Stunden."},
    {q:"Kann ich ein abgewähltes Fach wieder aufnehmen?",a:"Nein. Kurse in der Oberstufe sind Folgekurse (§6 Abs. 6). Ein einmal abgewähltes Fach kann nicht wieder belegt werden. Ausnahmen: Literatur und Zusatzkurse GE/SW, die erst in der Q-Phase starten."},
    {q:"Was passiert mit meinen Daten?",a:"Alles bleibt in deinem Browser. Es werden keine Daten an einen Server geschickt. Du kannst deinen Plan als JSON-Datei speichern und später wieder laden."},
    {q:"Kann ich Religion und Philosophie gleichzeitig belegen?",a:"Nein – an den allermeisten Schulen liegen Religion und Philosophie auf dem gleichen Zeitslot. Du wählst eines von beiden."},
    {q:"Muss ich Geschichte und SoWi belegen?",a:"Ja, beide Fächer müssen in deiner Oberstufe vorkommen. Entweder als reguläres Fach (mind. bis Ende Q1) oder als Zusatzkurs in Q2. Wer z.B. Geschichte als GW-Fach wählt, braucht nur noch ZK SoWi in Q2."},
    {q:"Was ist dieses Tool?",a:"Ein kostenloses, unabhängiges Hilfsmittel zur Planung deiner Oberstufe. Es funktioniert auf jedem Gerät – Handy, Tablet, Mac, PC – als plattformunabhängige Alternative zum LuPO des Schulministeriums (nur Windows). Die App ersetzt aber nicht die offizielle Beratung durch deine Schule."},
  ];
  return <div style={{position:"fixed",inset:0,zIndex:9999,backgroundColor:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={p.onClose}>
    <div style={{backgroundColor:T.card,borderRadius:20,padding:28,maxWidth:580,width:"100%",maxHeight:"85vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.15)"}} onClick={function(e){e.stopPropagation();}}>
      <h2 style={{fontSize:22,fontWeight:700,color:T.pri,marginBottom:4}}>Hilfe & Begriffe</h2>
      <p style={{fontSize:13,color:T.txL,marginBottom:16}}>Die wichtigsten Fragen zur Oberstufenplanung.</p>
      {qa.map(function(item,i){return <div key={i} style={{marginBottom:12,padding:"12px 14px",borderRadius:12,backgroundColor:i%2===0?"#f8f6ff":"#f0f8ff"}}>
        <div style={{fontSize:14,fontWeight:600,color:T.tx,marginBottom:4}}>{item.q}</div>
        <div style={{fontSize:13,color:T.txL,lineHeight:1.6}}>{item.a}</div>
      </div>;})}
      <p style={{fontSize:11,color:T.txL,marginTop:12}}>Basierend auf der APO-GOSt NRW (Stand April 2025). Bei konkreten Fragen wende dich an deine Beratungslehrkraft.</p>
      <button onClick={p.onClose} style={{marginTop:16,padding:"10px 24px",borderRadius:10,border:"none",backgroundColor:T.pri,color:"#fff",cursor:"pointer",fontSize:14,fontWeight:600,width:"100%"}}>Verstanden</button>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════════
   PRINT HEADER (only visible when printing)
   ═══════════════════════════════════════════════ */
function PrintHeader(p){
  var now=new Date();
  var datum=now.getDate()+"."+(now.getMonth()+1)+"."+now.getFullYear();
  var sc=p.schule||{};
  return <div className="printOnly" style={{marginBottom:16,paddingBottom:12,borderBottom:"2px solid #333"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div>
        <h1 style={{fontSize:18,fontWeight:700,margin:0}}>OberstufenCheck NRW – Belegungsplan</h1>
        <p style={{fontSize:11,color:"#666",margin:"4px 0 0"}}>{sc.name?sc.name+" – ":""}Gymnasiale Oberstufe{sc.jahr?" – SJ "+sc.jahr:""}</p>
      </div>
      <div style={{textAlign:"right",fontSize:11,color:"#666"}}>
        <div>Erstellt: {datum}</div>
        <div>{VERSION}</div>
      </div>
    </div>
    {(p.lk.lk1||p.lk.lk2||p.ab.a3||p.ab.a4)&&<div style={{marginTop:10,padding:8,backgroundColor:"#f5f5f5",borderRadius:4,fontSize:12}}>
      <strong>Prüfungsfächer: </strong>
      {p.lk.lk1&&<span>1. LK: {FM[p.lk.lk1]?FM[p.lk.lk1].n:p.lk.lk1} </span>}
      {p.lk.lk2&&<span>| 2. LK: {FM[p.lk.lk2]?FM[p.lk.lk2].n:p.lk.lk2} </span>}
      {p.ab.a3&&<span>| 3. Fach: {FM[p.ab.a3]?FM[p.ab.a3].n:p.ab.a3} </span>}
      {p.ab.a4&&<span>| 4. Fach: {FM[p.ab.a4]?FM[p.ab.a4].n:p.ab.a4}</span>}
      {p.schw&&<span> | {p.schw.bd?"Offen":p.schw.sp?"Sprachlich":p.schw.nw?"Naturwiss.":"?"}</span>}
    </div>}
    {p.errors!==undefined&&<div style={{marginTop:6,fontSize:11}}>
      {p.errors===0?<span style={{color:"#16a34a"}}>✓ Alle Pflichtbedingungen erfüllt</span>:<span style={{color:"#dc2626"}}>✗ {p.errors} Regel-Fehler – Plan prüfen</span>}
    </div>}
    <p style={{marginTop:6,fontSize:10,color:"#999"}}>Alle Angaben ohne Gewähr. Bitte mit der Oberstufenkoordination abstimmen. · © 2026 · AGPL-3.0</p>
  </div>;
}

/* ═══════════════════════════════════════════════
   INFO OVERLAY (Impressum / Datenschutz)
   ═══════════════════════════════════════════════ */
function InfoOverlay(p){
  if(!p.page) return null;
  var content={
    impressum:<div>
      <h2 style={{fontSize:20,fontWeight:700,color:T.pri,marginBottom:12}}>Impressum</h2>
      <p style={{fontSize:14,lineHeight:1.8,color:T.tx}}>
        <strong>Verantwortlich für den Inhalt:</strong><br/>
        Gregor Steinke<br/>
        E-Mail: kursplaner.nrw@gmail.com
      </p>
      <p style={{fontSize:13,color:T.txL,marginTop:12,lineHeight:1.7}}>
        Nicht-kommerzielles Open-Source-Projekt zur Unterstützung
        von Schüler:innen bei der Oberstufenplanung.
        Entwickelt als plattformunabhängige Alternative zum
        LuPO-Planungstool des Schulministeriums (nur Windows).
        Dieses Tool ersetzt nicht die offizielle Beratung
        durch die Oberstufenkoordination der Schule.
        Alle Angaben ohne Gewähr.
      </p>
      <p style={{fontSize:13,color:T.txL,marginTop:12,lineHeight:1.7}}>
        <strong>Lizenz:</strong> © 2026 Gregor Steinke. Quellcode lizenziert unter{" "}
        <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener" style={{color:T.pri}}>AGPL-3.0</a>.
        Kommerzielle Nutzung nur mit schriftlicher Genehmigung des Urhebers.
      </p>
    </div>,
    datenschutz:<div>
      <h2 style={{fontSize:20,fontWeight:700,color:T.pri,marginBottom:12}}>Datenschutz</h2>
      <p style={{fontSize:14,lineHeight:1.8,color:T.tx}}><strong>Kurzfassung:</strong> Diese App speichert keine personenbezogenen Daten.</p>
      <p style={{fontSize:13,color:T.txL,marginTop:12,lineHeight:1.7}}>
        <strong>Hosting:</strong> Die Website wird über GitHub Pages (GitHub Inc., USA) bereitgestellt.
        Beim Aufruf der Seite werden technisch notwendige Verbindungsdaten (u.a. IP-Adresse)
        von GitHub verarbeitet. Details: <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener" style={{color:T.pri}}>GitHub Privacy Statement</a>.
      </p>
      <p style={{fontSize:13,color:T.txL,marginTop:8,lineHeight:1.7}}>
        <strong>Lokale Verarbeitung:</strong> Alle Eingaben (Fächerwahl, Belegungsplan) werden
        ausschließlich in deinem Browser verarbeitet und gespeichert. Es werden keine Daten
        an einen Server übermittelt.
      </p>
      <p style={{fontSize:13,color:T.txL,marginTop:8,lineHeight:1.7}}>
        <strong>Cookies:</strong> Diese App verwendet keine Cookies und kein Tracking.
      </p>
      <p style={{fontSize:13,color:T.txL,marginTop:8,lineHeight:1.7}}>
        <strong>Schriftarten:</strong> Die verwendete Schriftart (Outfit) wird lokal ausgeliefert.
        Es werden keine externen Dienste wie Google Fonts eingebunden.
      </p>
      <p style={{fontSize:13,color:T.txL,marginTop:8,lineHeight:1.7}}>
        <strong>Externe Links:</strong> Diese Seite enthält Links zu externen Websites
        (z.B. PayPal für Spenden). Beim Klick auf diese Links gelten die
        Datenschutzbestimmungen des jeweiligen Anbieters.
      </p>
    </div>
  }[p.page];
  return <div style={{position:"fixed",inset:0,zIndex:9999,backgroundColor:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={p.onClose}>
    <div style={{backgroundColor:T.card,borderRadius:20,padding:28,maxWidth:560,width:"100%",maxHeight:"80vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.15)"}} onClick={function(e){e.stopPropagation();}}>
      {content}
      <button onClick={p.onClose} style={{marginTop:20,padding:"10px 24px",borderRadius:10,border:"none",backgroundColor:T.pri,color:"#fff",cursor:"pointer",fontSize:14,fontWeight:600,width:"100%"}}>Schließen</button>
    </div>
  </div>;
}

function AppFooter(p){
  return <div className="noP" style={{marginTop:24,paddingTop:16,borderTop:"1px solid "+T.bdr,textAlign:"center"}}>
    {p.showFeedback&&<div style={{marginBottom:8}}>
      <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:6}}>
        <a href="mailto:kursplaner.nrw@gmail.com?subject=OberstufenCheck%20Feedback" style={{padding:"8px 18px",borderRadius:10,backgroundColor:"#f4f2fa",color:T.pri,textDecoration:"none",fontSize:13,fontWeight:600,display:"inline-flex",alignItems:"center",gap:6}}>💬 Feedback geben</a>
        <a href="https://paypal.me/gregorsteinke" target="_blank" rel="noopener" style={{padding:"8px 18px",borderRadius:10,backgroundColor:"#fff7ed",color:"#c2410c",textDecoration:"none",fontSize:13,fontWeight:600,display:"inline-flex",alignItems:"center",gap:6}}>☕ Projekt unterstützen</a>
      </div>
      <p style={{fontSize:11,color:T.txL,lineHeight:1.4}}>Kostenlos und werbefrei.</p>
    </div>}
    <p style={{fontSize:11,color:T.txL,marginBottom:6}}>Alle Angaben ohne Gewähr. Ersetzt nicht die Beratung durch deine Schule.</p>
    <div style={{display:"flex",gap:16,justifyContent:"center",fontSize:12,color:T.txL,flexWrap:"wrap"}}>
      <button onClick={function(){p.onInfo("impressum");}} style={{background:"none",border:"none",color:T.txL,cursor:"pointer",fontSize:12,textDecoration:"underline"}}>Impressum</button>
      <button onClick={function(){p.onInfo("datenschutz");}} style={{background:"none",border:"none",color:T.txL,cursor:"pointer",fontSize:12,textDecoration:"underline"}}>Datenschutz</button>
      <span>© 2026</span>
      <span>{VERSION} · AGPL-3.0</span>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════ */
export default function App(){
  var _m=useState("choose"),mode=_m[0],setMode=_m[1];
  var _vf=useState(DEFVF),vf=_vf[0],setVf=_vf[1];
  var _vfLK=useState(DEFLK),vfLK=_vfLK[0],setVfLK=_vfLK[1];
  var _pr=useState({bildungsgang:"G9",hat2FSSekI:true,hatLatein:false,lateinAb:"",befreitReligion:false}),pr=_pr[0],setPr=_pr[1];
  var _schule=useState({name:"",jahr:"2025/2026",stand:""}),schule=_schule[0],setSchule=_schule[1];
  var _bl=useState({}),bl=_bl[0],setBl=_bl[1];
  var _lk=useState({lk1:"",lk2:""}),lk=_lk[0],setLk=_lk[1];
  var _ab=useState({a3:"",a4:""}),ab=_ab[0],setAb=_ab[1];
  var _et=useState(0),eTab=_et[0],setETab=_et[1];
  var _ws=useState(0),ws=_ws[0],setWs=_ws[1];
  var _wa=useState({}),wa=_wa[0],setWa=_wa[1];
  var _pg=useState(null),infoPage=_pg[0],setInfoPage=_pg[1];
  var _help=useState(false),showHelp=_help[0],setShowHelp=_help[1];
  var _upd=useState(false),showUpdate=_upd[0],setShowUpdate=_upd[1];
  // PWA: online/offline
  var _online=useState(true),online=_online[0],setOnline=_online[1];
  var _installEvt=useState(null),installEvt=_installEvt[0],setInstallEvt=_installEvt[1];
  useEffect(function(){
    var on=function(){setOnline(true);};var off=function(){setOnline(false);};
    window.addEventListener("online",on);window.addEventListener("offline",off);
    setOnline(navigator.onLine);
    var bp=function(e){e.preventDefault();setInstallEvt(e);};
    window.addEventListener("beforeinstallprompt",bp);
    // Cache/Update detection
    if("serviceWorker" in navigator){
      navigator.serviceWorker.ready.then(function(reg){
        reg.addEventListener("updatefound",function(){
          var nw=reg.installing;
          if(nw){nw.addEventListener("statechange",function(){if(nw.state==="installed"&&navigator.serviceWorker.controller){setShowUpdate(true);}});}
        });
      });
    }
    return function(){window.removeEventListener("online",on);window.removeEventListener("offline",off);window.removeEventListener("beforeinstallprompt",bp);};
  },[]);
  var doInstall=function(){if(installEvt){installEvt.prompt();installEvt.userChoice.then(function(){setInstallEvt(null);});}};

  var sA=function(k,v){setWa(function(p){var n=Object.assign({},p);n[k]=v;return n;});};
  var togM=function(k,id){var c=wa[k]||[];sA(k,c.indexOf(id)>=0?c.filter(function(x){return x!==id;}):c.concat([id]));};
  var resetW=function(){setWs(0);setWa({});};

  var tog=useCallback(function(fid,hj){
    setBl(function(p){
      var n=Object.assign({},p);
      if(!n[fid])n[fid]={};
      n[fid]=Object.assign({},n[fid]);
      var hjIdx=HJ.indexOf(hj);
      var wasOn=!!n[fid][hj];

      if(wasOn){
        // ABWAHL: Alle Folge-Halbjahre auch abwählen (weg ist weg)
        for(var i=hjIdx;i<HJ.length;i++){
          n[fid][HJ[i]]=false;
        }
      }else{
        // ANWAHL: Prüfe Vorgänger
        var jemalsBelegt=false;
        var letztesBelegtes=-1;
        for(var j=0;j<HJ.length;j++){if(n[fid][HJ[j]]){jemalsBelegt=true;letztesBelegtes=j;}}
        var f=FM[fid];

        if(jemalsBelegt){
          // War schon mal belegt → nur direkt anschließend erlaubt
          if(hjIdx!==letztesBelegtes+1) return n;
          n[fid][hj]=true;
        }else{
          // Erstbelegung: Startpunkt bestimmen
          var startIdx=0; // Default: EF.1
          if(f&&f.qo){
            // Q-only Fächer (Literatur): Start ab Q1.1
            startIdx=HJ.indexOf("Q1.1");
          }else if((fid==="GE"||fid==="SW")&&hjIdx>=HJ.indexOf("Q2.1")){
            // ZK: GE/SW ab Q2.1 ohne EF → nur Q2-HJs füllen
            startIdx=HJ.indexOf("Q2.1");
          }
          // Vom Startpunkt bis zum angeklickten HJ füllen
          if(hjIdx<startIdx) return n; // Klick vor erlaubtem Start ignorieren
          for(var k=startIdx;k<=hjIdx;k++){
            n[fid][HJ[k]]=true;
          }
        }
      }
      return n;
    });
  },[]);
  var eBl=useMemo(function(){var b2={};Object.keys(bl).forEach(function(k){b2[k]=Object.assign({},bl[k]);});[lk.lk1,lk.lk2].forEach(function(id){if(!id)return;if(!b2[id])b2[id]={};QH.forEach(function(h){b2[id][h]=true;});});return b2;},[bl,lk]);
  // Klausurfach-Map: welche Fächer sind schriftlich?
  var klMap=useMemo(function(){
    var m={};
    // Pflicht: D, M, alle FS
    m.D=true;m.M=true;
    vf.forEach(function(id){if(FM[id]&&(FM[id].tp==="ffs"||FM[id].tp==="nfs"))m[id]=true;});
    // LKs sind immer schriftlich
    if(lk.lk1)m[lk.lk1]=true;if(lk.lk2)m[lk.lk2]=true;
    // Abiturfächer sind schriftlich
    if(ab.a3)m[ab.a3]=true;if(ab.a4)m[ab.a4]=true;
    // Wizard: gewählte GW/NaWi Klausurfächer
    if(wa.klGW)m[wa.klGW]=true;if(wa.klNW)m[wa.klNW]=true;
    return m;
  },[vf,lk,ab,wa.klGW,wa.klNW]);
  // Gefilterte Fächerliste für Matrix
  var vfX=useMemo(function(){
    var hatKR=eBl.KR&&HJ.some(function(h){return eBl.KR[h];});
    var hatER=eBl.ER&&HJ.some(function(h){return eBl.ER[h];});
    var hatPL=eBl.PL&&HJ.some(function(h){return eBl.PL[h];});
    var hatRel=hatKR||hatER;
    return vf.filter(function(id){
      if(!FM[id])return false;
      // Befreit → KR/ER ausblenden, PL immer zeigen
      if(pr.befreitReligion){
        if(FM[id].tp==="rel")return false;
        return true;
      }
      // Religion belegt → PL nicht wählbar
      if(hatRel&&id==="PL")return false;
      // PL belegt → Religion nicht wählbar
      if(hatPL&&FM[id].tp==="rel")return false;
      // Nur eine Religion: KR↔ER exklusiv
      if(hatKR&&id==="ER")return false;
      if(hatER&&id==="KR")return false;
      return true;
    });
  },[vf,pr.befreitReligion,eBl]);
  var val=useMemo(function(){return doVal(eBl,lk,ab,vf,pr);},[eBl,lk,ab,vf,pr]);
  // Schwerpunkt für Experten-Modus (basierend auf belegten Fächern in EF)
  var schwE=useMemo(function(){
    var belegteEF=vf.filter(function(id){return eBl[id]&&(eBl[id]["EF.1"]||eBl[id]["EF.2"]);});
    return chkSchw(belegteEF);
  },[vf,eBl]);
  var schwLabel=function(s){return s.bd?"Beide Schwerpunkte offen":s.sp?"Sprachlicher Schwerpunkt":s.nw?"Naturwiss. Schwerpunkt":"Schwerpunkt fehlt";};
  var schwColor=function(s){return s.ok?s.bd?T.acc:T.pri:T.err;};
  var schwBg=function(s){return s.ok?s.bd?"#cffafe":T.priL:T.errBg;};

  var gewIds=useMemo(function(){var ids=["D","M","SP"];["fortgefFS","kunstmusik","naturwissenschaft","gesellschaftswiss"].forEach(function(k){if(wa[k])ids.push(wa[k]);});if(wa.religion==="PL_ersatz")ids.push("PL");else if(wa.religion)ids.push(wa.religion);if(wa.weitereFaecher)ids=ids.concat(wa.weitereFaecher);return ids.filter(function(v,i,a2){return a2.indexOf(v)===i&&FM[v];});},[wa]);
  var schw=useMemo(function(){return chkSchw(gewIds);},[gewIds]);
  var stunden=useMemo(function(){return gewIds.reduce(function(s,id){return s+(FM[id]?FM[id].h:3);},0);},[gewIds]);
  // Q-Phase Stunden: LKs haben 5h statt 3h → +2 pro LK
  var stundenQ=useMemo(function(){
    var base=stunden;
    if(wa.lk1&&gewIds.indexOf(wa.lk1)>=0)base+=2;
    if(wa.lk2&&gewIds.indexOf(wa.lk2)>=0)base+=2;
    return base;
  },[stunden,wa.lk1,wa.lk2,gewIds]);

  // Validation helpers
  var VALID_IDS=FAE.map(function(f){return f.id;});
  var isValidId=function(id){return typeof id==="string"&&VALID_IDS.indexOf(id)>=0;};
  var isValidIdList=function(arr){return Array.isArray(arr)&&arr.every(isValidId);};
  var isStr=function(v){return typeof v==="string";};
  var isObj=function(v){return v&&typeof v==="object"&&!Array.isArray(v);};
  var sanitizeBl=function(bl){
    if(!isObj(bl))return{};
    var clean={};
    Object.keys(bl).forEach(function(k){
      if(!isValidId(k))return;
      if(!isObj(bl[k]))return;
      clean[k]={};
      HJ.forEach(function(h){if(bl[k][h]===true)clean[k][h]=true;});
    });
    return clean;
  };
  var sanitizeLk=function(lk){
    if(!isObj(lk))return{lk1:"",lk2:""};
    return{lk1:isValidId(lk.lk1)?lk.lk1:"",lk2:isValidId(lk.lk2)?lk.lk2:""};
  };
  var sanitizeAb=function(ab){
    if(!isObj(ab))return{a3:"",a4:""};
    return{a3:isValidId(ab.a3)?ab.a3:"",a4:isValidId(ab.a4)?ab.a4:""};
  };
  var sanitizeSchule=function(s){
    if(!isObj(s))return{name:"",jahr:"",stand:""};
    return{name:isStr(s.name)?s.name.slice(0,100):"",jahr:isStr(s.jahr)?s.jahr.slice(0,20):"",stand:isStr(s.stand)?s.stand.slice(0,20):""};
  };

  // Export with Blob cleanup
  var expJSON=function(data){
    var blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    var url=URL.createObjectURL(blob);
    var a2=document.createElement("a");a2.href=url;a2.download="schullaufbahn.json";a2.click();
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
  };

  // Plan import with validation
  var impJSON=function(ev){
    var file=ev.target.files&&ev.target.files[0];if(!file)return;
    if(file.size>500000){alert("Datei zu groß (max. 500 KB).");return;}
    var r=new FileReader();r.onload=function(e){
      try{
        var d=JSON.parse(e.target.result);
        if(!isObj(d)){alert("Ungültiges Format.");return;}
        if(d.bl)setBl(sanitizeBl(d.bl));
        if(d.lk)setLk(sanitizeLk(d.lk));
        if(d.ab)setAb(sanitizeAb(d.ab));
        if(d.vf&&isValidIdList(d.vf))setVf(d.vf);
        if(d.vfLK&&isValidIdList(d.vfLK))setVfLK(d.vfLK);
        if(d.pr&&isObj(d.pr))setPr(function(old){return{
          bildungsgang:d.pr.bildungsgang==="G8"?"G8":"G9",
          hat2FSSekI:!!d.pr.hat2FSSekI,
          hatLatein:!!d.pr.hatLatein,
          lateinAb:isStr(d.pr.lateinAb)?d.pr.lateinAb:"",
          befreitReligion:!!d.pr.befreitReligion
        };});
        if(d.schule)setSchule(sanitizeSchule(d.schule));
        setMode("expert");
      }catch(err){alert("Ungültige Datei: "+err.message);}
    };r.readAsText(file);
    if(ev.target)ev.target.value="";
  };

  // Schulprofil Export with Blob cleanup
  var expSchule=function(){
    var now=new Date();var datum=now.getDate()+"."+(now.getMonth()+1)+"."+now.getFullYear();
    var data={typ:"schulprofil",v:VERSION,schule:Object.assign({},schule,{stand:datum}),vf:vf,vfLK:vfLK,exportiert:datum};
    var name=(schule.name||"Schule").replace(/[^a-zA-Z0-9äöüÄÖÜß]/g,"_").slice(0,50);
    var blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    var url=URL.createObjectURL(blob);
    var a2=document.createElement("a");a2.href=url;a2.download="schulprofil_"+name+".json";a2.click();
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
  };

  // Schulprofil import with validation
  var impSchule=function(ev){
    var file=ev.target.files&&ev.target.files[0];if(!file)return;
    if(file.name.toLowerCase().endsWith(".lpo")){alert("Das ist eine LuPO-Datei (.lpo).\n\nDieses Tool verwendet ein eigenes JSON-Format für Schulprofile. Das Schulprofil kann im Experten-Modus unter \"Schule\" exportiert werden.\n\nDie Beratungslehrkraft kann das Schulprofil einmal erstellen und an alle Schüler:innen weitergeben.");if(ev.target)ev.target.value="";return;}
    if(file.size>500000){alert("Datei zu groß (max. 500 KB).");return;}
    var r=new FileReader();r.onload=function(e){
      try{
        var d=JSON.parse(e.target.result);
        if(!isObj(d)){alert("Ungültiges Format. Erwartet wird eine JSON-Datei (.json), die mit OberstufenCheck exportiert wurde.");return;}
        if(d.typ!=="schulprofil"){alert("Das ist kein Schulprofil.\n\nWenn du einen gespeicherten Belegungsplan laden willst, nutze den Button \"Gespeicherten Plan laden\" auf der Startseite oder im Experten-Modus.");return;}
        if(d.vf&&isValidIdList(d.vf))setVf(d.vf);else{alert("Schulprofil enthält ungültige Fächer.");return;}
        if(d.vfLK&&isValidIdList(d.vfLK))setVfLK(d.vfLK);
        if(d.schule)setSchule(sanitizeSchule(d.schule));
      }catch(err){alert("Die Datei konnte nicht gelesen werden.\n\nErwartet wird eine JSON-Datei (.json), die mit OberstufenCheck exportiert wurde – keine LuPO-Datei (.lpo) oder andere Formate.");}
    };r.readAsText(file);
    if(ev.target)ev.target.value="";
  };

  var Btn=function(p){return <button onClick={p.onClick} disabled={p.disabled} style={{padding:(p.big?"14px 28px":"10px 20px"),borderRadius:14,border:p.outline?"2px solid "+T.bdr:"none",backgroundColor:p.disabled?"#e0dce8":p.outline?"transparent":p.color||T.pri,color:p.outline?T.tx:"#fff",cursor:p.disabled?"default":"pointer",fontSize:p.big?15:13,fontWeight:700,transition:"all .2s",boxShadow:!p.outline&&!p.disabled?"0 4px 14px rgba(108,43,217,.2)":"none",letterSpacing:".01em"}}>{p.children}</button>;};

  /* ════════ LANDING ════════ */
  if(mode==="choose") return (
    <div style={{minHeight:"100vh",background:"linear-gradient(170deg,#f5f3ff 0%,#f8f8fb 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{CSS}</style>
      {showUpdate&&<div style={{position:"fixed",top:0,left:0,right:0,zIndex:9998,padding:"10px 16px",background:"linear-gradient(135deg,#06b6d4,#0891b2)",color:"#fff",textAlign:"center",fontSize:13,fontWeight:600,animation:"slideDown .3s ease",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
        🔄 Neue Version verfügbar!
        <button onClick={function(){window.location.reload();}} style={{padding:"4px 14px",borderRadius:8,border:"2px solid #fff",backgroundColor:"transparent",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:600}}>Jetzt aktualisieren</button>
      </div>}
      <div style={{maxWidth:560,width:"100%",textAlign:"center",animation:"fadeUp .5s ease"}}>
        <div style={{fontSize:44,marginBottom:6}}>🎓</div>
        <h1 style={{fontSize:28,fontWeight:800,background:"linear-gradient(135deg,"+T.pri+",#7c3aed)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:6}}>OberstufenCheck NRW</h1>
        <p style={{color:T.txL,fontSize:16,marginBottom:4,fontWeight:400}}>Schullaufbahnplaner für die gymnasiale Oberstufe</p>
        <p style={{color:T.txL,fontSize:12,marginBottom:12,fontWeight:400,lineHeight:1.5}}>Fächerwahl, Leistungskurse & Abiturfächer planen · APO-GOSt-Regelprüfung · Auf jedem Gerät</p>
        <button onClick={function(){setShowHelp(true);}} style={{marginBottom:28,padding:"6px 16px",borderRadius:20,border:"1px solid "+T.bdr,backgroundColor:T.card,color:T.txL,cursor:"pointer",fontSize:12,fontWeight:500}}>❓ Hilfe & Begriffe</button>

        <div style={{display:"grid",gap:12}}>
          <button onClick={function(){setMode("wizard");resetW();}}
            style={{padding:20,borderRadius:16,border:"none",background:"linear-gradient(135deg,"+T.pri+",#7c3aed)",cursor:"pointer",textAlign:"left",boxShadow:"0 8px 32px rgba(108,43,217,.2)",transition:"transform .2s",color:"#fff"}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <span style={{fontSize:36}}>🧭</span>
              <div>
                <div style={{fontSize:18,fontWeight:700}}>Schritt für Schritt planen</div>
                <div style={{fontSize:13,opacity:0.85,marginTop:2,fontWeight:400}}>Wir führen dich durch alle Entscheidungen</div>
              </div>
            </div>
          </button>

          <div className="landGrid">
            <button onClick={function(){setMode("expert");}}
              style={{padding:18,borderRadius:16,border:"2px solid "+T.bdr,backgroundColor:T.card,cursor:"pointer",textAlign:"left",transition:"all .2s"}}>
              <div style={{fontSize:24,marginBottom:4}}>📊</div>
              <div style={{fontSize:14,fontWeight:700,color:T.tx}}>Direkt bearbeiten</div>
              <div style={{fontSize:11,color:T.txL,marginTop:2}}>Für Fortgeschrittene</div>
            </button>
            <label style={{padding:18,borderRadius:16,border:"2px solid "+T.bdr,backgroundColor:T.card,cursor:"pointer",textAlign:"left",transition:"all .2s",display:"block"}}>
              <div style={{fontSize:24,marginBottom:4}}>📂</div>
              <div style={{fontSize:14,fontWeight:700,color:T.tx}}>Gespeicherten Plan laden</div>
              <div style={{fontSize:11,color:T.txL,marginTop:2}}>Vorherigen Plan öffnen</div>
              <input type="file" accept=".json" onChange={impJSON} style={{display:"none"}}/>
            </label>
          </div>
        </div>

        {schule.name&&<div style={{marginTop:12,padding:"10px 16px",borderRadius:12,backgroundColor:"#ecfdf5",fontSize:13,color:T.ok,textAlign:"center",border:"1px solid #bbf7d0"}}>🏫 {schule.name}{schule.jahr?" – "+schule.jahr:""}{schule.stand?" ("+schule.stand+")":""}</div>}
        <label style={{display:"block",marginTop:schule.name?8:14,textAlign:"center",cursor:"pointer"}}>
          <span style={{fontSize:12,color:T.txL,textDecoration:"underline"}}>🏫 Fächerangebot deiner Schule laden</span>
          <input type="file" accept=".json" onChange={impSchule} style={{display:"none"}}/>
        </label>

        <AppFooter showFeedback onInfo={setInfoPage} />
        {!online&&<div style={{marginTop:12,padding:"10px 16px",borderRadius:12,backgroundColor:"#fef3c7",fontSize:12,color:"#92400e",textAlign:"center"}}>📴 Du bist offline – die App funktioniert trotzdem!</div>}
        {installEvt&&<button onClick={doInstall} style={{marginTop:12,padding:"12px 24px",borderRadius:14,border:"2px dashed "+T.pri,backgroundColor:"transparent",color:T.pri,cursor:"pointer",fontSize:13,fontWeight:600,width:"100%",transition:"all .2s"}}>📲 App installieren</button>}
      </div>
      <InfoOverlay page={infoPage} onClose={function(){setInfoPage(null);}} />
      <HelpOverlay show={showHelp} onClose={function(){setShowHelp(false);}} />
    </div>
  );

  /* ════════ EXPERT ════════ */
  if(mode==="expert"){
    var lkOpt=vf.filter(function(id){return FM[id]&&FM[id].lk&&FM[id].tp!=="nfs"&&vfLK.indexOf(id)>=0;});
    var EL=["Schule","Profil","EF","Q1 + Q2","Abi","Übersicht"];
    var renderET=function(){switch(eTab){
      case 0: return <div>
        <h2 style={{fontSize:16,fontWeight:700,color:T.pri,marginTop:0,marginBottom:8}}>Schulkonfiguration</h2>
        <div style={{display:"grid",gap:8,maxWidth:420,marginBottom:14}}>
          <label style={{fontSize:13}}><div style={{fontWeight:600,marginBottom:3}}>Schulname</div><input value={schule.name} onChange={function(e){setSchule(function(p2){return Object.assign({},p2,{name:e.target.value});});}} placeholder="z.B. Schiller-Gymnasium Köln" style={{width:"100%",padding:"8px 10px",borderRadius:10,border:"1px solid "+T.bdr,fontSize:13}}/></label>
          <label style={{fontSize:13}}><div style={{fontWeight:600,marginBottom:3}}>Schuljahr</div><input value={schule.jahr} onChange={function(e){setSchule(function(p2){return Object.assign({},p2,{jahr:e.target.value});});}} placeholder="2025/2026" style={{width:"100%",padding:"8px 10px",borderRadius:10,border:"1px solid "+T.bdr,fontSize:13}}/></label>
          {schule.stand&&<div style={{fontSize:11,color:T.txL}}>Letzter Import: {schule.stand}</div>}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          <Btn onClick={expSchule}>📤 Fächerangebot als Datei speichern</Btn>
          <label style={{cursor:"pointer"}}><Btn outline>📥 Fächerangebot laden</Btn><input type="file" accept=".json" onChange={impSchule} style={{display:"none"}}/></label>
        </div>
        <Hint>Das Schulprofil (Fächer + LK-Angebot) kann als Datei gespeichert und an Mitschüler:innen weitergegeben werden. Das Angebot kann sich von Jahr zu Jahr ändern.</Hint>
        <div style={{marginTop:14,fontSize:12,fontWeight:700,color:T.txL,marginBottom:6}}>FÄCHERANGEBOT</div>
        {["I","II","III","X"].map(function(af){return <div key={af} style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:T.txL,textTransform:"uppercase",marginBottom:4,letterSpacing:".05em"}}>{af!=="X"?"AF "+af:"Sonstige"}</div><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{FAE.filter(function(f){return f.af===af;}).map(function(f){var act=vf.indexOf(f.id)>=0;return <button key={f.id} onClick={function(){setVf(function(p2){var nv=act?p2.filter(function(x){return x!==f.id;}):p2.concat([f.id]);setVfLK(function(lks){return lks.filter(function(x){return nv.indexOf(x)>=0;});});return nv;});}} style={{padding:"5px 12px",borderRadius:20,border:"2px solid "+(act?T.pri:"transparent"),backgroundColor:act?T.priL:"#f4f2fa",color:act?T.pri:T.txL,cursor:"pointer",fontSize:11.5,fontWeight:act?600:400,transition:"all .15s"}}>{(act?"✓ ":"")+f.n}</button>;})}</div></div>;})}
        <div style={{marginTop:12,paddingTop:10,borderTop:"2px solid "+T.bdr}}><div style={{fontSize:11,fontWeight:700,color:T.txL,marginBottom:6}}>DAVON ALS LK / ABITURFACH</div><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{vf.filter(function(id){return FM[id]&&FM[id].lk;}).map(function(id){var act=vfLK.indexOf(id)>=0;return <button key={id} onClick={function(){setVfLK(function(p2){return act?p2.filter(function(x){return x!==id;}):p2.concat([id]);});}} style={{padding:"4px 10px",borderRadius:14,border:"2px solid "+(act?"#06b6d4":"transparent"),backgroundColor:act?"#cffafe":"#f4f2fa",color:act?"#0e7490":T.txL,cursor:"pointer",fontSize:11,fontWeight:act?600:400}}>{(act?"✓ ":"")+FM[id].n}</button>;})}</div></div>
      </div>;
      case 1: return <div><h2 style={{fontSize:16,fontWeight:700,color:T.pri,marginTop:0,marginBottom:5}}>Dein Profil</h2>
        <p style={{fontSize:12,color:T.txL,marginBottom:10}}>Diese Angaben beeinflussen, welche Regeln geprüft werden.</p>
        <div style={{display:"grid",gap:10,maxWidth:400}}>
        <label style={{fontSize:13,fontWeight:500}}>Bildungsgang: <select value={pr.bildungsgang} onChange={function(e){setPr(function(p2){return Object.assign({},p2,{bildungsgang:e.target.value});});}} style={{padding:"6px 10px",borderRadius:10,border:"1px solid "+T.bdr,fontSize:13,marginLeft:8}}><option value="G9">G9</option><option value="G8">G8</option></select></label>
        <label style={{fontSize:13,display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={pr.hat2FSSekI} onChange={function(e){setPr(function(p2){return Object.assign({},p2,{hat2FSSekI:e.target.checked});});}}/> 2. Fremdsprache in Sek I belegt</label>
        <div style={{fontSize:11,color:T.txL,marginLeft:26,marginTop:-6}}>Wenn nein: Du musst eine neu einsetzende FS (z.B. Spanisch ab EF) durchgehend belegen.</div>
        <label style={{fontSize:13,display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={pr.befreitReligion} onChange={function(e){setPr(function(p2){return Object.assign({},p2,{befreitReligion:e.target.checked});});}}/> Vom Religionsunterricht befreit</label>
        <div style={{fontSize:11,color:T.txL,marginLeft:26,marginTop:-6}}>Wenn ja: Philosophie wird Pflichtfach statt Religion.</div>
      </div></div>;
      case 2: return <div><h2 style={{fontSize:16,fontWeight:700,color:T.pri,marginTop:0,marginBottom:5}}>Einführungsphase (EF)</h2>
        <p style={{fontSize:12,color:T.txL,marginBottom:10}}>Klicke in die Zellen, um Fächer zu belegen oder abzuwählen. Deutsch, Mathe und Sport sind Pflicht und können nicht abgewählt werden.</p>
        <Matrix vf={vfX} bl={eBl} lk={lk} ab={ab} hjs={["EF.1","EF.2"]} onToggle={tog} klausur={klMap} locked={["D","M","SP"]}/></div>;
      case 3: return <div><h2 style={{fontSize:16,fontWeight:700,color:T.pri,marginTop:0,marginBottom:5}}>Qualifikationsphase & LK</h2>
        <p style={{fontSize:12,color:T.txL,marginBottom:10}}>LK = 5 Wochenstunden, ZK = Zusatzkurs. Abgewählte Fächer sind gesperrt (✕).</p>
        <div className="selGrid">
          {[{k:"lk1",l:"1. Leistungskurs",opts:lkOpt.filter(function(id){return FM[id].a1;}),dis:lk.lk2},{k:"lk2",l:"2. Leistungskurs",opts:lkOpt,dis:lk.lk1}].map(function(s){return <label key={s.k} style={{fontSize:13}}><div style={{fontWeight:600,marginBottom:3}}>{s.l}</div><select value={lk[s.k]} onChange={function(e){setLk(function(p2){var n=Object.assign({},p2);n[s.k]=e.target.value;return n;});}} style={{width:"100%",padding:"8px 10px",borderRadius:10,border:"1px solid "+T.bdr,fontSize:13}}><option value="">– wählen –</option>{s.opts.map(function(id){return <option key={id} value={id} disabled={id===s.dis}>{FM[id].n}</option>;})}</select></label>;})}
        </div><Matrix vf={vfX} bl={eBl} lk={lk} ab={ab} hjs={QH} onToggle={tog} klausur={klMap} locked={["D","M","SP"]}/></div>;
      case 4: {var goAll=vf.filter(function(id){return id!==lk.lk1&&id!==lk.lk2&&FM[id]&&FM[id].tp!=="kua";});
        var go3=goAll.filter(function(id){return id!=="SP";}); // Sport nur 4. Abi
        var ai3=[lk.lk1,lk.lk2,ab.a3,ab.a4].filter(Boolean);var abd3={I:ai3.some(function(id){return FM[id]&&FM[id].af==="I"&&(id==="D"||isFS(FM[id]));}),II:ai3.some(function(id){return(FM[id]&&FM[id].af==="II")||isRel(FM[id]);}),III:ai3.some(function(id){return FM[id]&&FM[id].af==="III";})};
        return <div><h2 style={{fontSize:16,fontWeight:700,color:T.pri,marginTop:0,marginBottom:5}}>Abiturfächer</h2>
          <p style={{fontSize:12,color:T.txL,marginBottom:10}}>4 Prüfungsfächer aus allen 3 Aufgabenfeldern (AF I = Sprachen, AF II = Gesellschaftswiss., AF III = Mathe/NaWi). Mindestens 2 davon müssen Deutsch, Mathe oder eine Fremdsprache sein.</p>
          <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}><Tag c="#fff" bg={T.pri}>1.LK: {FM[lk.lk1]?FM[lk.lk1].n:"–"}</Tag><Tag c="#fff" bg={T.pri}>2.LK: {FM[lk.lk2]?FM[lk.lk2].n:"–"}</Tag></div>
          <div className="selGrid">
            <label style={{fontSize:13}}><div style={{fontWeight:600,marginBottom:3}}>3. Abiturfach (schriftl.)</div><select value={ab.a3} onChange={function(e){setAb(function(p2){return Object.assign({},p2,{a3:e.target.value});});}} style={{width:"100%",padding:"8px 10px",borderRadius:10,border:"1px solid "+T.bdr,fontSize:13}}><option value="">– wählen –</option>{go3.filter(function(id){return id!==ab.a4;}).map(function(id){return <option key={id} value={id}>{FM[id]?FM[id].n:id}</option>;})}</select></label>
            <label style={{fontSize:13}}><div style={{fontWeight:600,marginBottom:3}}>4. Abiturfach (mündl.)</div><select value={ab.a4} onChange={function(e){setAb(function(p2){return Object.assign({},p2,{a4:e.target.value});});}} style={{width:"100%",padding:"8px 10px",borderRadius:10,border:"1px solid "+T.bdr,fontSize:13}}><option value="">– wählen –</option>{goAll.filter(function(id){return id!==ab.a3;}).map(function(id){return <option key={id} value={id}>{FM[id]?FM[id].n:id}</option>;})}</select></label>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["I","II","III"].map(function(af){return <Tag key={af} c={abd3[af]?T.ok:T.err} bg={abd3[af]?T.okBg:T.errBg}>{"AF "+af+": "+(abd3[af]?"✓":"✗")}</Tag>;})}</div></div>;}
      case 5: return <div><h2 style={{fontSize:16,fontWeight:700,color:T.pri,marginTop:0,marginBottom:5}}>{"Übersicht"}</h2>
        <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
          <Tag c={schwColor(schwE)} bg={schwBg(schwE)}>{schwLabel(schwE)}</Tag>
          <Tag c={val.errors.length>0?T.err:T.ok} bg={val.errors.length>0?T.errBg:T.okBg}>{val.errors.length===0?"✓ Regelkonform":val.errors.length+" Fehler"}</Tag>
          {lk.lk1&&<Tag c="#fff" bg={T.pri}>LK: {FM[lk.lk1]?FM[lk.lk1].n:"?"} + {FM[lk.lk2]?FM[lk.lk2].n:"?"}</Tag>}
        </div>
        <PrintHeader lk={lk} ab={ab} errors={val.errors.length} schule={schule} schw={schwE}/>
        <Matrix vf={vfX} bl={eBl} lk={lk} ab={ab} hjs={HJ} onToggle={tog} showAbi={true} klausur={klMap} locked={["D","M","SP"]}/>
        <div style={{display:"flex",gap:12,marginTop:8,fontSize:11,color:T.txL,flexWrap:"wrap"}}>
          <span><strong style={{color:T.ok}}>3</strong> = belegt (GK, 3h)</span>
          <span><strong style={{color:T.pri}}>LK</strong> = Leistungskurs (5h)</span>
          <span><strong style={{color:T.acc}}>ZK</strong> = Zusatzkurs</span>
          <span style={{color:"#e8b4b4"}}><strong>✕</strong> = weg ist weg</span>
        </div>
        <Hint>Fächer, die einmal abgewählt wurden, können nicht wieder belegt werden (Folgekurs-Prinzip, §6 Abs. 6). Abwahl gilt automatisch für alle Folge-Halbjahre.</Hint>
        {(val.errors.length>0||val.warnings.length>0)&&<div className="printOnly" style={{marginTop:12,padding:10,border:"1px solid #aaa",borderRadius:4}}>
          <div style={{fontSize:12,fontWeight:700,marginBottom:6}}>Regelprüfung ({val.errors.length} Fehler, {val.warnings.length} Hinweise)</div>
          {val.errors.map(function(msg,i){return <div key={"pe"+i} style={{fontSize:11,marginBottom:2}}>{"✗ "+msg.replace(/ → Tab [\w+\/]+$/,"")}</div>;})}
          {val.warnings.map(function(msg,i){return <div key={"pw"+i} style={{fontSize:11,marginBottom:2,color:"#666"}}>{"⚠ "+msg.replace(/ → Tab [\w+\/]+$/,"")}</div>;})}
        </div>}
        <div className="noP" style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}>
          <Btn onClick={function(){expJSON({v:VERSION,d:VDATE,bl:bl,lk:lk,ab:ab,vf:vf,vfLK:vfLK,pr:pr,schule:schule});}}>💾 Plan als Datei speichern</Btn>
          <Btn outline onClick={function(){setETab(5);setTimeout(function(){window.print();},200);}}>🖨️ Drucken</Btn>
          <label><Btn outline>📂 Gespeicherten Plan laden</Btn><input type="file" accept=".json" onChange={impJSON} style={{display:"none"}}/></label>
        </div></div>;
      default:return null;
    }};
    return <div style={{minHeight:"100vh",backgroundColor:T.bg}}><style>{CSS}</style>
      <div className="hdrBar" style={{background:"linear-gradient(135deg,"+T.pri+","+T.priD+")",color:"#fff"}}>
        <h1 style={{fontSize:16,fontWeight:700,margin:0}}>📊 {schule.name||"Experten-Modus"}</h1>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={function(){setShowHelp(true);}} style={{padding:"5px 12px",borderRadius:8,border:"none",backgroundColor:"rgba(255,255,255,.15)",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:500}}>{"❓ Hilfe"}</button>
          <button onClick={function(){setMode("choose");}} style={{padding:"5px 12px",borderRadius:8,border:"none",backgroundColor:"rgba(255,255,255,.15)",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:500}}>{"← Startseite"}</button>
          <Tag c={schwColor(schwE)} bg={schwBg(schwE)}>{schwE.bd?"⚖️ Offen":schwE.sp?"🌐 Sprachlich":schwE.nw?"🔬 NaWi":"⚠ Schwerpunkt?"}</Tag>
          <Tag c={val.errors.length>0?"#fecaca":"#bbf7d0"} bg={val.errors.length>0?"rgba(239,68,68,.2)":"rgba(16,185,129,.2)"}>{val.errors.length===0?"✓ OK":val.errors.length+" Fehler"}</Tag>
        </div>
      </div>
      <div className="expertGrid prG">
        <div>
          <div className="noP" style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>
            {EL.map(function(l,i){return <button key={i} onClick={function(){setETab(i);}} style={{padding:"6px 14px",borderRadius:10,border:"none",cursor:"pointer",fontSize:12,fontWeight:eTab===i?700:500,backgroundColor:eTab===i?T.pri:T.card,color:eTab===i?"#fff":T.tx,transition:"all .15s",boxShadow:eTab===i?"0 2px 8px rgba(108,43,217,.15)":"none"}}>{l}</button>;})}
          </div>
          <div style={{backgroundColor:T.card,borderRadius:16,padding:16,border:"1px solid "+T.bdr,boxShadow:"0 2px 12px rgba(0,0,0,.03)",animation:"fadeUp .3s ease"}}>{renderET()}</div>
          <div className="noP" style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
            <button onClick={function(){setETab(Math.max(0,eTab-1));}} disabled={eTab===0} style={{padding:"6px 14px",borderRadius:8,border:"1px solid "+T.bdr,backgroundColor:T.card,fontSize:12,cursor:"pointer",opacity:(eTab===0) ? 0.4 : 1}}>{"←"}</button>
            <button onClick={function(){setETab(Math.min(5,eTab+1));}} disabled={eTab===5} style={{padding:"6px 14px",borderRadius:8,border:"none",backgroundColor:T.pri,color:"#fff",fontSize:12,cursor:"pointer",opacity:(eTab===5) ? 0.4 : 1}}>{"→"}</button>
          </div>
        </div>
        <div className="noP" style={{position:"sticky",top:10,alignSelf:"start"}}>
          <div style={{backgroundColor:T.card,borderRadius:14,padding:10,border:"1px solid "+T.bdr,maxHeight:"calc(100vh - 70px)",overflowY:"auto"}}>
            <h3 style={{fontSize:12,fontWeight:700,marginBottom:6,marginTop:0,color:T.pri}}>Regelprüfung</h3>
            {val.errors.length===0&&val.warnings.length===0?<div style={{padding:8,textAlign:"center",color:T.ok,fontSize:12,fontWeight:600}}>{"✓ Alles korrekt!"}</div>:<div>
              {val.errors.map(function(msg,i){var tabMap={"EF":2,"Q1+Q2":3,"Abi":4,"Schule":0,"Profil":1,"Schule/EF":0};var tm=msg.match(/→ Tab ([\w+\/]+)$/);var tabIdx=tm?tabMap[tm[1]]:-1;var clean=msg.replace(/ → Tab [\w+\/]+$/,"");return <div key={"e"+i} onClick={function(){if(tabIdx>=0)setETab(tabIdx);}} style={{padding:"5px 8px",borderRadius:8,backgroundColor:T.errBg,marginBottom:3,fontSize:11,color:T.err,lineHeight:1.4,cursor:tabIdx>=0?"pointer":"default"}}>{"✗ "+clean}{tabIdx>=0&&<span style={{fontSize:9,opacity:0.7,marginLeft:4}}>{"→ "+tm[1]}</span>}</div>;})}
              {val.warnings.map(function(msg,i){var tabMap={"EF":2,"Q1+Q2":3,"Abi":4,"Schule":0,"Profil":1,"Schule/EF":0};var tm=msg.match(/→ Tab ([\w+\/]+)$/);var tabIdx=tm?tabMap[tm[1]]:-1;var clean=msg.replace(/ → Tab [\w+\/]+$/,"");return <div key={"w"+i} onClick={function(){if(tabIdx>=0)setETab(tabIdx);}} style={{padding:"5px 8px",borderRadius:8,backgroundColor:T.warnBg,marginBottom:3,fontSize:11,color:T.warn,lineHeight:1.4,cursor:tabIdx>=0?"pointer":"default"}}>{"⚠ "+clean}{tabIdx>=0&&<span style={{fontSize:9,opacity:0.7,marginLeft:4}}>{"→ "+tm[1]}</span>}</div>;})}
            </div>}
          </div>
        </div>
      </div>
      <div style={{maxWidth:1080,margin:"0 auto",padding:"0 16px"}}><AppFooter showFeedback onInfo={setInfoPage} /></div>
      <InfoOverlay page={infoPage} onClose={function(){setInfoPage(null);}} />
      <HelpOverlay show={showHelp} onClose={function(){setShowHelp(false);}} />
    </div>;
  }

  /* ════════ WIZARD ════════ */
  var STEPS=["schule","willkommen","bildungsgang","fremdsprachen","fortgefFS","religion","kunstmusik","naturwissenschaft","gesellschaftswiss","weitereFaecher","klausurfaecher","leistungskurse","abiturfaecher","ergebnis"];
  var sid=STEPS[ws]||"willkommen";var a=wa;
  var wPlan=null,wVal=null;
  if(sid==="ergebnis"){wPlan=buildPlan(a);wVal=doVal(wPlan.bl,wPlan.lk,wPlan.ab,vf,{hat2FSSekI:!!(a.fremdsprachen&&a.fremdsprachen.length>=2),befreitReligion:a.religion==="PL_ersatz"});}
  var canN=function(){switch(sid){case"schule":case"willkommen":return true;case"bildungsgang":return!!a.bildungsgang;case"fremdsprachen":return a.fremdsprachen&&a.fremdsprachen.length>0;case"fortgefFS":return!!a.fortgefFS;case"religion":return!!a.religion;case"kunstmusik":return!!a.kunstmusik;case"naturwissenschaft":return!!a.naturwissenschaft;case"gesellschaftswiss":return!!a.gesellschaftswiss&&!(a.religion==="PL_ersatz"&&a.gesellschaftswiss==="PL");case"weitereFaecher":return schw.ok;case"klausurfaecher":return!!a.klGW&&!!a.klNW;case"leistungskurse":return!!a.lk1&&!!a.lk2;case"abiturfaecher":return!!a.abi3&&!!a.abi4;default:return false;}};
  var prog=Math.round((ws/(STEPS.length-1))*100);

  function renderWiz(){switch(sid){
    case"schule":return <div><h2 style={{fontSize:20,fontWeight:700,color:T.pri,marginTop:0}}>Deine Schule einrichten {"🏫"}</h2>
        {schule.name?<div style={{padding:"10px 14px",borderRadius:12,backgroundColor:T.okBg,marginBottom:12,fontSize:13,color:T.ok,border:"1px solid #86efac"}}>✓ Schulprofil geladen: <strong>{schule.name}</strong>{schule.jahr?" ("+schule.jahr+")":""}{schule.stand?" – Stand: "+schule.stand:""}</div>
        :<div><p style={{fontSize:13,color:T.txL,marginBottom:5,lineHeight:1.6}}>Die Grundfächer sind schon ausgewählt. Füge hinzu, was deine Schule <strong>zusätzlich</strong> anbietet.</p>
        <Hint>Du hast das Fächerangebot deiner Schule als Datei? Gehe über ← Startseite zurück und lade es dort – dann sind die Fächer deiner Schule automatisch richtig eingestellt.</Hint></div>}
        <div style={{fontSize:12,fontWeight:700,color:T.txL,marginBottom:8,letterSpacing:".03em"}}>FÄCHERANGEBOT</div>
        {["I","II","III","X"].map(function(af){return <div key={af} style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:T.txL,textTransform:"uppercase",marginBottom:4,letterSpacing:".05em"}}>{af!=="X"?"AF "+af:"Sonstige"}</div><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{FAE.filter(function(f){return f.af===af;}).map(function(f){var act=vf.indexOf(f.id)>=0;var isMin=DEFVF.indexOf(f.id)>=0;return <button key={f.id} onClick={function(){setVf(function(p2){var nv=act?p2.filter(function(x){return x!==f.id;}):p2.concat([f.id]);setVfLK(function(lks){return lks.filter(function(x){return nv.indexOf(x)>=0;});});return nv;});}} style={{padding:"6px 14px",borderRadius:20,border:"2px solid "+(act?T.pri:"transparent"),backgroundColor:act?T.priL:"#f4f2fa",color:act?T.pri:T.txL,cursor:"pointer",fontSize:12,fontWeight:act?600:400,transition:"all .15s"}}>{(act?"✓ ":"")+f.n+(isMin&&act?" •":"")}</button>;})}</div></div>;})}
        <div style={{marginTop:16,paddingTop:14,borderTop:"2px solid "+T.bdr}}>
          <div style={{fontSize:12,fontWeight:700,color:T.txL,marginBottom:6,letterSpacing:".03em"}}>ALS LK WÄHLBAR</div>
          <p style={{fontSize:13,color:T.txL,marginBottom:10}}>Nicht jede Schule bietet jedes Fach als LK an. Diese Fächer bietet deine Schule als LK an.</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {vf.filter(function(id){return FM[id]&&FM[id].lk;}).map(function(id){var act=vfLK.indexOf(id)>=0;return <button key={id} onClick={function(){setVfLK(function(p2){return act?p2.filter(function(x){return x!==id;}):p2.concat([id]);});}} style={{padding:"5px 12px",borderRadius:16,border:"2px solid "+(act?"#06b6d4":"transparent"),backgroundColor:act?"#cffafe":"#f4f2fa",color:act?"#0e7490":T.txL,cursor:"pointer",fontSize:11.5,fontWeight:act?600:400}}>{(act?"✓ ":"")+FM[id].n}</button>;})}
          </div>
        </div>
        <Hint>Der Punkt (•) markiert Grundfächer, die jede Schule hat. Frag im Zweifel deine Beratungslehrkraft.</Hint>
        <div style={{marginTop:12,padding:12,borderRadius:12,backgroundColor:"#f8f6ff",border:"1px solid "+T.bdr}}>
          <div style={{fontSize:12,fontWeight:600,color:T.txL,marginBottom:6}}>Schulprofil speichern oder teilen</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
            <input value={schule.name} onChange={function(e){setSchule(function(p2){return Object.assign({},p2,{name:e.target.value});});}} placeholder="Schulname" style={{padding:"6px 10px",borderRadius:8,border:"1px solid "+T.bdr,fontSize:12}}/>
            <input value={schule.jahr} onChange={function(e){setSchule(function(p2){return Object.assign({},p2,{jahr:e.target.value});});}} placeholder="Schuljahr" style={{padding:"6px 10px",borderRadius:8,border:"1px solid "+T.bdr,fontSize:12}}/>
          </div>
          <button onClick={expSchule} style={{padding:"6px 14px",borderRadius:10,border:"1px solid "+T.bdr,backgroundColor:T.card,color:T.txL,cursor:"pointer",fontSize:12,fontWeight:500}}>📤 Schulprofil speichern</button>
        </div></div>;
    case"willkommen":return <div><h2 style={{fontSize:20,fontWeight:700,color:T.pri,marginTop:0}}>Hey! 👋</h2><p style={{fontSize:15,color:T.txL,lineHeight:1.7,marginTop:8}}>In ein paar Minuten hast du deinen Belegungsplan für die Oberstufe.</p><div style={{padding:12,borderRadius:10,backgroundColor:T.infoBg,marginTop:10,fontSize:12.5,color:T.tx,lineHeight:1.6}}>
      <strong>Kurz erklärt – so ist die Oberstufe aufgebaut:</strong><br/>
      Die Oberstufe dauert 3 Jahre: <strong>EF</strong> (Einführungsphase, 1 Jahr) und <strong>Q-Phase</strong> (Qualifikationsphase, 2 Jahre). In der EF probierst du Fächer aus, ab der Q-Phase zählen die Noten fürs Abitur.<br/><br/>
      Du belegst ca. 11–12 Fächer pro Halbjahr. Einige sind Pflicht (Deutsch, Mathe, Sport …), andere wählst du selbst. Ab der Q-Phase wählst du zwei <strong>Leistungskurse</strong> (LK, 5 Stunden/Woche) – der Rest sind Grundkurse (3h).
      </div>
      <Hint>Du musst dich <strong>nicht sofort</strong> festlegen, ob du sprachlich oder naturwiss. willst. Die LK-Wahl wird erst ab Q verbindlich, das 3. und 4. Abiturfach sogar erst in Q2.</Hint></div>;
    case"bildungsgang":return <div><h2 style={{fontSize:20,fontWeight:700,color:T.pri,marginTop:0}}>G8 oder G9?</h2><p style={{fontSize:13,color:T.txL,marginBottom:10}}>Ab wann beginnt bei dir die Oberstufe? Das hängt von deiner Schule ab. Die meisten Gymnasien in NRW sind inzwischen wieder G9. Frag im Zweifel deine Schule.</p><Chips options={[{id:"G9",label:"G9",desc:"Oberstufe ab Klasse 11 (Gymnasium G9 oder Gesamtschule)"},{id:"G8",label:"G8",desc:"Oberstufe ab Klasse 10 (altes Gymnasium-Modell)"}]} selected={a.bildungsgang} onSelect={function(id){sA("bildungsgang",id);}}/></div>;
    case"fremdsprachen":return <div><h2 style={{fontSize:20,fontWeight:700,color:T.pri,marginTop:0}}>Deine Fremdsprachen 🌍</h2><p style={{fontSize:13,color:T.txL,marginBottom:5}}>Welche Sprachen hattest du in der Sek I mindestens 4 Jahre?</p><p style={{fontSize:13,color:T.txL,marginBottom:12}}>Das sind deine <strong>fortgeführten Fremdsprachen</strong> – du kannst sie in der Oberstufe weiterbelegen. Mindestens eine davon musst du bis zum Abitur durchgehend belegen.</p><Chips multi options={vf.filter(function(id){return FM[id]&&FM[id].tp==="ffs";}).map(function(id){return{id:id,label:FM[id].n};})} selected={a.fremdsprachen||[]} onSelect={function(id){togM("fremdsprachen",id);}}/>{a.fremdsprachen&&a.fremdsprachen.indexOf("L")>=0&&<div style={{marginTop:10,padding:10,borderRadius:10,backgroundColor:T.infoBg,fontSize:12.5,color:T.tx,lineHeight:1.6}}>
        <strong>📜 Latinum:</strong> Wenn du Latein mindestens bis Ende der EF belegst, erhältst du das Latinum (kleines Latinum ab Ende EF, großes Latinum bei Fortführung bis Q). Die genauen Voraussetzungen hängen davon ab, seit welcher Klasse du Latein hattest – frag deine Schule!
      </div>}
      {a.fremdsprachen&&a.fremdsprachen.length<2&&<Warn>Ohne 2. Fremdsprache aus der Sek I musst du eine <strong>neu einsetzende Fremdsprache</strong> (z.B. Spanisch ab der EF) von der EF bis Q2 durchgehend belegen.</Warn>}</div>;
    case"fortgefFS":return <div><h2 style={{fontSize:20,fontWeight:700,color:T.pri,marginTop:0}}>Welche Sprache weiterführen?</h2><p style={{fontSize:13,color:T.txL,marginBottom:5}}>Mindestens eine Fremdsprache muss durchgehend bis zum Abi belegt werden.</p><p style={{fontSize:13,color:T.txL,marginBottom:12}}>Wähle hier deine Haupt-Fremdsprache. Im Wahlbereich später kannst du weitere Sprachen dazunehmen – auch eine neue Sprache (z.B. Spanisch ab EF).</p><Chips options={(a.fremdsprachen||[]).map(function(id){return{id:id,label:FM[id]?FM[id].n:id};})} selected={a.fortgefFS} onSelect={function(id){sA("fortgefFS",id);}}/><Hint>Diese Sprache wird automatisch Klausurfach. Wenn du sie als LK oder Abiturfach willst, muss sie fortgeführt (nicht neu einsetzend) sein.</Hint></div>;
    case"religion":return <div><h2 style={{fontSize:20,fontWeight:700,color:T.pri,marginTop:0}}>Religion oder Philosophie</h2><p style={{fontSize:13,color:T.txL,marginBottom:5}}>Wähle genau eines. In der Oberstufe ist eines dieser Fächer Pflicht.</p><p style={{fontSize:13,color:T.txL,marginBottom:12}}>Wer vom Religionsunterricht befreit ist, wählt Philosophie als Ersatzfach. Religion und Philosophie können nicht gleichzeitig belegt werden.</p><Chips options={vf.filter(function(id){return FM[id]&&FM[id].tp==="rel";}).map(function(id){return{id:id,label:FM[id].n};}).concat([{id:"PL_ersatz",label:"Philosophie",desc:"Ersatzfach – vom Religionsunterricht befreit"}])} selected={a.religion} onSelect={function(id){sA("religion",id);}}/><Hint>Philosophie als Ersatzfach zählt gleichzeitig als Gesellschaftswissenschaft, darf dann aber nicht dein einziges GW-Fach sein (§8 Abs. 3). Du brauchst also zusätzlich z.B. Geschichte oder SoWi.</Hint></div>;
    case"kunstmusik":return <div><h2 style={{fontSize:20,fontWeight:700,color:T.pri,marginTop:0}}>Kunst oder Musik? 🎨🎵</h2><p style={{fontSize:13,color:T.txL,marginBottom:5}}>Du musst mindestens eines dieser Fächer in der EF belegen.</p><p style={{fontSize:13,color:T.txL,marginBottom:12}}>In der Q-Phase kannst du stattdessen auch <strong>Literatur</strong> (z.B. Theater, kreatives Schreiben) wählen – das wird automatisch berücksichtigt.</p><Chips options={vf.filter(function(id){return id==="KU"||id==="MU";}).map(function(id){return{id:id,label:FM[id].n};})} selected={a.kunstmusik} onSelect={function(id){sA("kunstmusik",id);}}/></div>;
    case"naturwissenschaft":return <div><h2 style={{fontSize:20,fontWeight:700,color:T.pri,marginTop:0}}>Deine Naturwissenschaft 🔬</h2><p style={{fontSize:13,color:T.txL,marginBottom:5}}>Mindestens ein NaWi-Fach muss von der EF bis zum Abi durchgehend belegt werden.</p><p style={{fontSize:13,color:T.txL,marginBottom:12}}>Im nächsten Schritt kannst du noch weitere NaWi-Fächer dazunehmen – wenn du z.B. zwei NaWi willst (naturwiss. Schwerpunkt).</p><Chips options={vf.filter(function(id){return FM[id]&&FM[id].tp==="nw";}).map(function(id){return{id:id,label:FM[id].n};})} selected={a.naturwissenschaft} onSelect={function(id){sA("naturwissenschaft",id);}}/></div>;
    case"gesellschaftswiss":return <div><h2 style={{fontSize:20,fontWeight:700,color:T.pri,marginTop:0}}>Gesellschaftswissenschaft 🌐</h2>
      <p style={{fontSize:13,color:T.txL,marginBottom:5}}>Ein GW-Fach muss durchgehend bis zum Abi belegt werden.</p>
      <p style={{fontSize:13,color:T.txL,marginBottom:12}}>Gesellschaftswissenschaften (GW) sind Fächer wie Geschichte, SoWi, Erdkunde, Pädagogik oder Philosophie. Wichtig: Geschichte und SoWi müssen <strong>beide</strong> irgendwann in deiner Oberstufe vorkommen – entweder als reguläres Fach oder als Zusatzkurs (ZK) in Q2.</p>
      <Chips options={vf.filter(function(id){return FM[id]&&FM[id].tp==="gw"&&!(id==="PL"&&(a.religion==="KR"||a.religion==="ER"));}).map(function(id){var d="";if(id==="GE")d="→ Kein ZK Geschichte nötig, aber ZK SoWi in Q2";if(id==="SW")d="→ Kein ZK SoWi nötig, aber ZK Geschichte in Q2";if(id!=="GE"&&id!=="SW")d="→ ZK Geschichte + SoWi in Q2 nötig";return{id:id,label:FM[id].n,desc:d};})} selected={a.gesellschaftswiss} onSelect={function(id){sA("gesellschaftswiss",id);}}/>
      {a.religion==="PL_ersatz"&&a.gesellschaftswiss==="PL"&&<ErrBox>Philosophie kann nicht gleichzeitig Ersatzfach und einziges GW-Fach sein. Bitte anderes GW-Fach wählen!</ErrBox>}
      <Hint>Geschichte und Sozialwissenschaften müssen in der Oberstufe vorkommen – entweder als reguläres Fach (mind. bis Ende Q1) oder als Zusatzkurs in Q2. Wer GE oder SW als Haupt-GW wählt, spart einen der beiden Zusatzkurse.</Hint>
    </div>;
    case"weitereFaecher":{
      var relChosen=a.religion;
      var weiSel=a.weitereFaecher||[];
      // Pflichtfächer aus früheren Schritten (locked, nicht abwählbar)
      var pflicht=["D","M","SP"];
      ["fortgefFS","kunstmusik","naturwissenschaft","gesellschaftswiss"].forEach(function(k){if(wa[k])pflicht.push(wa[k]);});
      if(wa.religion==="PL_ersatz")pflicht.push("PL");else if(wa.religion)pflicht.push(wa.religion);
      pflicht=pflicht.filter(function(v,i,ar){return ar.indexOf(v)===i;});
      // Alle wählbaren Fächer (außer Sport, Q-only, Religion-Konflikte)
      // Alle gewählten Fächer (Pflicht + Wahl)
      var allChosen=pflicht.concat(weiSel);
      var wO=vf.filter(function(id){
        if(!FM[id]||FM[id].tp==="sp"||FM[id].qo) return false;
        if(FM[id].tp==="rel"){
          if(relChosen==="KR"&&id==="ER") return false;
          if(relChosen==="ER"&&id==="KR") return false;
          if(relChosen==="PL_ersatz") return false;
        }
        if(id==="PL"&&(relChosen==="KR"||relChosen==="ER"||relChosen==="PL_ersatz")) return false;
        // Keine doppelte Sprache: F↔F0, L↔L0, S↔S0
        if(id==="F0"&&allChosen.indexOf("F")>=0) return false;
        if(id==="F"&&allChosen.indexOf("F0")>=0) return false;
        if(id==="L0"&&allChosen.indexOf("L")>=0) return false;
        if(id==="L"&&allChosen.indexOf("L0")>=0) return false;
        if(id==="S0"&&allChosen.indexOf("S")>=0) return false;
        if(id==="S"&&allChosen.indexOf("S0")>=0) return false;
        return true;
      });
      var need=Math.max(0,34-stunden);
      return <div><h2 style={{fontSize:20,fontWeight:700,color:T.pri,marginTop:0}}>Deine Fächer ✨</h2>
        <p style={{fontSize:13,color:T.txL,marginBottom:8,lineHeight:1.5}}>Hier siehst du alle deine Fächer. Die Pflichtfächer (🔒) stehen fest. Wähle zusätzlich Fächer, die dich interessieren – du brauchst insgesamt ca. 34 Wochenstunden. Für den <strong>Schwerpunkt</strong> brauchst du entweder 2 Fremdsprachen (sprachlich) oder 2 NaWi/Tech-Fächer (naturwissenschaftlich) – oder beides. Der Schwerpunkt schränkt deine LK- und Abi-Wahl <strong>nicht</strong> ein!</p>
        <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
          <Tag bg={T.priL} c={T.pri}>EF: {stunden}h / ~34h</Tag>
          {(wa.lk1||wa.lk2)&&<Tag bg="#cffafe" c="#0e7490">Q: {stundenQ}h (LK = 5h)</Tag>}
          {need>0&&!wa.lk1&&<Tag bg={T.warnBg} c={T.warn}>Noch ~{need}h</Tag>}
          {stunden>36&&!wa.lk1&&<Tag bg={T.errBg} c={T.err}>Zu viele Stunden!</Tag>}
          <Tag bg={schw.ok?T.okBg:T.warnBg} c={schw.ok?T.ok:T.warn}>{schw.bd?"Beide Schwerpunkte offen ✓":schw.sp?"Sprachlich ✓":schw.nw?"NaWi ✓":"Schwerpunkt?"}</Tag>
        </div>
        {!schw.ok&&<Warn>Wähle mindestens eine <strong>weitere Fremdsprache</strong> oder ein <strong>NaWi/Tech-Fach</strong>. Du kannst auch beides!</Warn>}
        {[{label:"Sprachen",filter:function(f){return f.tp==="ffs"||f.tp==="nfs";}},
            {label:"Gesellschaftswiss.",filter:function(f){return f.tp==="gw"||f.tp==="rel";}},
            {label:"Mathe / NaWi / Tech",filter:function(f){return f.tp==="pfl"||f.tp==="nw"||f.tp==="nt";}},
            {label:"Kunst / Musik",filter:function(f){return f.tp==="ku";}}
          ].map(function(grp){
            var gIds=wO.filter(function(id){return FM[id]&&grp.filter(FM[id]);});
            if(gIds.length===0)return null;
            return <div key={grp.label} style={{marginBottom:10}}>
              <div style={{fontSize:10.5,fontWeight:700,color:T.txL,letterSpacing:".06em",textTransform:"uppercase",marginBottom:4}}>{grp.label}</div>
              <div className="chipGrid">{gIds.map(function(id){
                var f=FM[id];var isPfl=pflicht.indexOf(id)>=0;var isWei=weiSel.indexOf(id)>=0;var active=isPfl||isWei;
                return <button key={id} onClick={function(){if(!isPfl)togM("weitereFaecher",id);}}
                  style={{padding:"10px 16px",borderRadius:12,border:"2px solid "+(active?isPfl?"#86efac":T.pri:"transparent"),
                    backgroundColor:active?isPfl?T.okBg:T.priL:"#f4f2fa",cursor:isPfl?"default":"pointer",textAlign:"left",
                    opacity:isPfl?0.85:1}}>
                  <div style={{fontSize:13,fontWeight:active?700:500,color:active?isPfl?T.ok:T.pri:T.tx}}>
                    {isPfl?"🔒 ":active?"✓ ":""}{f.n}{f.h===4?" (4h)":""}
                  </div>
                  {isPfl&&<div style={{fontSize:10,color:T.txL,marginTop:1}}>Pflicht</div>}
                </button>;})}</div>
            </div>;
          })}
        {stunden>36&&<Warn>Du hast <strong>{stunden} Wochenstunden</strong> – erlaubt sind 32–36. Wähle weniger Wahlfächer ab, um in den Zielbereich zu kommen.</Warn>}
        {stunden<32&&<Warn>Erst <strong>{stunden} Wochenstunden</strong> – du brauchst mindestens 32. Wähle weitere Fächer.</Warn>}
        {!schw.ok&&stunden>=30&&<Warn>Dir fehlt noch der <strong>Schwerpunkt</strong>: Wähle entweder eine 2. Fremdsprache oder ein 2. NaWi/Tech-Fach.</Warn>}
        {(a.weitereFaecher||[]).some(function(id){return FM[id]&&FM[id].tp==="nfs";})&&<Hint>Du hast eine <strong>neu einsetzende Fremdsprache</strong> gewählt – die muss durchgehend von der EF bis Q2 belegt werden (4 Wochenstunden).</Hint>}
        {!(a.weitereFaecher||[]).some(function(id){return FM[id]&&FM[id].tp==="nfs";})&&<Hint>Was du hier nicht wählst, kann später kein Abiturfach werden.</Hint>}
      </div>;}
    case"klausurfaecher":{var pK=["D","M"];if(a.fortgefFS)pK.push(a.fortgefFS);pK=pK.filter(function(v,i,ar){return ar.indexOf(v)===i;});var gwO=gewIds.filter(function(id){return FM[id]&&FM[id].tp==="gw";});var nwO=gewIds.filter(function(id){return FM[id]&&FM[id].tp==="nw";});
      return <div><h2 style={{fontSize:20,fontWeight:700,color:T.pri,marginTop:0}}>Klausurfächer in der EF ✍️</h2>
        <p style={{fontSize:13,color:T.txL,marginBottom:5}}>In der Oberstufe gibt es <strong>schriftliche</strong> (= Klausuren) und <strong>mündliche</strong> Fächer.</p>
        <p style={{fontSize:13,color:T.txL,marginBottom:14}}>Deutsch, Mathe und alle Fremdsprachen schreiben immer Klausuren. Zusätzlich wählst du je ein GW- und ein NaWi-Fach als Klausurfach. Alle anderen Fächer belegst du mündlich.</p>
        <div style={{marginBottom:14}}><div style={{fontSize:10.5,fontWeight:700,color:T.txL,marginBottom:4,letterSpacing:".06em",textTransform:"uppercase"}}>AUTOMATISCH GESETZT</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{pK.map(function(id){return <Tag key={id} c={T.ok} bg={T.okBg}>{"✓ "+(FM[id]?FM[id].n:id)}</Tag>;})}</div></div>
        <div style={{marginBottom:14}}><div style={{fontSize:13,fontWeight:600,marginBottom:5}}>GW-Klausurfach:</div><Chips options={gwO.map(function(id){return{id:id,label:FM[id].n};})} selected={a.klGW} onSelect={function(id){sA("klGW",id);}}/></div>
        <div style={{marginBottom:14}}><div style={{fontSize:13,fontWeight:600,marginBottom:5}}>NaWi-Klausurfach:</div><Chips options={nwO.map(function(id){return{id:id,label:FM[id].n};})} selected={a.klNW} onSelect={function(id){sA("klNW",id);}}/></div>
        <Warn><strong>Wichtig:</strong> Nur Klausurfächer können später Abiturfächer werden! Wenn du ein Fach als mögliches Abi im Hinterkopf hast, wähle es jetzt schriftlich.</Warn>
        <Hint>In der Q-Phase müssen alle 4 Abiturfächer durchgehend schriftlich belegt werden. Fang also früh an, Klausuren zu schreiben in Fächern, die dich interessieren.</Hint>
      </div>;}
    case"leistungskurse":{var lIds=gewIds.filter(function(id){return FM[id]&&FM[id].lk&&FM[id].tp!=="nfs"&&vfLK.indexOf(id)>=0;});
      return <div><h2 style={{fontSize:20,fontWeight:700,color:T.pri,marginTop:0}}>Leistungskurse 💪</h2>
        <p style={{fontSize:13,color:T.txL,marginBottom:5}}>Ab der Q-Phase belegst du zwei Fächer als <strong>Leistungskurse</strong> (LK) mit 5 statt 3 Wochenstunden.</p>
        <p style={{fontSize:13,color:T.txL,marginBottom:14}}>Dein 1. LK muss Deutsch, Mathe, eine fortgeführte Fremdsprache oder eine Naturwissenschaft sein. Der 2. LK ist frei wählbar aus dem LK-Angebot deiner Schule. Beide LKs sind automatisch deine ersten beiden Abiturfächer.</p>
        <div style={{marginBottom:14}}><div style={{fontSize:13,fontWeight:600,marginBottom:5}}>1. LK:</div><Chips options={lIds.filter(function(id){return FM[id].a1;}).map(function(id){return{id:id,label:FM[id].n};})} selected={a.lk1} onSelect={function(id){sA("lk1",id);}}/></div>
        <div><div style={{fontSize:13,fontWeight:600,marginBottom:5}}>2. LK:</div><Chips options={lIds.filter(function(id){return id!==a.lk1;}).map(function(id){return{id:id,label:FM[id].n};})} selected={a.lk2} onSelect={function(id){sA("lk2",id);}}/></div>
        {a.lk1&&a.lk2&&a.lk1===a.lk2&&<ErrBox>Du hast zweimal dasselbe Fach gewählt.</ErrBox>}
        {a.lk1&&a.lk2&&!(FM[a.lk1]&&FM[a.lk1].a1)&&<Warn>Dein 1. LK muss Deutsch, Mathe, eine fortgeführte Fremdsprache oder NaWi sein.</Warn>}
        <Hint>Die LK-Wahl wird erst ab der Q-Phase verbindlich. Eine Umwahl ist in den ersten 2–3 Wochen möglich.</Hint>
      </div>;}
    case"abiturfaecher":{var l1=a.lk1||"",l2=a.lk2||"";
      // Alle belegten Fächer außer LKs, Literatur (kein Abi), Sport (nur 4.)
      var gkAll=gewIds.filter(function(id){return id!==l1&&id!==l2&&FM[id]&&FM[id].tp!=="kua";});
      var gk3=gkAll.filter(function(id){return id!=="SP";}); // Sport nicht als 3. Abi (§12.6: nur 4.)
      var ai2=[l1,l2,a.abi3,a.abi4].filter(Boolean);var abd={I:ai2.some(function(id){return FM[id]&&FM[id].af==="I"&&(id==="D"||isFS(FM[id]));}),II:ai2.some(function(id){return(FM[id]&&FM[id].af==="II")||isRel(FM[id]);}),III:ai2.some(function(id){return FM[id]&&FM[id].af==="III";})};var dmfs=ai2.filter(function(id){return id==="D"||id==="M"||isFS(FM[id]);});
      return <div><h2 style={{fontSize:20,fontWeight:700,color:T.pri,marginTop:0}}>Abiturprüfungen 🎯</h2>
        <p style={{fontSize:13,color:T.txL,marginBottom:10,lineHeight:1.5}}>Du machst Abitur in 4 Fächern: Deine 2 LKs (schriftlich) + ein 3. Fach (schriftlich) + ein 4. Fach (mündlich). Dabei müssen alle drei <strong>Aufgabenfelder</strong> (AF) abgedeckt sein: AF I = Sprachen/Kunst, AF II = Gesellschaftswiss., AF III = Mathe/NaWi. Außerdem müssen mindestens 2 von Deutsch, Mathe und einer Fremdsprache dabei sein.</p>
        <div style={{padding:8,borderRadius:10,backgroundColor:T.priL,marginBottom:14,fontSize:13}}><strong>1. LK:</strong> {FM[l1]?FM[l1].n:"–"} &nbsp;•&nbsp; <strong>2. LK:</strong> {FM[l2]?FM[l2].n:"–"}</div>
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>{["I","II","III"].map(function(af){return <Tag key={af} c={abd[af]?T.ok:T.err} bg={abd[af]?T.okBg:T.errBg}>{"AF "+af+": "+(abd[af]?"✓":"✗ fehlt!")}</Tag>;})}<Tag c={dmfs.length>=2?T.ok:T.err} bg={dmfs.length>=2?T.okBg:T.errBg}>{"2 aus D/M/FS: "+dmfs.length+"/2"}</Tag></div>
        <div style={{marginBottom:14}}><div style={{fontSize:13,fontWeight:600,marginBottom:5}}>3. Abiturfach (schriftlich):</div><Chips options={gk3.filter(function(id){return id!==a.abi4;}).map(function(id){return{id:id,label:FM[id].n,desc:"AF "+FM[id].af};})} selected={a.abi3} onSelect={function(id){sA("abi3",id);}}/></div>
        <div><div style={{fontSize:13,fontWeight:600,marginBottom:5}}>4. Abiturfach (mündlich):</div><Chips options={gkAll.filter(function(id){return id!==a.abi3;}).map(function(id){return{id:id,label:FM[id].n+(id==="SP"?" (nur 4.)":""),desc:"AF "+FM[id].af};})} selected={a.abi4} onSelect={function(id){sA("abi4",id);}}/></div>
        {a.abi3&&a.abi4&&(!abd.I||!abd.II||!abd.III)&&<Warn>Noch nicht alle 3 Aufgabenfelder abgedeckt! Ändere dein 3. oder 4. Fach, damit AF I, II und III vertreten sind.</Warn>}
        {a.abi3&&a.abi4&&dmfs.length<2&&<Warn>Du brauchst mindestens 2 der Fächer Deutsch, Mathe oder eine Fremdsprache unter deinen 4 Abifächern.</Warn>}
        <Hint>Sport kann nur 4. Abiturfach (mündlich) sein. Literatur kann nicht Abiturfach sein. Die endgültige Festlegung erfolgt zu Beginn von Q2.</Hint>
      </div>;}
    case"ergebnis":return <div><h2 style={{fontSize:22,fontWeight:800,color:T.pri,marginTop:0}}>{wVal&&wVal.errors.length===0?"Dein Plan steht! 🎉":wVal&&wVal.errors.length===1?"Fast fertig – 1 Punkt anpassen":"Fast fertig – "+wVal.errors.length+" Punkte anpassen"}</h2>
      {wVal&&wVal.errors.length>0&&<div style={{padding:14,borderRadius:12,backgroundColor:T.errBg,marginBottom:12,border:"1px solid #fecaca"}}>
        <div style={{fontSize:13,fontWeight:700,color:T.err,marginBottom:6}}>Das musst du noch ändern:</div>
        {wVal.errors.map(function(m,i){var cl=m.replace(/ → Tab [\w+\/]+$/,"");return <div key={i} style={{fontSize:12.5,color:T.err,marginBottom:3,paddingLeft:16,position:"relative"}}><span style={{position:"absolute",left:0}}>{"✗"}</span>{cl}</div>;})}
        <p style={{fontSize:12,color:T.txL,marginTop:8}}>Geh zurück und passe die entsprechenden Schritte an, oder bearbeite den Plan direkt im Detail.</p>
      </div>}
      {wVal&&wVal.warnings.length>0&&<div style={{padding:12,borderRadius:10,backgroundColor:T.warnBg,marginBottom:12,border:"1px solid #fde68a"}}>
        <div style={{fontSize:12,fontWeight:600,color:T.warn,marginBottom:4}}>Hinweise ({wVal.warnings.length}):</div>
        {wVal.warnings.map(function(m,i){var cl=m.replace(/ → Tab [\w+\/]+$/,"");return <div key={i} style={{fontSize:11.5,color:T.warn,marginBottom:2}}>{"⚠ "+cl}</div>;})}
      </div>}
      {wVal&&wVal.errors.length===0&&<div style={{padding:16,borderRadius:12,backgroundColor:T.okBg,marginBottom:12,border:"1px solid #a7f3d0",textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:4}}>{"🎯"}</div>
        <div style={{fontSize:17,fontWeight:700,color:T.ok}}>Alle Regeln erfüllt – dein Plan ist gültig!</div>
        <div style={{fontSize:12,color:T.txL,marginTop:4}}>Besprich ihn jetzt mit deiner Beratungslehrkraft.</div>
      </div>}
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
        <Tag bg={T.priL} c={T.pri}>{"LK: "+(FM[a.lk1]?FM[a.lk1].n:"")+" + "+(FM[a.lk2]?FM[a.lk2].n:"")}</Tag>
        <Tag bg={T.priL} c={T.pri}>{"3. "+(FM[a.abi3]?FM[a.abi3].n:"")}</Tag>
        <Tag bg={T.priL} c={T.pri}>{"4. "+(FM[a.abi4]?FM[a.abi4].n:"")}</Tag>
        <Tag bg={schwBg(schw)} c={schwColor(schw)}>{schw.bd?"⚖️ Beide Schwerpunkte offen":schw.sp?"🌐 Sprachlicher Schwerpunkt":schw.nw?"🔬 Naturwiss. Schwerpunkt":"⚠ Schwerpunkt?"}</Tag>
      </div>
      {stunden>36&&<Warn><strong>{stunden} Wochenstunden</strong> – erlaubt sind 32–36. Wähle im Detail-Modus Wahlfächer ab.</Warn>}
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        <Tag bg={stunden>36?T.warnBg:T.priL} c={stunden>36?T.warn:T.pri}>{"EF: "+stunden+"h"}</Tag>
        <Tag bg={stundenQ>38?T.warnBg:T.priL} c={stundenQ>38?T.warn:T.pri}>{"Q: "+stundenQ+"h (mit LK)"}</Tag>
      </div>
      <div style={{fontSize:13,color:T.txL,marginBottom:16,lineHeight:1.6}}>
        <strong>Deine Fächer ({gewIds.length}):</strong> {gewIds.map(function(id){return FM[id]?FM[id].n:id;}).join(" • ")}
      </div>
      <div style={{padding:12,borderRadius:10,backgroundColor:T.infoBg,marginBottom:14,fontSize:12.5,color:T.tx,lineHeight:1.6}}>
        <strong>Wie geht es weiter?</strong><br/>
        Dein Plan ist ein <strong>Entwurf</strong> – du kannst ihn jederzeit anpassen. Klicke auf „Plan im Detail bearbeiten“, um deinen Plan mit allen Halbjahren zu sehen. Dort kannst du einzelne Fächer gezielt an- und abwählen – z.B. ein Fach nur in der EF ausprobieren und dann abwählen.<br/><br/>
        <strong>Wichtig:</strong> Dieser Plan ersetzt nicht die offizielle Beratung! Besprich deine Fächerwahl unbedingt mit der Beratungslehrkraft deiner Schule. Die verbindliche Anmeldung erfolgt über die Schule.
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <Btn big onClick={function(){if(wPlan){setBl(wPlan.bl);setLk(wPlan.lk);setAb(wPlan.ab);setPr(function(p2){return Object.assign({},p2,{bildungsgang:a.bildungsgang||"G9",hat2FSSekI:!!(a.fremdsprachen&&a.fremdsprachen.length>=2),befreitReligion:a.religion==="PL_ersatz"});});setETab(5);setMode("expert");}}}>📊 Plan im Detail bearbeiten</Btn>
        <Btn big outline onClick={function(){if(wPlan)expJSON({v:VERSION,d:VDATE,bl:wPlan.bl,lk:wPlan.lk,ab:wPlan.ab,vf:vf,vfLK:vfLK,schule:schule,wizard:a});}}>💾 Plan als Datei speichern</Btn>
      </div>
      <AppFooter showFeedback onInfo={setInfoPage} />
    </div>;
    default:return null;
  }}

  /* ════════ WIZARD LAYOUT ════════ */
  return (
    <div style={{minHeight:"100vh",background:T.bg}}>
      <style>{CSS}</style>
      <div className="hdrBar" style={{background:"linear-gradient(135deg,"+T.pri+","+T.priD+")",color:"#fff"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>🧭</span>
          <div>
            <div style={{fontSize:14,fontWeight:700}}>{schule.name?schule.name+" – ":""}Schritt {ws+1} von {STEPS.length}</div>
            {schule.name&&schule.jahr&&<div style={{fontSize:10,opacity:0.7}}>{schule.jahr}</div>}
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={function(){setShowHelp(true);}} style={{padding:"5px 12px",borderRadius:8,border:"none",backgroundColor:"rgba(255,255,255,.1)",color:"#fff",cursor:"pointer",fontSize:11.5,fontWeight:500}}>{"❓"}</button>
          <button onClick={function(){if(window.confirm("Neu beginnen? Alle Eingaben gehen verloren."))resetW();}} style={{padding:"5px 12px",borderRadius:8,border:"none",backgroundColor:"rgba(255,255,255,.1)",color:"#fff",cursor:"pointer",fontSize:11.5,fontWeight:500}}>{"↻ Neu"}</button>
          <button onClick={function(){setMode("choose");}} style={{padding:"5px 12px",borderRadius:8,border:"none",backgroundColor:"rgba(255,255,255,.15)",color:"#fff",cursor:"pointer",fontSize:11.5,fontWeight:500}}>{"← Startseite"}</button>
        </div>
      </div>
      {/* Progress */}
      <div style={{display:"flex",gap:2,padding:"6px 16px",backgroundColor:T.bg}}>
        {STEPS.map(function(st,i){
          var done=i<ws;var cur=i===ws;var canJump=i<ws;
          return <div key={i} onClick={function(){if(canJump)setWs(i);}}
            style={{flex:1,height:4,borderRadius:2,cursor:canJump?"pointer":"default",
              backgroundColor:done?T.pri:cur?T.acc:T.bdr,
              transition:"all .3s",opacity:done||cur?1:0.5}}
            title={STEPS[i]}/>;
        })}
      </div>
      {/* Content */}
      <div className="wizWrap">
        <div className="wizCard">
          {renderWiz()}
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          {ws>0?<Btn outline onClick={function(){setWs(Math.max(0,ws-1));}}>{"← Zurück"}</Btn>:<div/>}
          {sid!=="ergebnis"&&<Btn onClick={function(){if(canN())setWs(ws+1);}} disabled={!canN()}>Weiter →</Btn>}
        </div>
      </div>
      <InfoOverlay page={infoPage} onClose={function(){setInfoPage(null);}} />
      <HelpOverlay show={showHelp} onClose={function(){setShowHelp(false);}} />
    </div>
  );
}
