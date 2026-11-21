const state = { ingredients: [], recipes: [], selected: new Set(), activeCategory: "Alle", lastRecipeIds: [] };
const $ = (id) => document.getElementById(id);
const categoryOrder = ["Alle","Gemüse","Fleisch & Geflügel","Fisch & Meeresfrüchte","Milchprodukte & Eier","Hülsenfrüchte & Tofu","Nudeln, Reis & Getreide","Vorrat & Würzmittel","Kräuter & Gewürze"];
const staples = new Set(["salz","pfeffer","olivenoel"]);
const categoryEmoji = {"Gemüse":"🥕","Fleisch & Geflügel":"🍗","Fisch & Meeresfrüchte":"🐟","Milchprodukte & Eier":"🧀","Hülsenfrüchte & Tofu":"🫘","Nudeln, Reis & Getreide":"🍝","Vorrat & Würzmittel":"🫙","Kräuter & Gewürze":"🌿"};

async function init(){
  try{
    const [i,r] = await Promise.all([fetch("./data/ingredients.json"),fetch("./data/recipes.json")]);
    if(!i.ok || !r.ok) throw new Error("Daten konnten nicht geladen werden.");
    state.ingredients = await i.json(); state.recipes = await r.json();
    const params = new URLSearchParams(location.search);
    const ids = params.get("i");
    if(ids) ids.split(",").forEach(id=>{if(state.ingredients.some(x=>x.id===id)) state.selected.add(id)});
    else {
      try { JSON.parse(localStorage.getItem("recipe-generator-selection")||"[]").forEach(id=>state.selected.add(id)); } catch {}
    }
    renderCategories(); renderIngredients(); updateSelection();
    $("search").addEventListener("input",renderIngredients);
    $("clearSelection").addEventListener("click",()=>{state.selected.clear();updateSelection();renderIngredients();});
    $("findRecipe").addEventListener("click",showRandomRecipe);
    $("anotherRecipe").addEventListener("click",showRandomRecipe);
    $("shareTop").addEventListener("click",openShare);
    $("shareResult").addEventListener("click",openShare);
    $("copyLink").addEventListener("click",copyLink);
    $("shareDialog").addEventListener("click",e=>{if(e.target===$("shareDialog")) $("shareDialog").close()});
  }catch(err){$("ingredientGrid").innerHTML=`<div class="empty-state">${err.message} Bitte lade die Seite neu.</div>`;}
}
function renderCategories(){
  $("categoryTabs").innerHTML = categoryOrder.map(cat=>`<button class="category-tab ${state.activeCategory===cat?"active":""}" data-cat="${cat}">${cat==="Alle"?"Alle Zutaten":(categoryEmoji[cat]||"")+" "+cat}</button>`).join("");
  $("categoryTabs").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{state.activeCategory=b.dataset.cat;renderCategories();renderIngredients()}));
}
function renderIngredients(){
  const q=$("search").value.trim().toLocaleLowerCase("de");
  const items=state.ingredients.filter(x=>(state.activeCategory==="Alle"||x.category===state.activeCategory)&&(!q||x.name.toLocaleLowerCase("de").includes(q)));
  $("ingredientGrid").innerHTML=items.length?items.map(x=>`<label class="ingredient ${state.selected.has(x.id)?"selected":""}"><input type="checkbox" value="${x.id}" ${state.selected.has(x.id)?"checked":""}><span class="check">${state.selected.has(x.id)?"✓":""}</span><span class="ingredient-name">${escapeHtml(x.name)}</span></label>`).join(""):`<div class="empty-state">Keine Zutaten gefunden.</div>`;
  $("ingredientGrid").querySelectorAll("input").forEach(input=>input.addEventListener("change",()=>{input.checked?state.selected.add(input.value):state.selected.delete(input.value);persistSelection();updateSelection();renderIngredients();}));
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function persistSelection(){localStorage.setItem("recipe-generator-selection",JSON.stringify([...state.selected]));}
function updateSelection(){
  $("selectedCount").textContent=state.selected.size;
  $("findRecipe").disabled=state.selected.size<2;
  $("selectionHint").textContent=state.selected.size<2?"Wähle mindestens zwei Zutaten aus.":`${state.selected.size} Zutaten ausgewählt – es werden passende Teilmengen verwendet.`;
  persistSelection();
  const p=new URLSearchParams(location.search); if(state.selected.size)p.set("i",[...state.selected].join(","));else p.delete("i");
  history.replaceState(null,"",location.pathname+(p.toString()?"?"+p.toString():""));
}
function showRandomRecipe(){
  const selected=[...state.selected];
  if(selected.length<2)return;
  // Match against any useful subset: require two selected recipe ingredients, then favour recipes matching more.
  const pool=state.recipes.map(r=>({...r,matched:r.ingredientIds.filter(id=>state.selected.has(id))}))
    .filter(r=>r.matched.length>=2 && !state.lastRecipeIds.includes(r.id));
  if(!pool.length){
    state.lastRecipeIds=[];
    $("resultSection").hidden=false;
    $("recipeCard").innerHTML='<div class="empty-state">Zu dieser Kombination gibt es gerade keinen passenden Treffer. Wähle noch ein paar Zutaten aus anderen Kategorien dazu.</div>';
    $("matchNote").textContent="";
    $("resultSection").scrollIntoView({behavior:"smooth",block:"start"});
    return;
  }
  const max=Math.max(...pool.map(r=>r.matched.length));
  // Include all recipes with at least 2 matches; weighted random favours a stronger match without demanding all selected ingredients.
  const weighted=pool.flatMap(r=>Array(Math.max(1,Math.min(5,r.matched.length))).fill(r));
  let chosen=weighted[Math.floor(Math.random()*weighted.length)];
  state.lastRecipeIds.push(chosen.id); if(state.lastRecipeIds.length>25)state.lastRecipeIds.shift();
  renderRecipe(chosen);
  $("resultSection").hidden=false;
  $("resultSection").scrollIntoView({behavior:"smooth",block:"start"});
}
function renderRecipe(r){
  const names=new Map(state.ingredients.map(x=>[x.id,x.name]));
  const matched=r.matched.map(id=>names.get(id)).filter(Boolean);
  const ingredients=r.ingredients.map(x=>({name:names.get(x.id)||x.id,amount:x.amount,unit:x.unit,selected:state.selected.has(x.id)}));
  const list=ingredients.map(x=>`<li><span>${escapeHtml(x.name)}${x.selected?"":" <small>(ergänzen)</small>"}</span><small>${x.amount} ${escapeHtml(x.unit)}</small></li>`).join("");
  $("recipeCard").innerHTML=`
    <div class="recipe-topline"><span class="pill">${escapeHtml(r.category)}</span><span class="pill">🎲 Zufallstreffer</span></div>
    <h2 class="recipe-title">${escapeHtml(r.title)}</h2><p class="recipe-description">${escapeHtml(r.description)}</p>
    <div class="recipe-meta"><span>◷ ${r.minutes} Minuten</span><span>♧ ${r.servings} Portionen</span><span>✓ ${matched.length} deiner Zutaten</span></div>
    <div class="recipe-columns"><section><h3>Zutaten</h3><ul class="ingredient-list">${list}<li><span>Salz, Pfeffer & Öl</span><small>nach Bedarf</small></li></ul></section>
    <section><h3>Zubereitung</h3><ol class="steps">${r.steps.map(s=>`<li>${escapeHtml(s)}</li>`).join("")}</ol></section></div>`;
  $("matchNote").textContent=`Verwendete Zutaten aus deiner Auswahl: ${matched.join(", ")}. Nicht ausgewählte Rezeptzutaten sind als Ergänzung gekennzeichnet.`;
}
function currentShareUrl(){
  const url=new URL(location.href);url.search="";url.hash="";
  if(state.selected.size)url.searchParams.set("i",[...state.selected].join(","));
  return url.toString();
}
function openShare(){
  if(!state.selected.size){alert("Bitte wähle zuerst Zutaten aus.");return;}
  const url=currentShareUrl();$("shareUrl").value=url;$("copyStatus").textContent="";
  const qr=$("qrcode");qr.innerHTML="";
  if(window.QRCode){new QRCode(qr,{text:url,width:170,height:170,colorDark:"#203b2b",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M});}
  else qr.innerHTML='<div class="qr-placeholder">QR-Code-Bibliothek konnte nicht geladen werden. Du kannst den Link trotzdem kopieren.</div>';
  $("shareDialog").showModal();
}
async function copyLink(){
  try{await navigator.clipboard.writeText($("shareUrl").value);$("copyStatus").textContent="Link wurde kopiert.";}
  catch{$("shareUrl").select();document.execCommand("copy");$("copyStatus").textContent="Link wurde kopiert.";}
}
document.addEventListener("DOMContentLoaded",init);
