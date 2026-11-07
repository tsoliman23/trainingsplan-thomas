/* MyTraining 1.4 – optional online product lookup, local barcode reader and offline library. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const BASE='https://world.openfoodfacts.org';
const FOOD_KEY='mytraining-food-library-v1', CACHE_KEY='mytraining-off-product-cache-v1', FAV_KEY='mytraining-off-favorites-v1', RECENT_KEY='mytraining-off-recent-v1';
const MAX_CACHE=80, MAX_FOOD=500, FIELDS='code,product_name,product_name_de,product_name_en,brands,quantity,nutriments,nutrition_data_per,nutrition_data_prepared_per,serving_size,image_front_small_url';
const locales={de:'de-DE',en:'en-GB',fr:'fr-FR','ar-EG':'ar-EG'};
const WORDS={
 de:{title:'Produktdatenbank',search:'Produkt oder Hersteller suchen',find:'Online suchen',scan:'Barcode scannen',manual:'Barcode eingeben',hint:'Suche benötigt Internet. Produktdaten: Open Food Facts (ODbL). Nährwerte sind Community-Angaben und können falsch oder unvollständig sein.',favs:'Favoriten',recent:'Zuletzt verwendet',results:'Suchergebnisse',none:'Keine Treffer gefunden.',barcode:'Barcode',grams:'Menge (g/ml)',meal:'Mahlzeit',add:'Zur Mahlzeit hinzufügen',save:'In meiner Sammlung speichern',favorite:'Favorit',unfavorite:'Favorit entfernen',per:'Nährwerte je 100',quantity:'Packungsmenge',offline:'Offline: Nur gespeicherte Produkte sind verfügbar.',loading:'Produkte werden geladen …',error:'Abfrage fehlgeschlagen. Internetverbindung überprüfen oder später erneut versuchen.',missing:'Nährwerte unvollständig – bitte Produktetikett prüfen.',invalid:'Bitte gültigen Barcode mit 8 bis 14 Ziffern eingeben.',camera:'Kamera starten',stop:'Kamera schließen',cameraHint:'Barcode gut beleuchten und waagerecht in die Kameramitte halten. Falls die Erkennung nicht klappt, Nummer manuell eingeben.',cameraError:'Kamera nicht verfügbar oder Berechtigung verweigert. Barcode manuell eingeben.',notFound:'Produkt nicht gefunden.',saved:'Lebensmittel gespeichert',added:'Zur Mahlzeit hinzugefügt',readonly:'Dieser Tag ist nicht bearbeitbar.',limit:'Sammlung ist voll (maximal 500 Produkte).',local:'Gespeichert',open:'Details',back:'Zurück',onlyOnline:'Für neue Produkte ist eine Internetverbindung nötig.',empty:'Noch keine gespeicherten Produkte.',brand:'Hersteller',lookup:'Suchen',check:'Angaben mit der Verpackung abgleichen.'},
 en:{title:'Food database',search:'Search product or brand',find:'Search online',scan:'Scan barcode',manual:'Enter barcode',hint:'Online search requires internet. Product data: Open Food Facts (ODbL). Community data may be incorrect or incomplete.',favs:'Favorites',recent:'Recently used',results:'Search results',none:'No matches found.',barcode:'Barcode',grams:'Amount (g/ml)',meal:'Meal',add:'Add to meal',save:'Save to my foods',favorite:'Favorite',unfavorite:'Remove favorite',per:'Nutrients per 100',quantity:'Package size',offline:'Offline: only saved products are available.',loading:'Loading products …',error:'Request failed. Check the connection and try again.',missing:'Missing nutrition data – check the product label.',invalid:'Enter a valid barcode (8–14 digits).',camera:'Start camera',stop:'Close camera',cameraHint:'Hold the barcode horizontally in good light. Enter the code manually if needed.',cameraError:'Camera unavailable or permission denied. Enter the code manually.',notFound:'Product not found.',saved:'Food saved',added:'Added to meal',readonly:'This day is read-only.',limit:'Library is full (500 products max).',local:'Saved',open:'Details',back:'Back',onlyOnline:'Internet is needed to find new products.',empty:'No saved products yet.',brand:'Brand',lookup:'Look up',check:'Check nutrition information against the package.'},
 fr:{title:'Base alimentaire',search:'Rechercher produit ou marque',find:'Rechercher en ligne',scan:'Scanner le code-barres',manual:'Saisir le code-barres',hint:'Recherche en ligne uniquement. Données : Open Food Facts (ODbL). Les données communautaires peuvent être erronées ou incomplètes.',favs:'Favoris',recent:'Récents',results:'Résultats',none:'Aucun résultat.',barcode:'Code-barres',grams:'Quantité (g/ml)',meal:'Repas',add:'Ajouter au repas',save:'Enregistrer dans mes aliments',favorite:'Favori',unfavorite:'Retirer des favoris',per:'Valeurs pour 100',quantity:'Taille du paquet',offline:'Hors ligne : seuls les produits enregistrés sont disponibles.',loading:'Chargement …',error:'Échec de la requête. Vérifier la connexion.',missing:'Valeurs incomplètes, vérifier l’étiquette.',invalid:'Saisir un code de 8 à 14 chiffres.',camera:'Ouvrir la caméra',stop:'Fermer la caméra',cameraHint:'Placer le code-barres horizontalement sous une bonne lumière.',cameraError:'Caméra indisponible. Saisir le code manuellement.',notFound:'Produit introuvable.',saved:'Aliment enregistré',added:'Ajouté au repas',readonly:'Cette date ne peut pas être modifiée.',limit:'Bibliothèque pleine (500 produits).',local:'Enregistré',open:'Détails',back:'Retour',onlyOnline:'Connexion requise pour rechercher.',empty:'Aucun produit enregistré.',brand:'Marque',lookup:'Chercher',check:'Comparer avec l’emballage.'},
 'ar-EG':{title:'قاعدة بيانات الأطعمة',search:'ابحث عن منتج أو شركة',find:'بحث على الإنترنت',scan:'امسح الباركود',manual:'اكتب الباركود',hint:'البحث محتاج إنترنت. البيانات من Open Food Facts (ODbL) وممكن تكون ناقصة أو غلط.',favs:'المفضلة',recent:'المستخدمة حديثاً',results:'نتائج البحث',none:'لا توجد نتائج.',barcode:'الباركود',grams:'الكمية (جرام/مل)',meal:'الوجبة',add:'أضف للوجبة',save:'احفظ في أطعمتك',favorite:'مفضل',unfavorite:'إزالة من المفضلة',per:'القيم لكل ١٠٠',quantity:'حجم العبوة',offline:'بدون إنترنت: المنتجات المحفوظة بس.',loading:'جارٍ البحث …',error:'فشل الاتصال. حاول تاني.',missing:'بيانات ناقصة – راجع العبوة.',invalid:'اكتب باركود صحيح من ٨ إلى ١٤ رقم.',camera:'افتح الكاميرا',stop:'اقفل الكاميرا',cameraHint:'خلّي الباركود واضح وأفقي في نص الكاميرا.',cameraError:'الكاميرا غير متاحة. اكتب الباركود.',notFound:'المنتج غير موجود.',saved:'تم حفظ الطعام',added:'تمت الإضافة للوجبة',readonly:'اليوم ده مش متاح للتعديل.',limit:'المكتبة ممتلئة (٥٠٠ منتج).',local:'محفوظ',open:'التفاصيل',back:'رجوع',onlyOnline:'محتاج إنترنت لمنتجات جديدة.',empty:'مافيش منتجات محفوظة.',brand:'الشركة',lookup:'بحث',check:'راجع البيانات على العبوة.'}
};
const lang=()=>window.MyTrainingI18n?.current?.()||'de';
const tr=k=>(WORDS[lang()]||WORDS.de)[k]||k;
const fmt=n=>Number(n).toLocaleString(locales[lang()]||'de-DE',{maximumFractionDigits:1});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fallback;}catch{return fallback;}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
const safeNum=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))&&Number(v)>=0?Number(v):null);
const nutritionKeys=['calories','protein','carbs','fat'];
const getLib=()=>{const v=read(FOOD_KEY,[]);return Array.isArray(v)?v:[];};
const getCache=()=>{const v=read(CACHE_KEY,[]);return Array.isArray(v)?v:[];};
const getFav=()=>{const v=read(FAV_KEY,[]);return Array.isArray(v)?v:[];};
const getRecent=()=>{const v=read(RECENT_KEY,[]);return Array.isArray(v)?v:[];};
let built=false,results=[],selected=null,request=null,videoStream=null,readerTimer=null,detector=null,scanActive=false;
const validCode=v=>/^\d{8,14}$/.test(String(v||''));
function normalizeProduct(raw){
 if(!raw||typeof raw!=='object')return null;
 const n=raw.nutriments||{},barcode=String(raw.code||raw._id||'').trim();
 const name=String(raw.product_name_de||raw.product_name||raw.product_name_en||'').trim().slice(0,160);
 if(!name)return null;
 const kinds=raw.nutrition_data_per==='100ml'?'ml':'g';
 let calories=safeNum(n['energy-kcal_100g']);
 if(calories===null&&safeNum(n.energy_100g)!==null)calories=Number(n.energy_100g)/4.184;
 const values={calories,protein:safeNum(n.proteins_100g),carbs:safeNum(n.carbohydrates_100g),fat:safeNum(n.fat_100g)};
 return {id:barcode||'off-'+name.toLowerCase(),code:barcode,name,brand:String(raw.brands||'').trim().slice(0,100),quantity:String(raw.quantity||'').slice(0,60),unit:kinds,values,source:'Open Food Facts',ts:Date.now()};
}
function complete(p){return p&&nutritionKeys.every(k=>safeNum(p.values?.[k])!==null);}
function cacheProducts(rows){const existing=getCache();const map=new Map(existing.map(x=>[x.id,x]));for(const p of rows)if(p)map.set(p.id,p);write(CACHE_KEY,[...map.values()].sort((a,b)=>b.ts-a.ts).slice(0,MAX_CACHE));}
function cacheSearch(q){const query=String(q||'').toLocaleLowerCase();return [...getLib().filter(x=>(x.name+' '+(x.brand||'')).toLocaleLowerCase().includes(query)).map(x=>({id:x.id,code:x.code||'',name:x.name,brand:x.brand||'',unit:x.unit||'g',quantity:x.quantity||'',values:{calories:safeNum(x.calories),protein:safeNum(x.protein),carbs:safeNum(x.carbs),fat:safeNum(x.fat)},source:'Lokale Sammlung',ts:Date.now()})),...getCache().filter(x=>(x.name+' '+x.brand).toLocaleLowerCase().includes(query))].slice(0,30);}
function status(msg){if($('mt14-status'))$('mt14-status').textContent=msg||'';}
function build(){if(built||!$('mt132-library')||!window.MyTrainingNutrition132)return;built=true;
 const host=document.createElement('section');host.id='mt14-products';host.className='mt14-products';host.innerHTML=`<h4 id="mt14-title"></h4><p class="mt14-note" id="mt14-hint"></p><form class="mt14-search" id="mt14-search-form" autocomplete="off"><input id="mt14-query" type="search" minlength="2" maxlength="80" aria-label="Suche nach Lebensmitteln"><button type="submit" id="mt14-search-button"></button></form><div class="mt14-buttons"><button type="button" id="mt14-scan-open"></button><button type="button" id="mt14-barcode-open"></button></div><form id="mt14-barcode-form" class="mt14-barcode" hidden><input id="mt14-code" type="text" inputmode="numeric" pattern="[0-9]{8,14}" maxlength="14" aria-label="Barcode"><button id="mt14-barcode-button" type="submit"></button></form><div id="mt14-results" class="mt14-results"></div><div id="mt14-detail" hidden></div><p id="mt14-status" class="mt14-status" role="status" aria-live="polite"></p><div id="mt14-scanner" class="mt14-scanner" hidden><p id="mt14-camera-help"></p><video id="mt14-video" playsinline muted autoplay aria-label="Barcode-Kamera"></video><button type="button" id="mt14-stop"></button></div>`;
 $('mt132-library').insertAdjacentElement('beforebegin',host);
 $('mt14-search-form').addEventListener('submit',e=>{e.preventDefault();search();});
 $('mt14-barcode-form').addEventListener('submit',e=>{e.preventDefault();lookupCode($('mt14-code').value.trim());});
 $('mt14-barcode-open').onclick=()=>{$('mt14-barcode-form').hidden=!$('mt14-barcode-form').hidden;};
 $('mt14-scan-open').onclick=()=>{if(scanActive)stopScanner();else startScanner();};
 $('mt14-stop').onclick=stopScanner;
 $('mt14-results').addEventListener('click',e=>{const b=e.target.closest('[data-open-product]');if(b){const p=results[Number(b.dataset.openProduct)];if(p)openProduct(p);}});
 $('mt14-detail').addEventListener('click',detailClick);
 document.addEventListener('mytraining-language-change',translate);
 document.addEventListener('mytraining-date-changed',()=>{if(!selected)return;renderDetail();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopScanner();});
 window.addEventListener('pagehide',stopScanner);
 translate();renderResults([],true);
}
function translate(){if(!built)return;
 const ids={'mt14-title':'title','mt14-hint':'hint','mt14-search-button':'find','mt14-scan-open':'scan','mt14-barcode-open':'manual','mt14-barcode-button':'lookup','mt14-camera-help':'cameraHint','mt14-stop':'stop'};
 for(const [id,k] of Object.entries(ids))$(id).textContent=tr(k);
 $('mt14-query').placeholder=tr('search');$('mt14-code').placeholder=tr('barcode');if(selected)renderDetail();renderResults(results,!results.length);
}
function renderResults(rows,initial=false){if(!built)return;results=rows;
 const root=$('mt14-results');
 if(!rows.length){root.innerHTML=initial?quickList():`<p class="muted">${esc(tr('none'))}</p>`;if(initial){root.querySelectorAll('[data-open-product]').forEach(btn=>btn.addEventListener('click',()=>{const p=getCache().find(x=>x.id===btn.dataset.productId)||cacheSearch('').find(x=>x.id===btn.dataset.productId);if(p)openProduct(p);}));}return;}
 root.innerHTML=`<h5>${esc(tr('results'))}</h5>`+rows.map((p,i)=>`<button type="button" class="mt14-result" data-open-product="${i}"><span><strong>${esc(p.name)}</strong><small>${esc(p.brand||'')} ${p.code?'· '+esc(p.code):''}</small></span><small>${complete(p)?fmt(p.values.calories)+' kcal / 100 '+(p.unit==='ml'?'ml':'g'):'—'}</small></button>`).join('');
}
function quickList(){const cache=getCache();const lib=cacheSearch('');const all=new Map([...lib,...cache].map(p=>[p.id,p]));const fav=getFav(),recent=getRecent(),selection=[...fav,...recent].map(id=>all.get(id)).filter(Boolean).slice(0,12);
 return selection.length?`<h5>${esc(tr('favs'))} / ${esc(tr('recent'))}</h5>`+selection.map(p=>`<button type="button" class="mt14-result" data-open-product="true" data-product-id="${esc(p.id)}"><span><strong>${esc(p.name)}</strong><small>${esc(p.brand||'')}</small></span><span>${fav.includes(p.id)?'★':'›'}</span></button>`).join(''):`<p class="muted">${esc(tr('empty'))}</p>`;
}
function queryURL(q){const params=new URLSearchParams({search_terms:q,search_simple:'1',action:'process',json:'1',page_size:'15',fields:FIELDS,sort_by:'unique_scans_n'});return BASE+'/cgi/search.pl?'+params;}
async function fetchJson(url){const controller=new AbortController();request?.abort();request=controller;const timeout=setTimeout(()=>controller.abort(),11000);
 try{const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}});if(!response.ok)throw Error('HTTP '+response.status);return await response.json();}finally{clearTimeout(timeout);if(request===controller)request=null;}}
async function search(){if(!built)return;const q=$('mt14-query').value.trim();if(q.length<2){status(tr('search'));return;}
 selected=null;$('mt14-detail').hidden=true;
 const local=cacheSearch(q);renderResults(local);if(!navigator.onLine){status(tr('offline'));return;}
 status(tr('loading'));$('mt14-search-button').disabled=true;
 try{const json=await fetchJson(queryURL(q));const remote=(Array.isArray(json.products)?json.products:[]).map(normalizeProduct).filter(Boolean);cacheProducts(remote);
 const unique=new Map([...local,...remote].map(x=>[x.id,x]));renderResults([...unique.values()]);status('');}
 catch(e){if(e.name!=='AbortError')status(tr('error'));else status(tr('error'));if(!local.length)renderResults(local);}
 finally{$('mt14-search-button').disabled=false;}
}
async function lookupCode(barcode){const code=String(barcode||'').replace(/\s/g,'');if(!validCode(code)){status(tr('invalid'));return;}
 $('mt14-code').value=code;stopScanner();const local=cacheSearch('').find(p=>p.code===code)||getCache().find(x=>x.code===code);
 if(local){openProduct(local);if(!navigator.onLine){status(tr('offline'));return;}}
 if(!navigator.onLine){status(local?'':tr('onlyOnline'));return;}
 status(tr('loading'));
 try{const json=await fetchJson(`${BASE}/api/v2/product/${encodeURIComponent(code)}.json?fields=${FIELDS}`);
  if(!json?.product||Number(json.status)===0){status(tr('notFound'));return;}
  const p=normalizeProduct({...json.product,code});if(!p){status(tr('notFound'));return;}cacheProducts([p]);openProduct(p);status('');}
 catch(e){status(tr('error'));}
}
function openProduct(p){selected=p;write(RECENT_KEY,[p.id,...getRecent().filter(x=>x!==p.id)].slice(0,30));renderDetail();}
function renderDetail(){const p=selected,root=$('mt14-detail');if(!p){root.hidden=true;return;}const same=root.dataset.productId===p.id;const oldAmount=same?root.querySelector('#mt14-grams')?.value:'100';const oldMeal=same?root.querySelector('#mt14-meal')?.value:'breakfast';root.hidden=false;root.dataset.productId=p.id;
 const isFav=getFav().includes(p.id);const unit=p.unit==='ml'?'ml':'g';
 root.innerHTML=`<div class="mt14-detail-head"><div><h5>${esc(p.name)}</h5><p>${esc(p.brand||'')} ${p.quantity?'· '+esc(p.quantity):''}</p><small>${esc(p.code||'')} · ${esc(p.source||'Open Food Facts')}</small></div><button type="button" class="mt14-star" data-mt14-action="favorite" aria-label="${esc(tr(isFav?'unfavorite':'favorite'))}">${isFav?'★':'☆'}</button></div><p class="mt14-source">${esc(tr('per'))} ${unit} · ${esc(tr('check'))}</p><div class="mt14-nutrition">${nutritionKeys.map(k=>`<div><small>${esc({calories:'kcal',protein:lang()==='de'?'Eiweiß':'Protein',carbs:lang()==='de'?'Kohlenhydrate':'Carbs',fat:lang()==='de'?'Fett':'Fat'}[k])}</small><strong>${p.values[k]===null?'–':fmt(p.values[k])}</strong></div>`).join('')}</div>${!complete(p)?`<p class="mt14-warning">${esc(tr('missing'))}</p>`:''}<div class="mt14-entry"><label>${esc(tr('grams'))}<input id="mt14-grams" type="number" inputmode="decimal" min="1" max="10000" step="1" value="${esc(oldAmount||'100')}"></label><label>${esc(tr('meal'))}<select id="mt14-meal"><option value="breakfast">${lang()==='de'?'Frühstück':lang()==='en'?'Breakfast':lang()==='fr'?'Petit-déjeuner':'الفطار'}</option><option value="lunch">${lang()==='de'?'Mittagessen':lang()==='en'?'Lunch':lang()==='fr'?'Déjeuner':'الغداء'}</option><option value="dinner">${lang()==='de'?'Abendessen':lang()==='en'?'Dinner':lang()==='fr'?'Dîner':'العشاء'}</option><option value="snacks">${lang()==='de'?'Snacks':lang()==='en'?'Snacks':lang()==='fr'?'Collations':'وجبات خفيفة'}</option></select></label></div><p id="mt14-calculated" class="mt14-calculated"></p><div class="mt14-detail-actions"><button type="button" data-mt14-action="save">${esc(tr('save'))}</button><button type="button" data-mt14-action="add" ${complete(p)&&window.MyTrainingNutrition?.editable?.()?'':'disabled'}>${esc(tr('add'))}</button></div>`;
 $('mt14-meal').value=oldMeal||'breakfast';$('mt14-grams').addEventListener('input',calculate);
 calculate();}
function calculate(){if(!selected||!$('mt14-grams'))return;const amount=Number($('mt14-grams').value),factor=Number.isFinite(amount)&&amount>0?amount/100:0;
 $('mt14-calculated').textContent=complete(selected)&&factor?`${fmt(selected.values.calories*factor)} kcal · ${fmt(selected.values.protein*factor)} g P · ${fmt(selected.values.carbs*factor)} g C · ${fmt(selected.values.fat*factor)} g F`:tr('missing');}
function detailClick(e){const b=e.target.closest('[data-mt14-action]');if(!b||!selected)return;const action=b.dataset.mt14Action;
 if(action==='favorite'){const fav=getFav(),list=fav.includes(selected.id)?fav.filter(x=>x!==selected.id):[selected.id,...fav];write(FAV_KEY,list.slice(0,100));renderDetail();return;}
 if(action==='save')saveProduct();if(action==='add')addToMeal();}
function saveProduct(){if(!selected)return;const p=selected;if(!complete(p)){status(tr('missing'));return;}
 const foods=getLib(),key='off-'+p.id,old=foods.findIndex(f=>f.id===key);
 if(foods.length>=MAX_FOOD&&old<0){status(tr('limit'));return;}
 const food={id:key,name:p.name,brand:p.brand,code:p.code,quantity:p.quantity,unit:p.unit,portion:`100 ${p.unit==='ml'?'ml':'g'}`,source:'Open Food Facts',...p.values};
 if(old>=0)foods[old]=food;else foods.push(food);if(write(FOOD_KEY,foods)){status(tr('saved'));window.MyTrainingNutrition132?.refresh?.();window.MyTrainingToast?.success?.(tr('saved'));}else status(tr('error'));
}
function addToMeal(){const p=selected;if(!p||!complete(p))return;
 if(!window.MyTrainingNutrition?.editable?.()){status(tr('readonly'));return;}
 const grams=Number($('mt14-grams').value);if(!Number.isFinite(grams)||grams<=0||grams>10000){status(tr('grams'));return;}
 const date=window.MyTrainingNutrition.selectedDate(),entry=window.MyTrainingNutrition.loadEntry(date),factor=grams/100;
 const item={id:'offi'+Date.now().toString(36)+Math.random().toString(36).slice(2,8),foodId:'off-'+p.id,name:p.name+(p.brand?' · '+p.brand:''),portion:`100 ${p.unit==='ml'?'ml':'g'}`,meal:$('mt14-meal').value,servings:Math.round(factor*10000)/10000,amount:grams,code:p.code,source:'Open Food Facts'};
 for(const k of nutritionKeys)item[k]=Math.round(p.values[k]*factor*10)/10;
 entry.items=[...(Array.isArray(entry.items)?entry.items:[]),item];
 if(!window.TrainingCalendar?.setNutritionForDate?.(date,entry)){status(tr('error'));return;}
 window.MyTrainingNutrition?.refreshTotals?.();window.MyTrainingNutrition132?.refresh?.();window.MyTrainingToast?.success?.(tr('added'));status(tr('added'));}
/* Native BarcodeDetector is preferred. For iOS builds without the API, decode EAN-13/UPC-A
   locally from video luminance samples. Manual EAN entry is always available. */
