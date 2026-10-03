let ANO=2026,MES=9;const MN=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const INIT=[
 {n:"Fernando Sales Reis",m:"85.329-2",v:"Nomeado",t:"D",dias:[2,5,7,9,11,13,15,19,21,25,27,29]},
 {n:"Antônio José Lobo da Silva",m:"38.310-4",v:"Efetivo",t:"D",dias:[10,12,14,18,20,22,26,28,30],ferias:[1,9]},
 {n:"Lucas Winnycius Silva Fernandes",m:"85.329-2",v:"Nomeado",t:"D",dias:[3,4,17,24,31]},
 {n:"Renilson Alves Pereira",m:"35.778-2",v:"Efetivo",t:"N",dias:[1,4,6,7,10,13,16,19,22,25,28,31],sd:[6]},
 {n:"Valdiney Silva de Oliveira",m:"35.921-1",v:"Efetivo",t:"N",dias:[1,2,5,8,11,14,16,17,20,23,26,29],sd:[1,16]},
 {n:"Wilame dos Santos Pacheco",m:"35.974-2",v:"Efetivo",t:"N",dias:[3,6,8,9,12,15,18,21,23,24,27,30],sd:[8,23]}
];
const SEM=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],$=id=>document.getElementById(id);
const g=$("g"),det=$("det"),fil=$("fil"),hoje=new Date();
const ls={get:k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let BASE=ls.get("escala-emp");if(!Array.isArray(BASE)||!BASE.length)BASE=INIT.map(f=>({n:f.n,m:f.m,v:f.v,t:f.t}));
const pad=a=>{while(a.length<BASE.length)a.push({});return a};
const norm=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
let FER=ls.get("escala-fer")||{"2026-10":[{n:"Antônio José Lobo da Silva",p:"10/09 a 09/10/2026",r:"2024/2025"}]};
function base(){return pad(INIT.map(f=>{const o={};f.dias.forEach(d=>o[d]=(f.t=="D"||(f.sd&&f.sd.includes(d)))?"D":"N");if(f.ferias)for(let d=f.ferias[0];d<=f.ferias[1];d++)o[d]="F";return o}))}
const empty=()=>BASE.map(()=>({})),mk=(y,m)=>y+"-"+String(m+1).padStart(2,"0");
let ALL=ls.get("escala-all");
if(!ALL){ALL={};const old=ls.get("escala-v2");if(old&&old.length<=BASE.length)ALL["2026-10"]=pad(old)}
function getS(y,m){const k=mk(y,m);if(!Array.isArray(ALL[k]))ALL[k]=(k=="2026-10")?base():empty();else pad(ALL[k]);return ALL[k]}
let S=getS(ANO,MES);
const save=()=>ls.set("escala-all",ALL);
let XA=ls.get("escala-x");if(!Array.isArray(XA))XA=[];XA=XA.map(v=>({m:"2026-10",...v}));
let EU=ls.get("escala-eu");if(typeof EU!="number"||EU<0||EU>=BASE.length)EU=0;
let X=[];const refX=()=>{X=XA.filter(x=>x.m==mk(ANO,MES))};refX();
let tipo="",view="mes",edit=false,sel=null,wk=0;
const fillSel=()=>{const cur=fil.value;fil.innerHTML='<option value="">Todos os funcionários</option>'+BASE.map((f,i)=>`<option value="${i}">${f.n}</option>`).join("");fil.value=cur};fillSel();
const vis=i=>!BASE[i].off||Object.keys(S[i]||{}).length>0;
const isHoje=d=>hoje.getFullYear()==ANO&&hoje.getMonth()==MES&&hoje.getDate()==d;
const LB={D:"SD",N:"SN",F:"Férias"};
function turnos(d){const r=[];BASE.forEach((f,i)=>{const k=S[i][d];if(k)r.push({f,i,k,l:LB[k]})});
 return r.filter(x=>(!fil.value||x.i==fil.value)&&(!tipo||x.k==tipo))}
const xs=d=>XA.map((x,j)=>({...x,j})).filter(x=>x.d==d&&x.m==mk(ANO,MES));
const xl=k=>k=="D"?"SD":"SN";
const xchip=x=>`<span class="chip X"><span class="full">Extra ${xl(x.k)}${x.de!==""?" · cobre "+BASE[x.de].n.split(" ")[0]:""}</span><span class="ini">Extra ${xl(x.k)}</span></span>`;
const xdet=(d,ed)=>xs(d).map(x=>`<div><i class="dot" style="background:var(--x)"></i><b>Plantão extra ${x.k=="D"?"SD (07:00–19:00)":"SN (19:00–07:00)"}</b>${x.de!==""?"<br><span>Cobrindo "+BASE[x.de].n+"</span>":""}${ed?` <button data-rx="${x.j}">Remover</button>`:""}</div>`).join("");
const ini=n=>{const p=n.split(" ");return p[0][0]+p[p.length-1][0]};
const chip=(t,full)=>`<span class="chip ${t.k}" title="${t.f.n}"><span class="full">${t.l} ${full?t.f.n:t.f.n.split(" ")[0]}</span><span class="ini">${t.k=="F"?"Fér":t.l} ${ini(t.f.n)}</span></span>`;
function hojeBox(){
 const el=$("hj");if(hoje.getFullYear()!=ANO||hoje.getMonth()!=MES){el.style.display="none";return}
 const d=hoje.getDate(),t=[];BASE.forEach((f,i)=>{const k=S[i][d];if(k)t.push({f,k,l:LB[k]})});
 el.innerHTML=`<h2>Hoje · ${SEM[hoje.getDay()]}, ${String(d).padStart(2,"0")}/${String(MES+1).padStart(2,"0")}</h2>`+(t.length?t.map(x=>`<div class="li"><i class="dot" style="background:var(--${x.k.toLowerCase()})"></i><b>${x.f.n}</b> — ${x.k=="D"?"SD (07:00–19:00)":x.k=="N"?"SN (19:00–07:00)":"Férias"}</div>`).join(""):"<span class='mut'>Ninguém escalado hoje.</span>")+xs(d).map(x=>`<div class="li"><i class="dot" style="background:var(--x)"></i><b>Seu plantão extra</b> — ${x.k=="D"?"SD (07:00–19:00)":"SN (19:00–07:00)"}</div>`).join("");
}
function render(){
 const ini=new Date(ANO,MES,1).getDay(),tot=new Date(ANO,MES+1,0).getDate();
 if(view=="sem"){
  g.className="wk";const a=wk,b=Math.min(a+6,tot);
  let h=`<div class="wkn"><button id="pv">◀</button><b>${Math.max(a,1)}/${MES+1} a ${b}/${MES+1}</b><button id="vm">Ver mês</button><button id="nx">▶</button></div>`;
  g.innerHTML=h;
  for(let d=Math.max(a,1);d<=b;d++){
   const c=document.createElement("div");const w=new Date(ANO,MES,d).getDay();
   c.className="cell"+(isHoje(d)?" today":"")+(sel==d?" sel":"")+(w==0||w==6?" we":"")+(xs(d).length?" hasx":"");
   c.innerHTML=`<div class="num">${SEM[w]} ${d}</div><div class="ch">${turnos(d).map(t=>chip(t,1)).join("")+xs(d).map(xchip).join("")||'<span class="mut">—</span>'}</div>`;
   c.onclick=()=>{sel=d;render();detalhe(d)};g.appendChild(c);
  }
  $("vm").onclick=()=>setV("mes");$("pv").onclick=()=>{wk=Math.max(wk-7,1-ini);render()};$("nx").onclick=()=>{if(wk+7<=tot)wk+=7;render()};
  return;
 }
 g.className="grid";g.innerHTML=SEM.map(s=>`<div class="wd">${s}</div>`).join("");
 for(let i=0;i<ini;i++)g.insertAdjacentHTML("beforeend",'<div class="cell empty"></div>');
 for(let d=1;d<=tot;d++){
  const w=new Date(ANO,MES,d).getDay(),c=document.createElement("div");
  c.className="cell"+(w==0||w==6?" we":"")+(isHoje(d)?" today":"")+(sel==d?" sel":"")+(xs(d).length?" hasx":"");
  c.innerHTML=`<div class="num">${d}</div>`+turnos(d).map(t=>chip(t)).join("")+xs(d).map(xchip).join("");
  c.onclick=()=>{sel=d;render();detalhe(d)};g.appendChild(c);
 }
}
function detalhe(d){
 const w=SEM[new Date(ANO,MES,d).getDay()],h=`<h2>${w}, ${String(d).padStart(2,"0")}/${String(MES+1).padStart(2,"0")}/${ANO}${edit?" · editando":""}</h2>`;
 if(edit){
  det.innerHTML=h+BASE.map((f,i)=>!vis(i)?"":`<div><b>${f.n}</b><div class="seg">${[["","—"],["D","SD"],["N","SN"],["F","Férias"]].map(([k,l])=>`<button data-i="${i}" data-k="${k}" class="${(S[i][d]||"")==k?"on":""}">${l}</button>`).join("")}</div></div>`).join("")+xdet(d,1)+`<div><b>➕ Adicionar plantão extra</b><div class="row"><select id="cov"><option value="">Cobrindo: qualquer</option>${BASE.map((f,i)=>`<option value="${i}">Cobrindo ${f.n}</option>`).join("")}</select></div><div class="seg"><button data-x="D">SD diurno</button><button data-x="N">SN noturno</button></div></div>`;
  return;
 }
 const t=turnos(d);
 det.innerHTML=h+(t.length?t.map(x=>`<div><i class="dot" style="background:var(--${x.k.toLowerCase()})"></i><b>${x.f.n}</b> — ${x.k=="D"?"Serviço diurno (07:00–19:00)":x.k=="N"?"Serviço noturno (19:00–07:00)":"Férias"}<br><span>Mat. ${x.f.m} · ${x.f.v}</span></div>`).join(""):"<span>Sem escalas neste dia.</span>")+xdet(d,0);
}
function cont(){
 $("cnt").innerHTML="<table><tr><th>Funcionário</th><th>SD</th><th>SN</th><th>Extra</th><th>Férias</th><th>Total</th></tr>"+BASE.map((f,i)=>{if(!vis(i))return"";
  const v=Object.values(S[i]),c=k=>v.filter(x=>x==k).length,ex=i==EU?X.length:0;
  return `<tr><td>${f.n.split(" ").slice(0,2).join(" ")}</td><td>${c("D")}</td><td>${c("N")}</td><td style="color:var(--x)">${ex}</td><td>${c("F")}</td><td><b>${c("D")+c("N")+ex}</b></td></tr>`}).join("")+"</table>"+(X.length?`<p style="color:var(--x)">🟢 Plantões extras: <b>${X.length}</b> (SD ${X.filter(x=>x.k=="D").length} · SN ${X.filter(x=>x.k=="N").length}) somados ao total de ${BASE[EU].n.split(" ")[0]}</p>`:"");
}
function vgChips(){
 const nm=f=>{const p=f.n.split(" ");return p[0]+" "+p[p.length-1]};
 $("vgc").innerHTML=`<button data-i="" class="${fil.value===""?"on":""}">Todos</button>`+BASE.map((f,i)=>!vis(i)?"":`<button data-i="${i}" class="${f.t=="D"?"d":"n"} ${fil.value===String(i)?"on":""}">${f.t=="D"?"☀️":"🌙"} ${nm(f)}</button>`).join("");
}
$("vgc").onclick=e=>{const b=e.target.closest("button");if(!b)return;const v=b.dataset.i;fil.value=(v!==""&&fil.value===v)?"":v;vgChips();render()};
const eufill=()=>{$("eu").innerHTML=BASE.map((f,i)=>`<option value="${i}">${f.n}</option>`).join("");$("eu").value=EU};eufill();$("eu").onchange=()=>{EU=+$("eu").value;ls.set("escala-eu",EU);cont()};
function tudo(){vgChips();refX();$("tt").textContent=MN[MES]+" de "+ANO;render();detalhe(sel);cont();hojeBox()}
det.onclick=e=>{const ax=e.target.closest("button[data-x]"),rx=e.target.closest("button[data-rx]");
 if(ax){XA.push({m:mk(ANO,MES),d:sel,k:ax.dataset.x,de:$("cov").value});ls.set("escala-x",XA);tudo();return}
 if(rx){XA.splice(+rx.dataset.rx,1);ls.set("escala-x",XA);tudo();return}
 const b=e.target.closest("button[data-k]");if(!b)return;
 const i=b.dataset.i,k=b.dataset.k;if(k)S[i][sel]=k;else delete S[i][sel];save();tudo()};
const setT=t=>{tipo=t;document.querySelectorAll("[data-t]").forEach(x=>x.classList.toggle("on",x.dataset.t==t));render()};
document.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>setT(b.dataset.t&&b.dataset.t==tipo?"":b.dataset.t));
const setV=v=>{view=v;document.querySelectorAll("[data-v]").forEach(x=>x.classList.toggle("on",x.dataset.v==v));wk=sel-new Date(ANO,MES,sel).getDay();render()};
document.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>setV(b.dataset.v=="sem"&&view=="sem"?"mes":b.dataset.v));
$("ed").onclick=()=>{edit=!edit;$("ed").classList.toggle("on",edit);detalhe(sel)};
fil.onchange=render;
//PDF-START
function pdfBytes(){
 const tot=new Date(ANO,MES+1,0).getDate(),W=842,H=595,L=24,NW=150,cw=(W-2*L-NW)/tot,rh=19,f1=v=>v.toFixed(1);
 let c="";
 const cl=s=>String(s).replace(/[—–]/g,"-").replace(/[^\x00-\xFF]/g,"?").replace(/[\\()]/g,"\\$&");
 const T=(x,y,s,sz,b,w)=>{if(w)x+=(w-String(s).length*sz*(b?0.56:0.5))/2;c+=`BT /F${b?2:1} ${sz} Tf 0 g ${f1(x)} ${f1(H-y)} Td (${cl(s)}) Tj ET\n`};
 const B=(x,y,w,h,fill)=>{c+=`${fill} rg 0.5 G 0.5 w ${f1(x)} ${f1(H-y-h)} ${f1(w)} ${f1(h)} re B\n`};
 const col={D:"1 0.85 0.45",N:"0.62 0.72 1",F:"0.96 0.62 0.67",X:"0.45 0.88 0.6",we:"0.99 0.86 0.74",wh:"0.96 0.6 0.35",w:"1 1 1",h:"0.78 0.78 0.78"};
 const L7=["D","S","T","Q","Q","S","S"],wdOf=d=>new Date(ANO,MES,d).getDay();
 T(L,34,"Prefeitura de Imperatriz - Secretaria Municipal de Administração e Modernização",9,0);
 T(L,54,`VIGIA - ESCALA DE ${MN[MES].toUpperCase()} DE ${ANO}`,14,1);
 let y=66;
 B(L,y,NW,rh*2,col.h);T(L+6,y+rh+4,"FUNCIONÁRIOS",8,1);
 for(let d=1;d<=tot;d++){const x=L+NW+(d-1)*cw,hc=(wdOf(d)==0||wdOf(d)==6)?col.wh:col.h;
  B(x,y,cw,rh,hc);T(x,y+13,String(d),7,1,cw);
  B(x,y+rh,cw,rh,hc);T(x,y+rh+13,L7[wdOf(d)],7,1,cw)}
 y+=rh*2;
 const grupo=(tit,tp)=>{
  B(L,y,NW+tot*cw,15,"0.92 0.92 0.92");T(L+6,y+11,tit,8,1);y+=15;
  BASE.forEach((f,i)=>{if(f.t!=tp||!vis(i))return;
   B(L,y,NW,rh,col.w);T(L+4,y+13,f.n,7.5,0);
   for(let d=1;d<=tot;d++){const x=L+NW+(d-1)*cw,k=S[i][d],w=wdOf(d),ex=i==EU?X.filter(v=>v.d==d).map(v=>xl(v.k)):[],lab=k=="F"?"F":k=="D"?"SD":"SN",et=ex.join("+");
    if(k&&ex.length){B(x,y,cw/2,rh,col[k]);B(x+cw/2,y,cw/2,rh,col.X);T(x,y+13,lab,5,1,cw/2);T(x+cw/2,y+13,et,et.length>2?4:5,1,cw/2)}
    else if(ex.length){B(x,y,cw,rh,col.X);T(x,y+13,et,et.length>2?5:6.5,1,cw)}
    else{B(x,y,cw,rh,k?col[k]:(w==0||w==6?col.we:col.w));if(k)T(x,y+13,lab,6.5,1,cw)}}
   y+=rh});
 };
 grupo("ESCALA DIURNA","D");grupo("ESCALA NOTURNA","N");
 y+=22;const y0=y;
 T(L,y,"LEGENDA",8,1);y+=8;
 [[col.D,"SD - Serviço diurno (07:00 às 19:00)"],[col.N,"SN - Serviço noturno (19:00 às 07:00)"],[col.F,"F - Férias"],[col.wh,"Sábado e domingo"],[col.X,"Plantão extra"]].forEach(([c0,t0])=>{B(L,y,11,11,c0);T(L+17,y+9,t0,8,0);y+=15});
 (FER[mk(ANO,MES)]||[]).forEach(e=>{y+=6;B(L,y,300,36,col.F);T(L+8,y+15,"FÉRIAS: "+e.n,8.5,1);T(L+8,y+28,e.p+(e.r?" (referente "+e.r+")":""),8,1);y+=36});
 let ty=y0;const tx=L+330,cws=[170,46,46,46,46,46];
 T(tx,ty,"TOTAL DE TURNOS NO MÊS",8,1);ty+=8;
 const row=(vals,fill,b)=>{let x=tx;vals.forEach((t,k)=>{B(x,ty,cws[k],rh,Array.isArray(fill)?fill[k]:fill);k?T(x,ty+13,String(t),7.5,b,cws[k]):T(x+5,ty+13,String(t),7.5,b);x+=cws[k]});ty+=rh};
 row(["Funcionário","SD","SN","Extra","Férias","Total"],col.h,1);
 BASE.forEach((f,i)=>{if(!vis(i))return;const v=Object.values(S[i]),n=k=>v.filter(z=>z==k).length,ex=i==EU?X.length:0;row([f.n,n("D"),n("N"),ex,n("F"),n("D")+n("N")+ex],[col.w,col.w,col.w,ex?col.X:col.w,col.w,col.w],0)});
 if(X.length)T(tx,ty+12,`Extras: ${X.filter(v=>v.k=="D").length} SD + ${X.filter(v=>v.k=="N").length} SN, somados ao total de ${BASE[EU].n}`,7.5,0);
 T(L,H-20,"Gerado em "+new Date().toLocaleDateString("pt-BR"),7,0);
 const o=[];
 o[1]="<< /Type /Catalog /Pages 2 0 R >>";
 o[2]="<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
 o[3]=`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`;
 o[4]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
 o[5]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";
 o[6]=`<< /Length ${c.length} >>\nstream\n${c}endstream`;
 let out="%PDF-1.4\n";const off=[];
 for(let i=1;i<=6;i++){off.push(out.length);out+=`${i} 0 obj\n${o[i]}\nendobj\n`}
 const xr=out.length;
 out+="xref\n0 7\n0000000000 65535 f \n"+off.map(v=>String(v).padStart(10,"0")+" 00000 n \n").join("")+`trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`;
 return Uint8Array.from(out,ch=>ch.charCodeAt(0));
}
const nome=()=>"escala-vigia-"+mk(ANO,MES)+".pdf";
async function salvar(nm,data,mime){
 try{const dl=window.claude&&await window.claude.use("downloads");
  if(dl){try{await dl.save({filename:nm,data})}catch(e){if(!e||e.code!="declined")alert("Não foi possível salvar o arquivo aqui.")}return}}catch(e){}
 const u=URL.createObjectURL(new Blob([data],{type:mime})),a=document.createElement("a");
 a.href=u;a.download=nm;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),5000);
}
const baixar=()=>salvar(nome(),pdfBytes(),"application/pdf");
async function compartilhar(){
 const f=new File([pdfBytes()],nome(),{type:"application/pdf"});
 try{await navigator.share({files:[f],title:"Escala Vigia - "+MN[MES]+" "+ANO})}catch(e){}
}
//PDF-END
$("pdf").onclick=baixar;$("shr").onclick=compartilhar;
try{if(!window.claude&&navigator.canShare&&navigator.canShare({files:[new File(["x"],"a.pdf",{type:"application/pdf"})]}))$("shr").style.display=""}catch(e){}
// backup
const bkTxt=()=>JSON.stringify({v:3,emp:BASE,ALL,X:XA,fer:FER});
$("exp").onclick=()=>{$("bk").value=bkTxt()};
$("cop").onclick=async()=>{const t=bkTxt();$("bk").value=t;
 try{await navigator.clipboard.writeText(t);alert("Backup copiado.")}catch(e){$("bk").select();try{document.execCommand("copy");alert("Backup copiado.")}catch(e2){alert("Selecione o texto e copie manualmente.")}}};
