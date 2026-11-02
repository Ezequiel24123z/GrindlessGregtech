// The self-contained page of a cost tree (lib/cost_tree.mjs result): inline CSS, vanilla JS and SVG, no network.

const CSS = String.raw`
*{box-sizing:border-box}
body{margin:0;background:#12151c;color:#d8dde8;font:13px/1.45 system-ui,Segoe UI,sans-serif}
main{max-width:1000px;margin:0 auto;padding:14px}
h1{font-size:20px;margin:0 0 2px}h2{font-size:15px;margin:22px 0 8px;border-bottom:1px solid #2a3040;padding-bottom:4px}
.sub{color:#8a93a8;margin-bottom:10px}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.card{background:#1b2030;border:1px solid #2a3040;border-radius:6px;padding:8px 10px}
.card b{display:block;font-size:18px;color:#fff}.card span{color:#8a93a8;font-size:11px}
.btns button{background:#1b2030;color:#d8dde8;border:1px solid #2f3750;padding:4px 10px;margin-right:4px;border-radius:4px;cursor:pointer}
.btns button.on{background:#3558c8;border-color:#5a7cf0;color:#fff}
#crumb{margin:8px 0;min-height:20px}#crumb span{color:#7ea2ff;cursor:pointer}#crumb span:last-child{color:#fff;cursor:default}#crumb i{color:#556;margin:0 4px;font-style:normal}
#wrap{position:relative;border:1px solid #2a3040;background:#0e1118}
svg text{font-size:11px;fill:#fff;pointer-events:none}svg rect{stroke:#0e1118;stroke-width:1}svg rect.z{cursor:zoom-in}svg rect:hover{stroke:#fff}
#tip{position:absolute;display:none;pointer-events:none;background:#000d;border:1px solid #566;border-radius:4px;padding:6px 8px;font-size:12px;z-index:5;max-width:380px}
.bar{display:grid;grid-template-columns:230px 1fr 90px;gap:6px;align-items:center;margin:2px 0}
.bar .l{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#b8c0d4}.bar .t{background:#1b2030;height:12px;border-radius:2px}.bar .t i{display:block;height:12px;background:#4d78e6;border-radius:2px}
.bar .n{text-align:right;font-variant-numeric:tabular-nums}
table{border-collapse:collapse;width:100%}th,td{padding:3px 6px;border-bottom:1px solid #232a3a;text-align:right;font-variant-numeric:tabular-nums}
th:first-child,td:first-child{text-align:left}th{color:#8a93a8;font-weight:600}
tr.flag td{background:#3a2228}.bad{color:#ff8a8a}.ok{color:#8fe3a0}.dim{color:#8a93a8}
ul{margin:4px 0;padding-left:18px}code{color:#c3d2ff}
.opt li{margin:2px 0}
`;