const L=['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
const G=['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'];
const R=['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'];
const parity=['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];
function decodeBits(bits){if(bits.slice(0,3)!=='101'||bits.slice(45,50)!=='01010'||bits.slice(92,95)!=='101')return null;let code='',p='';for(let i=0;i<6;i++){const s=bits.slice(3+i*7,10+i*7);let n=L.indexOf(s),type='L';if(n<0){n=G.indexOf(s);type='G';}if(n<0)return null;code+=n;p+=type;}const first=parity.indexOf(p);if(first<0)return null;code=String(first)+code;for(let i=0;i<6;i++){const n=R.indexOf(bits.slice(50+i*7,57+i*7));if(n<0)return null;code+=n;}const digits=code.split('').map(Number);const sum=digits.slice(0,12).reduce((s,n,i)=>s+n*(i%2?3:1),0);return (10-sum%10)%10===digits[12]?code:null;}
function decodeLine(pixels){const len=pixels.length;for(const inversion of [false,true]){const mn=Math.min(...pixels),mx=Math.max(...pixels);if(mx-mn<50)continue;const threshold=(mn+mx)/2;const black=pixels.map(v=>(v<threshold)!==inversion);
 for(let w=1;w<=Math.min(5.5,len/95);w+=.25){const width=95*w;for(let x=4;x+width<len-4;x+=Math.max(1,w*.8)){
  const bit=i=>black[Math.floor(x+(i+.5)*w)]?'1':'0';if(bit(0)!=='1'||bit(1)!=='0'||bit(2)!=='1'||bit(45)!=='0'||bit(46)!=='1'||bit(47)!=='0'||bit(48)!=='1'||bit(49)!=='0'||bit(92)!=='1'||bit(93)!=='0'||bit(94)!=='1')continue;
  let bits='';for(let i=0;i<95;i++)bits+=bit(i);const code=decodeBits(bits);if(code)return code;
 }}}
 return null;}
function decodeFrame(canvas,ctx){const width=canvas.width,height=canvas.height;let image;try{image=ctx.getImageData(0,0,width,height);}catch{return null;}
 for(const y of [0.4,0.47,0.53,0.6].map(p=>Math.round(height*p))){const row=[];for(let x=0;x<width;x++){const i=(y*width+x)*4;row.push(Math.round(.299*image.data[i]+.587*image.data[i+1]+.114*image.data[i+2]));}const code=decodeLine(row);if(code)return code;}
 return null;}
async function startScanner(){if(scanActive)return;scanActive=true;$('mt14-scanner').hidden=false;$('mt14-scan-open').textContent=tr('stop');
 try{videoStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});const video=$('mt14-video');video.srcObject=videoStream;await video.play();
  if('BarcodeDetector' in window){try{detector=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e']});}catch{detector=null;}}
  const canvas=document.createElement('canvas');canvas.width=600;canvas.height=280;const ctx=canvas.getContext('2d',{willReadFrequently:true});let scanning=false;
  readerTimer=setInterval(async()=>{if(!scanActive||scanning||video.readyState<2)return;scanning=true;try{let code=null;
   if(detector){try{const found=await detector.detect(video);code=found?.[0]?.rawValue||null;}catch{detector=null;}}
   if(!code){ctx.drawImage(video,0,0,canvas.width,canvas.height);code=decodeFrame(canvas,ctx);}
   if(code&&validCode(code)){stopScanner();$('mt14-barcode-form').hidden=false;$('mt14-code').value=code;lookupCode(code);}
  }catch{}finally{scanning=false;}},320);
 }catch(e){stopScanner();status(tr('cameraError'));$('mt14-barcode-form').hidden=false;}}
function stopScanner(){scanActive=false;if(readerTimer){clearInterval(readerTimer);readerTimer=null;}if(videoStream){videoStream.getTracks().forEach(t=>t.stop());videoStream=null;}const v=$('mt14-video');if(v)v.srcObject=null;if($('mt14-scanner'))$('mt14-scanner').hidden=true;if($('mt14-scan-open'))$('mt14-scan-open').textContent=tr('scan');}
window.MyTrainingFoodSearch14={normalizeProduct,decodeBits};
const timer=setInterval(()=>{if($('mt132-library')&&window.MyTrainingNutrition132){clearInterval(timer);build();}},100);
})();
