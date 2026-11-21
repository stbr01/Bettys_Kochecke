const state = { ingredients: [], recipes: [], selected: new Set(), activeCategory: "Alle", lastRecipeIds: [] };
const $ = (id) => document.getElementById(id);
// Nine fixed categories (plus the "Alle Zutaten" filter); the JSON array's order
// is deliberately not changed, since QR bit positions depend on it.
const categoryOrder = ["Alle","Gemüse & Salat","Fleisch & Wurst","Fisch & Meeresfrüchte","Beilagen & Getreide","Milchprodukte & Eier","Hülsenfrüchte & Tofu","Gewürze & Kräuter","Vorrat & Saucen","Obst & Nüsse"];
const categoryEmoji = {"Gemüse & Salat":"🥕","Fleisch & Wurst":"🍗","Fisch & Meeresfrüchte":"🐟","Beilagen & Getreide":"🍝","Milchprodukte & Eier":"🧀","Hülsenfrüchte & Tofu":"🫘","Gewürze & Kräuter":"🌿","Vorrat & Saucen":"🫙","Obst & Nüsse":"🍋"};

async function init(){
  try{
    const [i,r] = await Promise.all([fetch("./data/ingredients.json"),fetch("./data/recipes.json")]);
    if(!i.ok || !r.ok) throw new Error("Daten konnten nicht geladen werden.");
    state.ingredients = await i.json(); state.recipes = await r.json();
    const params = new URLSearchParams(location.search);
    const ids = params.get("i");
    const packed = params.get("z");
    if(packed !== null) decodeSelection(packed).forEach(id=>state.selected.add(id));
    else if(ids !== null) ids.split(",").forEach(id=>{if(state.ingredients.some(x=>x.id===id)) state.selected.add(id)});
    else {
      try { JSON.parse(localStorage.getItem("recipe-generator-selection")||"[]").forEach(id=>{if(state.ingredients.some(x=>x.id===id))state.selected.add(id)}); } catch {}
    }
    renderCategories(); renderIngredients(); updateSelection();
    $("toggleIngredients").addEventListener("click",()=>setIngredientsExpanded($("ingredientControls").hidden));
    // Searching always covers the complete ingredient list, not just the last tab.
    $("search").addEventListener("input",()=>{
      if($("search").value.trim() && state.activeCategory!=="Alle"){
        state.activeCategory="Alle";
        renderCategories();
      }
      renderIngredients();
    });
    $("clearSelection").addEventListener("click",()=>{state.selected.clear();updateSelection({clearRecipe:true});renderIngredients();});
    $("findRecipe").addEventListener("click",showRandomRecipe);
    $("anotherRecipe").addEventListener("click",showRandomRecipe);
    $("shareTop").addEventListener("click",openShare);
    $("shareResult").addEventListener("click",openShare);
    $("copyRecipeLink").addEventListener("click",copyRecipeLink);
    $("copyLink").addEventListener("click",copyLink);
    $("shareDialog").addEventListener("click",e=>{if(e.target===$("shareDialog")) $("shareDialog").close()});

    // A QR/list link uses ?z=...&draw=1: every scan draws a fresh recipe
    // from the saved ingredient selection instead of pointing to one fixed recipe.
    const recipeId = params.get("recipe");
    if(params.get("draw")==="1"){
      if(state.selected.size>=2) showRandomRecipe();
      else showNoMatch("Dieser Zutatenlisten-Link enthält zu wenige gültige Zutaten. Bitte wähle mindestens zwei Zutaten aus.");
    } else if(recipeId){
      const recipe=state.recipes.find(x=>x.id===recipeId);
      if(recipe && resolveRecipe(recipe)){
        renderRecipe(recipe,resolveRecipe(recipe));
        $("resultSection").hidden=false;
        scrollToRecipe();
      } else if(state.selected.size>=2){
        // A previously shared recipe ID may have disappeared during the quality update.
        // Keep the saved ingredients and offer a fresh matching recipe instead.
        showRandomRecipe();
      } else {
        showNoMatch("Dieser alte Rezeptlink hat keine gültige Auswahl mehr. Bitte wähle mindestens zwei Zutaten aus.");
      }
    }
  }catch(err){$("ingredientGrid").innerHTML=`<div class="empty-state">${escapeHtml(err.message)} Bitte lade die Seite neu.</div>`;}
}
function setIngredientsExpanded(expanded){
  $("ingredientControls").hidden=!expanded;
  $("toggleIngredients").setAttribute("aria-expanded",String(expanded));
  $("toggleIngredients").textContent=expanded?"Zutaten einklappen ▴":"Zutaten anzeigen ▾";
}
function renderCategories(){
  $("categoryTabs").innerHTML = categoryOrder.map(cat=>{
    const count=cat==="Alle"?state.ingredients.length:state.ingredients.filter(x=>x.category===cat).length;
    return `<button type="button" class="category-tab ${state.activeCategory===cat?"active":""}" data-cat="${escapeHtml(cat)}" aria-pressed="${state.activeCategory===cat}">${cat==="Alle"?"Alle Zutaten":(categoryEmoji[cat]||"")+" "+escapeHtml(cat)} <span class="category-tab-count">${count}</span></button>`;
  }).join("");
  $("categoryTabs").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{
    state.activeCategory=b.dataset.cat;
    renderCategories();
    renderIngredients();
  }));
}
function renderIngredients(){
  const q=$("search").value.trim().toLocaleLowerCase("de");
  const visibleCategories=state.activeCategory==="Alle"?categoryOrder.slice(1):[state.activeCategory];
  const groups=visibleCategories.map(cat=>{
    // Sort only for presentation. Never reorder the source array: compact QR
    // codes encode selections by the ingredient's original array index.
    const items=state.ingredients
      .filter(x=>x.category===cat && (!q||x.name.toLocaleLowerCase("de").includes(q)))
      .sort((a,b)=>a.name.localeCompare(b.name,"de",{sensitivity:"base"}));
    if(!items.length)return "";
    const selectedCount=items.filter(x=>state.selected.has(x.id)).length;
    const tiles=items.map(x=>`<label class="ingredient ${state.selected.has(x.id)?"selected":""}"><input type="checkbox" value="${escapeHtml(x.id)}" ${state.selected.has(x.id)?"checked":""}><span class="check">${state.selected.has(x.id)?"✓":""}</span><span class="ingredient-name">${escapeHtml(x.name)}</span></label>`).join("");
    const headingId="ingredient-category-"+categoryOrder.indexOf(cat);
    return `<section class="ingredient-group" aria-labelledby="${headingId}">
      <div class="ingredient-group-heading">
        <h3 id="${headingId}"><span aria-hidden="true">${categoryEmoji[cat]||""}</span> ${escapeHtml(cat)}</h3>
        <span class="ingredient-group-count">${items.length} Zutaten · ${selectedCount} ausgewählt</span>
      </div>
      <div class="ingredient-grid">${tiles}</div>
    </section>`;
  }).filter(Boolean);
  $("ingredientGrid").innerHTML=groups.length?groups.join(""):`<div class="empty-state">Keine Zutaten gefunden.</div>`;
  $("ingredientGrid").querySelectorAll("input").forEach(input=>input.addEventListener("change",()=>{
    input.checked?state.selected.add(input.value):state.selected.delete(input.value);
    persistSelection();
    updateSelection({clearRecipe:true});
    renderIngredients();
  }));
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
// A compact bitset; positions of existing ingredients must never change.
// Old QR codes from the 128-ingredient version remain readable after additions.
function encodeSelection(){
  const bytes=new Uint8Array(Math.ceil(state.ingredients.length/8));
  state.ingredients.forEach((item,index)=>{if(state.selected.has(item.id))bytes[index>>3]|=1<<(index&7)});
  let binary="";bytes.forEach(byte=>binary+=String.fromCharCode(byte));
  return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
}
function decodeSelection(value){
  try{
    let bytes;
    // Backward compatibility with v4 hexadecimal links.
    if(/^1(?:[0-9a-f]{2})+$/i.test(value)){
      const hex=value.slice(1);bytes=[];
      for(let j=0;j<hex.length;j+=2)bytes.push(parseInt(hex.slice(j,j+2),16));
    }else if(/^[A-Za-z0-9_-]+$/.test(value)){
      const binary=atob(value.replace(/-/g,"+").replace(/_/g,"/").padEnd(Math.ceil(value.length/4)*4,"="));
      bytes=Array.from(binary,c=>c.charCodeAt(0));
    }else return [];
    const expected=Math.ceil(state.ingredients.length/8);
    // Old compact QR codes contain 16 bytes (128 initial ingredients). Pad
    // only added ingredients with zeros, keeping legacy selections intact.
    if(bytes.length<16 || bytes.length>expected)return [];
    while(bytes.length<expected)bytes.push(0);
    return state.ingredients.filter((item,index)=>!!(bytes[index>>3]&(1<<(index&7)))).map(item=>item.id);
  }catch{return [];}
}
function setSelectionParams(params){
  params.delete("i");
  if(state.selected.size)params.set("z",encodeSelection());
  else params.delete("z");
}
function persistSelection(){localStorage.setItem("recipe-generator-selection",JSON.stringify([...state.selected]));}
function updateSelection(options={}){
  $("selectedCount").textContent=state.selected.size;
  $("findRecipe").disabled=state.selected.size<2;
  $("selectionHint").textContent=state.selected.size<2
    ?"Wähle mindestens zwei Zutaten aus."
    :"Es erscheinen nur Rezepte, deren benötigte Zutaten alle ausgewählt sind.";
  persistSelection();
  const p=new URLSearchParams(location.search);
  setSelectionParams(p);
  if(options.clearRecipe){
    p.delete("recipe");p.delete("draw");
    $("resultSection").hidden=true;
    state.lastRecipeIds=[];
  }
  history.replaceState(null,"",location.pathname+(p.toString()?"?"+p.toString():""));
}
function setRecipeUrl(recipeId){
  const p=new URLSearchParams();
  setSelectionParams(p);
  p.set("recipe",recipeId);
  history.replaceState(null,"",location.pathname+"?"+p.toString());
}
function scrollToRecipe(){
  // Show the navigation and recipe immediately, even when coming from a QR scan.
  requestAnimationFrame(()=>$("resultSection").scrollIntoView({behavior:"instant",block:"start"}));
}
function showNoMatch(message){
  $("resultSection").hidden=false;
  $("recipeCard").innerHTML=`<div class="empty-state">${escapeHtml(message)}</div>`;
  $("matchNote").textContent="";
  scrollToRecipe();
}
// Only interchangeable long/short pasta shapes may be substituted.
// Gnocchi, lasagne sheets and filled pasta remain recipe-specific.
const PASTA_SHAPES=["spaghetti","penne","fusilli","rigatoni","tagliatelle","linguine","farfalle","makkaroni"];
function resolveRecipe(recipe){
  if(!Array.isArray(recipe.ingredientIds)||!recipe.ingredientIds.length)return null;
  const originalShape=recipe.category==="Pasta & Nudelgerichte"
    ? recipe.ingredientIds.find(id=>PASTA_SHAPES.includes(id)) : null;
  const replacement=originalShape&&!state.selected.has(originalShape)
    ? PASTA_SHAPES.find(id=>state.selected.has(id)) : null;
  const ids=recipe.ingredientIds.map(id=>id===originalShape&&replacement?replacement:id);
  if(!ids.every(id=>state.selected.has(id)))return null;
  return {ids,originalShape:replacement?originalShape:null,replacement:replacement||null};
}
function swapPastaWord(text,matched){
  if(!matched?.replacement)return text;
  const names=new Map(state.ingredients.map(x=>[x.id,x.name]));
  const oldName=names.get(matched.originalShape),newName=names.get(matched.replacement);
  if(!oldName||!newName)return text;
  return String(text).replace(new RegExp("\\b"+oldName+"\\b","gi"),newName);
}
function showRandomRecipe(){
  if(state.selected.size<2)return;
  // Every required ingredient must be active; only pasta shapes may replace each other.
  const matching=state.recipes.map(r=>({recipe:r,matching:resolveRecipe(r)})).filter(x=>x.matching);
  if(!matching.length){
    const p=new URLSearchParams();setSelectionParams(p);
    history.replaceState(null,"",location.pathname+"?"+p.toString());
    showNoMatch("Leider gibt es noch kein Gericht, für das alle benötigten Zutaten in deiner Auswahl enthalten sind. Wähle weitere Zutaten aus. Bei normalen Nudelgerichten können unterschiedliche Pastasorten verwendet werden.");
    return;
  }
  let pool=matching.filter(x=>!state.lastRecipeIds.includes(x.recipe.id));
  if(!pool.length){state.lastRecipeIds=[];pool=matching;}
  const chosen=pool[Math.floor(Math.random()*pool.length)];
  state.lastRecipeIds.push(chosen.recipe.id);
  if(state.lastRecipeIds.length>Math.max(25,matching.length))state.lastRecipeIds.shift();
  renderRecipe(chosen.recipe,chosen.matching);
  setRecipeUrl(chosen.recipe.id);
  $("resultSection").hidden=false;
  scrollToRecipe();
}
function renderRecipe(r, resolved=resolveRecipe(r)){
  if(!resolved)return;
  const names=new Map(state.ingredients.map(x=>[x.id,x.name]));
  const ingredients=r.ingredients.map((x,index)=>({...x,id:resolved.ids[index]}));
  const list=ingredients.map(x=>`<li><span>${escapeHtml(names.get(x.id)||x.id)}</span><small>${escapeHtml(x.amount)} ${escapeHtml(x.unit)}</small></li>`).join("");
  const staples=(r.staples||["salz","pfeffer","olivenoel"]).map(id=>({salz:"Salz",pfeffer:"Pfeffer",olivenoel:"Öl"}[id]||id));
  const stapleLi=staples.length?`<li><span>${escapeHtml(staples.join(", "))}</span><small>nach Bedarf</small></li>`:"";
  const source=r.source&&/^https:\/\//.test(r.source.url)?r.source:null;
  const sourceLine=source?`<div class="recipe-source"><span>⭐ Bewertetes Inspirationsrezept: </span><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.site)} · ${escapeHtml(Number(source.rating).toFixed(1).replace(".",","))}/5 aus ${escapeHtml(source.votes)} Bewertungen</a><p>Das hier ist unsere eigenständig vereinfachte Alltagsfassung. Die Bewertung gilt für das verlinkte Original, nicht für diese Fassung. Stand: ${escapeHtml(source.asOf||"2026-11-21")}.</p></div>`:"";
  $("recipeCard").innerHTML=`
    <div class="recipe-topline"><span class="pill">${escapeHtml(r.category)}</span><span class="pill">🎲 Zufallstreffer</span></div>
    <h2 class="recipe-title">${escapeHtml(swapPastaWord(r.title,resolved))}</h2><p class="recipe-description">${escapeHtml(r.description)}</p>
    <div class="recipe-meta"><span>◷ ${r.minutes} Minuten</span><span>♧ ${r.servings} Portionen</span><span>✓ ${resolved.ids.length} Zutaten aus deiner Auswahl</span></div>
    <div class="recipe-columns"><section><h3>Zutaten</h3><ul class="ingredient-list">${list}${stapleLi}</ul></section>
    <section><h3>Zubereitung</h3><ol class="steps">${r.steps.map(s=>`<li>${escapeHtml(swapPastaWord(s,resolved))}</li>`).join("")}</ol></section></div>
    ${sourceLine}`;
  $("matchNote").textContent=`Alle ${resolved.ids.length} benötigten Rezeptzutaten sind in deiner Auswahl enthalten.${resolved.replacement?" Die Nudelsorte wurde passend zu deinem Vorrat getauscht.":""} Salz, Pfeffer und Öl gelten, soweit benötigt, als Grundzutaten.`;
}
function currentShareUrl(){
  const url=new URL(location.href);url.search="";url.hash="";
  setSelectionParams(url.searchParams);
  // This is deliberately a reusable ingredient-list QR, not a QR for one fixed recipe.
  // Each scan opens the same selection and draws a fresh random matching recipe.
  url.searchParams.set("draw","1");
  return url.toString();
}
function openShare(){
  if(!state.selected.size){alert("Bitte wähle zuerst Zutaten aus.");return;}
  const url=currentShareUrl();$("shareUrl").value=url;$("copyStatus").textContent="";
  const qr=$("qrcode");qr.innerHTML="";
  if(window.QRCode){new QRCode(qr,{text:url,width:320,height:320,colorDark:"#000000",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.L});}
  else qr.innerHTML='<div class="qr-placeholder">QR-Code-Bibliothek konnte nicht geladen werden. Du kannst den Link trotzdem kopieren.</div>';
  $("shareDialog").showModal();
}
async function copyLink(){
  try{await navigator.clipboard.writeText($("shareUrl").value);$("copyStatus").textContent="Zutatenlisten-Link wurde kopiert.";}
  catch{$("shareUrl").select();document.execCommand("copy");$("copyStatus").textContent="Zutatenlisten-Link wurde kopiert.";}
}
async function copyRecipeLink(){
  const url=new URL(location.href);
  if(!url.searchParams.has("recipe")){ $("matchNote").textContent="Erstelle zuerst ein Rezept, damit ein Rezeptlink verfügbar ist.";return; }
  try{
    await navigator.clipboard.writeText(url.toString());
    $("matchNote").textContent="Der direkte Link zu diesem Rezept wurde kopiert. Der QR-Code bleibt unabhängig davon mit deiner Zutatenliste verknüpft.";
  }catch{
    const temp=document.createElement("input");temp.value=url.toString();document.body.appendChild(temp);temp.select();document.execCommand("copy");temp.remove();
    $("matchNote").textContent="Der direkte Link zu diesem Rezept wurde kopiert.";
  }
}
document.addEventListener("DOMContentLoaded",init);