const CLIENT = String.raw`
var D=window.__D;
function $(id){return document.getElementById(id)}
function fmt(n){if(n===null||n===undefined||isNaN(n))return '-';var a=Math.abs(n);
 if(a>=1e15)return n.toExponential(2).replace('e+','e');
 var u=[[1e12,'T'],[1e9,'G'],[1e6,'M'],[1e4,'k']];
 for(var i=0;i<u.length;i++)if(a>=u[i][0])return (n/u[i][0]).toFixed(2)+u[i][1];
 if(a>=100||Math.abs(n-Math.round(n))<1e-9)return Math.round(n).toLocaleString('en-US');
 return n.toFixed(a>=1?2:4)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function short(k){var i=k.indexOf(':');return i>=0&&k.indexOf('fluid:')!==0?k.slice(i+1):k.replace('fluid:','~')}
var NAMES=['Base units','EU','Crafts'];
var metric=0,focus=[D.tree],SW=960,RH=24,MAXD=9;
var palette={};
function hue(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%360;return h}
function colour(n){
 if(n.o)return '#3b4256';
 if(n.x)return '#a03030';
 if(n.b)return '#2f7d4f';
 if(n.br)return '#5b5fc7';
 var era=D.tables.eras[n.y]||'';
 return 'hsl('+hue(era)+',45%,38%)'}
function el(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e}
function pct(x,t){return t>0?(100*x/t).toFixed(x/t<0.01?2:1)+'%':'-'}
function draw(){
 var root=focus[focus.length-1],svg=$('ice');svg.innerHTML='';
 var rootVal=D.tree.v[metric],focVal=root.v[metric],rows=0;
 (function lay(n,x,w,d){
  if(d>MAXD)return;rows=Math.max(rows,d+1);
  var r=el('rect',{x:x,y:d*RH,width:Math.max(w-0.5,0.5),height:RH-1,fill:colour(n)});
  if(n.c&&n!==root)r.setAttribute('class','z');
  r.addEventListener('mousemove',function(ev){tip(ev,n,rootVal,focVal)});
  r.addEventListener('mouseleave',function(){$('tip').style.display='none'});
  r.addEventListener('click',function(){if(n.c&&n!==root){focus.push(n);draw()}});
  svg.appendChild(r);
  if(w>46){var t=el('text',{x:x+4,y:d*RH+15});var nm=short(n.n);var max=Math.floor((w-8)/6.1);t.textContent=nm.length>max?nm.slice(0,Math.max(1,max-1))+'…':nm;svg.appendChild(t)}
  var val=n.v[metric];if(!n.c||!(val>0))return;
  var cx=x;for(var i=0;i<n.c.length;i++){var cw=w*n.c[i].v[metric]/val;if(cw>=0.7)lay(n.c[i],cx,cw,d+1);cx+=cw}
 })(root,0,SW,0);
 svg.setAttribute('viewBox','0 0 '+SW+' '+(rows*RH));svg.setAttribute('height',rows*RH);
 var c=$('crumb');c.innerHTML='';
 focus.forEach(function(n,i){var s=document.createElement('span');s.textContent=short(n.n);if(i<focus.length-1)s.onclick=function(){focus=focus.slice(0,i+1);draw()};c.appendChild(s);if(i<focus.length-1){var a=document.createElement('i');a.textContent='›';c.appendChild(a)}})}
function tip(ev,n,rv,fv){
 var t=$('tip'),h='<b>'+esc(n.n)+'</b>';
 if(n.q)h+='<br>count '+fmt(n.q);
 if(n.r!==undefined)h+='<br>runs '+fmt(n.r);
 if(n.i!==undefined)h+='<br>recipe <code>'+esc(D.tables.recipes[n.i])+'</code><br>machine '+esc(D.tables.machines[n.m])+' · era '+esc(D.tables.eras[n.y]);
 if(n.b)h+='<br>base resource';if(n.x)h+='<br>unreachable (no recipe)';if(n.o)h+='<br>inputs below the display threshold';
 h+='<hr style="border:0;border-top:1px solid #445">';
 for(var m=0;m<3;m++)h+=(m==metric?'<b>':'')+NAMES[m]+' '+fmt(n.v[m])+' ('+pct(n.v[m],D.tree.v[m])+' of total'+(fv!==D.tree.v[metric]&&m==metric?', '+pct(n.v[m],fv)+' of view':'')+')'+(m==metric?'</b>':'')+'<br>';
 t.innerHTML=h;t.style.display='block';
 var w=$('wrap').getBoundingClientRect();var x=ev.clientX-w.left+14,y=ev.clientY-w.top+14;
 if(x>w.width-390)x=ev.clientX-w.left-390;t.style.left=Math.max(0,x)+'px';t.style.top=y+'px'}
function setMetric(m){metric=m;[].forEach.call(document.querySelectorAll('#metric button'),function(b,i){b.className=i==m?'on':''});draw()}
function bars(id,rows,vf,lf,nf){
 var max=0;rows.forEach(function(r){max=Math.max(max,vf(r))});var h='';
 rows.forEach(function(r){var v=vf(r);h+='<div class="bar"><div class="l" title="'+esc(lf(r))+'">'+esc(lf(r))+'</div><div class="t"><i style="width:'+(max>0?Math.max(0.5,100*v/max):0)+'%"></i></div><div class="n">'+(nf?nf(r):fmt(v))+'</div></div>'});
 $(id).innerHTML=h||'<span class="dim">none</span>'}
var sub='crafts';
function groups(){
 var f=sub=='eu'?function(r){return r.eu}:function(r){return r.crafts};
 bars('eras',D.eras,f,function(r){return r.name});
 bars('types',D.types.slice(0,22),f,function(r){return short(r.name)})}
function setSub(s){sub=s;[].forEach.call(document.querySelectorAll('#sub button'),function(b){b.className=b.getAttribute('data-s')==s?'on':''});groups()}
function init(){
 var S=D.summary,cards=[['Crafts (runs)',fmt(S.crafts)],['EU',fmt(S.eu)],['Machine time (ticks, summed)',fmt(S.timeTicks)],['Recipe types',fmt(S.recipeTypes)],
  ['Distinct items',fmt(S.distinctItems)+' ('+fmt(S.craftedItems)+' crafted)'],['Base resources',fmt(S.baseItems)+' kinds'],['Base units',fmt(S.baseUnits)],['Creative items',fmt(S.creativeItems)]];
 $('cards').innerHTML=cards.map(function(c){return '<div class="card"><b>'+c[1]+'</b><span>'+c[0]+'</span></div>'}).join('');
 var C=D.consistency;$('cons').innerHTML='Root of the tree vs the summary: base '+fmt(C.base.tree)+' / '+fmt(C.base.summary)+', EU '+fmt(C.eu.tree)+' / '+fmt(C.eu.summary)+', crafts '+fmt(C.crafts.tree)+' / '+fmt(C.crafts.summary)+' — <b class="'+(C.ok?'ok':'bad')+'">'+(C.ok?'they match':'MISMATCH')+'</b>';
 bars('bases',D.bases.filter(function(b){return !b.fluid&&!b.free}).slice(0,25),function(b){return b.units},function(b){return b.key},function(b){return fmt(b.qty)});
 bars('fluids',D.bases.filter(function(b){return b.fluid&&!b.free}).slice(0,25),function(b){return b.qty},function(b){return b.key.replace('fluid:','')},function(b){return fmt(b.qty)+' mB'});
 groups();
 var h='<tr><th>Item</th><th>Computed</th><th>Docs</th><th>Gap</th><th>GTNH</th><th>10x target</th><th></th></tr>';
 D.comparison.forEach(function(r){
  var tg=r.target?fmt(r.target[0])+' – '+fmt(r.target[1]):'';
  var st=r.inTarget===null?'':(r.inTarget?'<span class="ok">in range</span>':'<span class="bad">outside</span>');
  h+='<tr class="'+(r.flag?'flag':'')+'"><td>'+esc(r.label)+' <span class="dim">'+esc(r.unit)+'</span></td><td>'+fmt(r.value)+'</td><td>'+fmt(r.docs)+'</td><td>'+(r.gap===null?'-':(r.gap>0?'+':'')+(100*r.gap).toFixed(1)+'%')+(r.flag?' ⚑':'')+'</td><td>'+(r.gtnh?fmt(r.gtnh):'')+'</td><td>'+tg+'</td><td>'+st+'</td></tr>'});
 $('cmp').innerHTML=h;
 var K=D.checks,u='';
 u+='<h3>Unreachable ('+K.unreachable.length+')</h3>'+(K.unreachable.length?'<ul>'+K.unreachable.slice(0,40).map(function(x){return '<li><code>'+esc(x.key)+'</code> ×'+fmt(x.count)+'</li>'}).join('')+'</ul>':'<span class="ok">none: every item of the tree has a recipe or is a base resource</span>');
 u+='<h3>Cut cycles ('+K.cycles.length+')</h3>'+(K.cycles.length?'<ul>'+K.cycles.map(function(x){return '<li><code>'+esc(x)+'</code></li>'}).join('')+'</ul>':'<span class="ok">none: the chosen recipes form a DAG</span>');
 u+='<h3>Close routes ('+K.closeTotal+', alternative within 10% of the chosen recipe)</h3>'+(K.close.length?'<ul>'+K.close.slice(0,25).map(function(x){return '<li><code>'+esc(x.key)+'</code> ×'+fmt(x.count)+': <code>'+esc(x.chosen)+'</code> vs <code>'+esc(x.alt)+'</code> ('+x.ratio.toFixed(3)+')</li>'}).join('')+'</ul>':'<span class="ok">none</span>');
 u+='<h3>Recipes serving several items ('+K.sharedRunsTotal+'; each item pays the whole run, so these runs count once per item)</h3>'+(K.sharedRuns.length?'<ul>'+K.sharedRuns.slice(0,15).map(function(x){return '<li><code>'+esc(x.recipe)+'</code>: '+x.items.map(function(i){return '<code>'+esc(i)+'</code>'}).join(', ')+'</li>'}).join('')+'</ul>':'<span class="ok">none</span>');
 if(K.problems.length)u+='<h3>Problems</h3><ul>'+K.problems.map(function(x){return '<li class="bad">'+esc(x)+'</li>'}).join('')+'</ul>';
 u+='<p class="dim">Solver: '+(K.solver.converged?'converged':'NOT converged ('+K.solver.improvementsLeft+' improvements left)')+'.</p>';
 $('checks').innerHTML=u;
 $('opts').innerHTML=D.options.map(function(o){return '<li>'+o+'</li>'}).join('');
 $('items').innerHTML='<tr><th>Item</th><th>Count</th><th>Runs</th><th>EU</th><th>Recipe type</th><th>Era</th></tr>'+D.items.map(function(r){return '<tr><td><code>'+esc(r.key)+'</code></td><td>'+fmt(r.count)+'</td><td>'+fmt(r.runs)+'</td><td>'+fmt(r.eu)+'</td><td>'+esc(short(r.type))+'</td><td>'+esc(r.era)+'</td></tr>'}).join('');
 setMetric(0)}
init();
`;