$("dbk").onclick=()=>salvar("backup-escala-vigia.json",bkTxt(),"application/json");
$("abr").onclick=()=>$("bf").click();
$("bf").onchange=e=>{const f=e.target.files[0];if(f)f.text().then(t=>{$("bk").value=t})};
$("imp").onclick=()=>{try{const x=JSON.parse($("bk").value);let A,XX=[];
 if(Array.isArray(x))A={"2026-10":x};else if(x.ALL){A=x.ALL;XX=x.X||[]}else A={"2026-10":x.S};
 if(x.merge){
  let map=null;
  if(Array.isArray(x.emp))map=x.emp.map(e=>{let i=BASE.findIndex(b=>norm(b.n)==norm(e.n));if(i<0){BASE.push({n:e.n,m:e.m||"",v:e.v||"Efetivo",t:e.t=="N"?"N":"D"});i=BASE.length-1}return i});
  for(const k in A){const dst=BASE.map(()=>({}));A[k].forEach((o,j)=>{const i=map?map[j]:j;if(i!=null&&i<dst.length)dst[i]=o});ALL[k]=dst}
  Object.keys(ALL).forEach(k=>pad(ALL[k]));
  if(x.fer)FER={...FER,...x.fer};
  if(Array.isArray(x.X))x.X.forEach(v=>{if(!XA.some(w=>w.m==v.m&&w.d==v.d&&w.k==v.k))XA.push({de:"",...v})});
  const k=Object.keys(A).sort()[0];if(k){ANO=+k.slice(0,4);MES=+k.slice(5)-1}
 }else{
  if(Array.isArray(x.emp)&&x.emp.length)BASE=x.emp;
  for(const k in A)if(!Array.isArray(A[k])||A[k].length>BASE.length)throw 0;
  ALL=A;XA=XX.map(v=>({m:"2026-10",...v}));if(x.fer)FER=x.fer;
 }
 ls.set("escala-emp",BASE);ls.set("escala-fer",FER);
 S=getS(ANO,MES);sel=(hoje.getFullYear()==ANO&&hoje.getMonth()==MES)?hoje.getDate():1;wk=sel-new Date(ANO,MES,sel).getDay();
 save();ls.set("escala-x",XA);fillSel();eufill();rosFill();tudo();if(x.merge)alert("Escala de "+MN[MES]+" de "+ANO+" importada.")}catch(e){alert("Texto de backup inválido.")}};
