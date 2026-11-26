// SKYVIA demo search — UI-only sample flights (no live airline API yet)
const $ = id => document.getElementById(id);
let trip = 'round';
const today = new Date(); today.setHours(0,0,0,0);
const dateISO = d => { const x=new Date(today); x.setDate(x.getDate()+d); return x.toISOString().slice(0,10); };
const setDefaults = () => {
  if (!$('depart').value) $('depart').value = dateISO(7);
  if (!$('return').value) $('return').value = dateISO(11);
  $('depart').min = dateISO(0);
  $('return').min = $('depart').value;
};
setDefaults();
$('depart').addEventListener('change', () => {
  $('return').min = $('depart').value;
  if ($('return').value < $('depart').value) $('return').value = $('depart').value;
});
document.querySelectorAll('.trip-tabs button').forEach(btn => btn.addEventListener('click', () => {
  trip = btn.dataset.trip;
  document.querySelectorAll('.trip-tabs button').forEach(b => b.classList.toggle('active', b === btn));
  $('returnWrap').style.display = trip === 'one' ? 'none' : 'flex';
  if (trip === 'multi') showMultiCity(); else hideMultiCity();
}));
$('swap').addEventListener('click', () => { const a=$('from').value; $('from').value=$('to').value; $('to').value=a; });
function showMultiCity(){
 let box=$('multiCityBox');
 if(!box){box=document.createElement('div');box.id='multiCityBox';box.className='multi-city-box';box.innerHTML='<h3>Multi-city journey</h3><div class="multi-row"><label>FROM<input value="Mumbai (BOM)"></label><label>TO<input placeholder="City or airport"></label><label>DATE<input type="date"></label></div><div class="multi-row"><label>FROM<input placeholder="Previous destination"></label><label>TO<input placeholder="City or airport"></label><label>DATE<input type="date"></label></div><button type="button" id="addSegment" class="outline">Add another flight</button>';document.querySelector('.detail-grid').insertAdjacentElement('afterend',box);box.querySelectorAll('input[type=date]').forEach((i,n)=>i.value=dateISO(7+n*3));box.querySelector('#addSegment').onclick=()=>{const row=document.createElement('div');row.className='multi-row';row.innerHTML='<label>FROM<input placeholder="Previous destination"></label><label>TO<input placeholder="City or airport"></label><label>DATE<input type="date"></label>';row.querySelector('input[type=date]').value=dateISO(7+box.querySelectorAll('.multi-row').length*3);box.querySelector('#addSegment').before(row);};}
}
function hideMultiCity(){ $('multiCityBox')?.remove(); }
function airportAutocomplete(input){
 const airports=[['Mumbai','BOM','Chhatrapati Shivaji Maharaj International Airport'],['Delhi','DEL','Indira Gandhi International Airport'],['Bengaluru','BLR','Kempegowda International Airport'],['Chennai','MAA','Chennai International Airport'],['Hyderabad','HYD','Rajiv Gandhi International Airport'],['Kolkata','CCU','Netaji Subhas Chandra Bose International Airport'],['Goa','GOI','Goa International Airport'],['Ahmedabad','AMD','Sardar Vallabhbhai Patel International Airport'],['Pune','PNQ','Pune Airport'],['Jaipur','JAI','Jaipur International Airport'],['Dubai','DXB','Dubai International Airport'],['London','LHR','Heathrow Airport'],['Singapore','SIN','Singapore Changi Airport'],['New York','JFK','John F Kennedy International Airport'],['Bangkok','BKK','Suvarnabhumi Airport']];
 const wrap=document.createElement('div');wrap.className='airport-suggestions';input.parentElement.appendChild(wrap);
 input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();wrap.innerHTML='';if(!q)return;airports.filter(a=>a.join(' ').toLowerCase().includes(q)).slice(0,6).forEach(a=>{const item=document.createElement('button');item.type='button';item.innerHTML='<strong>'+a[0]+' ('+a[1]+')</strong><small>'+a[2]+'</small>';item.onclick=()=>{input.value=a[0]+' ('+a[1]+')';wrap.innerHTML='';};wrap.appendChild(item);});});
 document.addEventListener('click',e=>{if(!wrap.contains(e.target)&&e.target!==input)wrap.innerHTML='';});
}
airportAutocomplete($('from'));airportAutocomplete($('to'));
const sampleFlights=[{air:'IndiGo',code:'6E 204',depart:'06:10',arrive:'08:20',duration:'2h 10m',stops:0,price:5890},{air:'Air India',code:'AI 864',depart:'09:05',arrive:'11:25',duration:'2h 20m',stops:0,price:6420},{air:'Akasa Air',code:'QP 112',depart:'13:30',arrive:'16:10',duration:'2h 40m',stops:1,price:5190},{air:'IndiGo',code:'6E 501',depart:'18:45',arrive:'20:55',duration:'2h 10m',stops:0,price:7340}];
let liveOffers=[];
function formatDuration(iso){if(!iso)return "—";const m=iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);return m?((m[1]||0)+"h "+(m[2]||0)+"m"):"—";}
function renderFlights(){
 let list=[...liveOffers];
 if($('nonstop').checked)list=list.filter(f=>f.stops===0);
 const airline=$('airlineFilter').value;if(airline!=='all')list=list.filter(f=>(f.airline||"").toLowerCase().includes(airline.toLowerCase()));
 const max=Number($('maxPrice').value||0);if(max>0)list=list.filter(f=>f.price<=max);
 const sort=$('sort').value;if(sort==='price')list.sort((a,b)=>a.price-b.price);if(sort==='duration')list.sort((a,b)=>(a.durationMinutes||99999)-(b.durationMinutes||99999));
 $('flightList').innerHTML=list.length?list.map(f=>'<article class="flight-card"><div class="airline">✈ '+f.airline+'<small>'+f.flightNumbers+' · '+(f.stops?' '+f.stops+' stop(s)':'Non-stop')+'</small></div><div class="times"><div><div class="time">'+f.depart+'</div><small>'+f.origin+'</small></div><div class="middle">'+f.duration+'<div class="line"></div>'+(f.stops?f.stops+' stop(s)':'Direct')+'</div><div><div class="time">'+f.arrive+'</div><small>'+f.destination+'</small></div></div><div class="price">'+f.currency+' '+f.price.toLocaleString('en-IN')+'<small>live offer</small><button class="book-demo" data-offer="'+f.id+'">View flight</button></div></article>').join(''):'<p class="no-results">No live flights match your filters.</p>';
}
$('sort').onchange=renderFlights;$('nonstop').onchange=renderFlights;$('airlineFilter').onchange=renderFlights;$('maxPrice').oninput=renderFlights;
$('searchForm').addEventListener('submit',async e=>{
 e.preventDefault();const destination=$('to').value.trim();if(!destination){alert('Please enter your destination.');$('to').focus();return;}if(!$('depart').value){alert('Please select a departure date.');$('depart').focus();return;}
 if(trip==='round'&&$('return').value&&$('return').value<$('depart').value){alert('Return date cannot be earlier than departure date.');$('return').focus();return;}
 const code=x=>{const m=x.match(/\(([A-Z]{3})\)/);return m?m[1]:x.trim().toUpperCase().slice(0,3)};
 const origin=code($('from').value),dest=code(destination);const travellerText=$('travellers').value;const adults=Number((travellerText.match(/\d+/)||[1])[0]);const cabin=travellerText.toLowerCase().includes('business')?'business':travellerText.toLowerCase().includes('premium')?'premium_economy':'economy';
 $('routeTitle').textContent=origin+' → '+dest;$('searchSummary').textContent=$('depart').value+(trip==='round'?' · Return '+$('return').value:' · One way')+' · '+travellerText+' · Live search';
 $('results').classList.remove('hidden');$('flightList').innerHTML='<p class="no-results">Searching live flight offers…</p>';$('results').scrollIntoView({behavior:'smooth'});
 try{const resp=await fetch('/api/flights',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origin,destination:dest,departureDate:$('depart').value,returnDate:trip==='round'?$('return').value:null,adults,cabin})});const data=await resp.json();if(!resp.ok||data.error){liveOffers=[];$('flightList').innerHTML='<p class="no-results">'+(data.error||'Live search failed')+'</p>';return;}
 liveOffers=(data.offers||[]).flatMap(o=>(o.legs||[]).map(l=>({id:o.id,price:o.price,currency:o.currency,airline:l.airline,flightNumbers:l.flightNumbers,origin:l.origin,destination:l.destination,depart:l.departure?new Date(l.departure).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'—',arrive:l.arrival?new Date(l.arrival).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'—',duration:formatDuration(l.duration),durationMinutes:(l.duration||'').replace(/PT/,'').match(/(\d+)H/)?.[1]*60+Number((l.duration||'').match(/(\d+)M/)?.[1]||0),stops:l.stops})));renderFlights();if(!liveOffers.length)$('flightList').innerHTML='<p class="no-results">No live offers returned for this search.</p>';
 }catch(err){liveOffers=[];$('flightList').innerHTML='<p class="no-results">Could not connect to live search. Please try again.</p>';}
});
$('editSearch').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
document.querySelectorAll('.destination').forEach(btn=>btn.onclick=()=>{$('to').value=btn.dataset.city;$('searchForm').scrollIntoView({behavior:'smooth'});});
$('flightList').addEventListener('click',e=>{if(e.target.closest('.book-demo'))alert('Demo only: live fares and booking are not connected yet.');});
window.addEventListener('load',setDefaults);