const safe = (o) => JSON.stringify(o).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const escHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/**
 * @param {object} res  buildCostTree result
 * @param {{comparison?: object[], options?: string[], title?: string, subtitle?: string, topItems?: number}} extra
 */
export function renderHtml(res, extra = {}) {
  const data = {
    summary: res.summary, consistency: res.consistency, tree: res.tree, tables: res.tables,
    items: res.items.slice(0, extra.topItems || 30).map((r) => ({ key: r.key, count: r.count, runs: r.runs, eu: r.eu, type: r.type, era: r.era })),
    bases: res.bases.slice(0, 300), eras: res.eras, types: res.types, checks: res.checks,
    comparison: extra.comparison || [], options: (extra.options || []).map(escHtml),
  };
  const title = extra.title || `${res.name}: cost tree`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escHtml(title)}</title>
<style>${CSS}</style></head><body><main>
<h1>${escHtml(title)}</h1><div class="sub">${escHtml(extra.subtitle || '')}</div>
<div class="cards" id="cards"></div><p class="dim" id="cons"></p>
<h2>Cost tree</h2>
<div class="btns" id="metric">Size by: <button onclick="setMetric(0)">Base units</button><button onclick="setMetric(1)">EU</button><button onclick="setMetric(2)">Crafts</button></div>
<div id="crumb"></div>
<div id="wrap"><svg id="ice" width="100%" viewBox="0 0 960 24" preserveAspectRatio="none"></svg><div id="tip"></div></div>
<p class="dim">Click a block to zoom in, use the breadcrumb to go back. Colour = era of the chosen recipe; green = base resource, grey = small inputs, red = unreachable.</p>
<h2>Top base resources (items, by weighted units)</h2><div id="bases"></div>
<h2>Fluids (mB)</h2><div id="fluids"></div>
<h2>By era and recipe type</h2><div class="btns" id="sub"><button data-s="crafts" class="on" onclick="setSub('crafts')">Crafts</button><button data-s="eu" onclick="setSub('eu')">EU</button></div>
<h3>Eras</h3><div id="eras"></div><h3>Recipe types (top 22)</h3><div id="types"></div>
<h2>Computed vs docs/eras/maxplus.md, GTNH and the 10x target</h2><table id="cmp"></table>
<p class="dim">⚑ = the computed figure is more than 20% away from the docs figure.</p>
<h2>Checks</h2><div id="checks"></div>
<h2>Most expensive crafted items (by EU)</h2><table id="items"></table>
<h2>Options</h2><ul class="opt" id="opts"></ul>
</main>
<script>window.__D=${safe(data)};</script>
<script>${CLIENT}</script></body></html>
`;
}