$("rst").onclick=()=>{if(confirm(ANO==2026&&MES==9?"Voltar este mês à escala original da foto?":"Limpar a escala deste mês?")){ALL[mk(ANO,MES)]=(ANO==2026&&MES==9)?base():empty();S=ALL[mk(ANO,MES)];save();tudo()}};
const goM=n=>{const d=new Date(ANO,MES+n,1);ANO=d.getFullYear();MES=d.getMonth();S=getS(ANO,MES);sel=(hoje.getFullYear()==ANO&&hoje.getMonth()==MES)?hoje.getDate():1;wk=sel-new Date(ANO,MES,sel).getDay();tudo()};
$("mp").onclick=()=>goM(-1);$("mx").onclick=()=>goM(1);
sel=(hoje.getFullYear()==ANO&&hoje.getMonth()==MES)?hoje.getDate():1;
tudo();
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});

// gerenciar vigias
function rosFill(){
 const q=s=>String(s||"").replace(/"/g,"&quot;");
 $("ros").innerHTML=BASE.map((f,i)=>`<div class="rv"><input data-r="n" data-i="${i}" value="${q(f.n)}" placeholder="Nome completo">
<input data-r="m" data-i="${i}" value="${q(f.m)}" placeholder="Matrícula" size="9">
<select data-r="v" data-i="${i}"><option${f.v=="Efetivo"?" selected":""}>Efetivo</option><option${f.v=="Nomeado"?" selected":""}>Nomeado</option></select>
<select data-r="t" data-i="${i}"><option value="D"${f.t=="D"?" selected":""}>☀️ Diurno</option><option value="N"${f.t=="N"?" selected":""}>🌙 Noturno</option></select>
<label class="mut"><input type="checkbox" data-r="a" data-i="${i}"${f.off?"":" checked"}> Ativo</label><button data-del="${i}" class="del">🗑️ Remover</button></div>`).join("");
}
function rosChanged(){ls.set("escala-emp",BASE);fillSel();eufill();tudo()}
$("ros").onchange=e=>{const t=e.target,r=t.dataset.r,f=BASE[+t.dataset.i];if(!r||!f)return;
 if(r=="n"){if(!t.value.trim()){t.value=f.n;return}f.n=t.value.trim()}else if(r=="a")f.off=!t.checked;else f[r]=t.value;
 rosChanged()};
function remover(i){
 const f=BASE[i];if(!f)return;
 if(BASE.length<2){alert("Precisa ficar pelo menos um vigia.");return}
 let meses=0,tn=0;Object.keys(ALL).forEach(k=>{const n=Object.keys((ALL[k]||[])[i]||{}).length;if(n){meses++;tn+=n}});
 const msg=tn?`Remover ${f.n}?\n\nIsso apaga ${tn} dia(s) de escala dele em ${meses} mês(es), inclusive nos PDFs antigos. Não dá para desfazer. Se tiver dúvida, faça um backup antes.`:`Remover ${f.n}?`;
 if(!confirm(msg))return;
 BASE.splice(i,1);
 Object.keys(ALL).forEach(k=>{if(Array.isArray(ALL[k]))ALL[k].splice(i,1)});
 XA.forEach(x=>{if(x.de!==""&&x.de!=null){const d=+x.de;x.de=d==i?"":String(d>i?d-1:d)}});
 EU=EU==i?0:(EU>i?EU-1:EU);ls.set("escala-eu",EU);fil.value="";
 ls.set("escala-x",XA);save();rosFill();rosChanged();
}
$("ros").onclick=e=>{const b=e.target.closest("button[data-del]");if(b)remover(+b.dataset.del)};
$("addv").onclick=()=>{BASE.push({n:"Novo vigia",m:"",v:"Efetivo",t:"D"});Object.keys(ALL).forEach(k=>pad(ALL[k]));save();rosFill();rosChanged()};
rosFill();
