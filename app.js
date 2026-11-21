const state = { ingredients: [], recipes: [], selected: new Set(), activeCategory: "Alle", lastRecipeIds: [] };
const $ = (id) => document.getElementById(id);
const categoryOrder = ["Alle","Gemüse","Fleisch & Geflügel","Fisch & Meeresfrüchte","Milchprodukte & Eier","Hülsenfrüchte & Tofu","Nudeln, Reis & Getreide","Vorrat & Würzmittel","Kräuter & Gewürze"];
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
      try { JSON.parse(localStorage.getItem("recipe-generator-selection")||"[]").forEach(id=>{if(state.ingredients.some(x=>x.id===id))state.selected.add(id)}); } catch {}
    }
    renderCategories(); renderIngredients(); updateSelection();
    $("toggleIngredients").addEventListener("click",()=>setIngredientsExpanded($("ingredientControls").hidden));
    $("search").addEventListener("input",renderIngredients);
    $("clearSelection").addEventListener("click",()=>{state.selected.clear();updateSelection({clearRecipe:true});renderIngredients();});
    $("findRecipe").addEventListener("click",showRandomRecipe);
    $("anotherRecipe").addEventListener("click",showRandomRecipe);
    $("shareTop").addEventListener("click",openShare);
    $("shareResult").addEventListener("click",openShare);
    $("copyRecipeLink").addEventListener("click",copyRecipeLink);
    $("copyLink").addEventListener("click",copyLink);
    $("shareDialog").addEventListener("click",e=>{if(e.target===$("shareDialog")) $("shareDialog").close()});

    // A QR/list link uses ?i=...&draw=1: every scan draws a fresh recipe
    // from the saved ingredient selection instead of pointing to one fixed recipe.
    const recipeId = params.get("recipe");
    if(params.get("draw")==="1"){
      if(state.selected.size>=2) showRandomRecipe();
      else showNoMatch("Dieser Zutatenlisten-Link enthält zu wenige gültige Zutaten. Bitte wähle mindestens zwei Zutaten aus.");
    } else if(recipeId){
      const recipe=state.recipes.find(x=>x.id===recipeId);
      if(recipe && recipe.ingredientIds.every(id=>state.selected.has(id))){
        recipe.matched=[...recipe.ingredientIds];
        renderRecipe(recipe);
        $("resultSection").hidden=false;
        scrollToRecipe();
      } else {
        showNoMatch("Dieses Rezept passt nicht vollständig zur gespeicherten Zutatenliste. Bitte ziehe ein neues Zufallsrezept.");
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
  $("categoryTabs").innerHTML = categoryOrder.map(cat=>`<button class="category-tab ${state.activeCategory===cat?"active":""}" data-cat="${cat}">${cat==="Alle"?"Alle Zutaten":(categoryEmoji[cat]||"")+" "+cat}</button>`).join("");
  $("categoryTabs").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{state.activeCategory=b.dataset.cat;renderCategories();renderIngredients()}));
}
function renderIngredients(){
  const q=$("search").value.trim().toLocaleLowerCase("de");
  const items=state.ingredients.filter(x=>(state.activeCategory==="Alle"||x.category===state.activeCategory)&&(!q||x.name.toLocaleLowerCase("de").includes(q)));
  $("ingredientGrid").innerHTML=items.length?items.map(x=>`<label class="ingredient ${state.selected.has(x.id)?"selected":""}"><input type="checkbox" value="${x.id}" ${state.selected.has(x.id)?"checked":""}><span class="check">${state.selected.has(x.id)?"✓":""}</span><span class="ingredient-name">${escapeHtml(x.name)}</span></label>`).join(""):`<div class="empty-state">Keine Zutaten gefunden.</div>`;
  $("ingredientGrid").querySelectorAll("input").forEach(input=>input.addEventListener("change",()=>{input.checked?state.selected.add(input.value):state.selected.delete(input.value);persistSelection();updateSelection({clearRecipe:true});renderIngredients();}));
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function persistSelection(){localStorage.setItem("recipe-generator-selection",JSON.stringify([...state.selected]));}
function updateSelection(options={}){
  $("selectedCount").textContent=state.selected.size;
  $("findRecipe").disabled=state.selected.size<2;
  $("selectionHint").textContent=state.selected.size<2
    ?"Wähle mindestens zwei Zutaten aus."
    :"Es erscheinen nur Rezepte, deren benötigte Zutaten alle ausgewählt sind.";
  persistSelection();
  const p=new URLSearchParams(location.search);
  if(state.selected.size)p.set("i",[...state.selected].join(","));else p.delete("i");
  if(options.clearRecipe){
    p.delete("recipe");p.delete("draw");
    $("resultSection").hidden=true;
    state.lastRecipeIds=[];
  }
  history.replaceState(null,"",location.pathname+(p.toString()?"?"+p.toString():""));
}
function setRecipeUrl(recipeId){
  const p=new URLSearchParams();
  if(state.selected.size)p.set("i",[...state.selected].join(","));
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
function showRandomRecipe(){
  if(state.selected.size<2)return;
  // Strict matching: every recipe ingredient must be active in the saved selection.
  // Salt, pepper and oil are pantry staples and are added separately on the recipe card.
  const matching=state.recipes
    .filter(r=>Array.isArray(r.ingredientIds) && r.ingredientIds.length>0 && r.ingredientIds.every(id=>state.selected.has(id)));
  if(!matching.length){
    const p=new URLSearchParams();p.set("i",[...state.selected].join(","));
    history.replaceState(null,"",location.pathname+"?"+p.toString());
    showNoMatch("Leider gibt es in der aktuellen Rezeptdatenbank kein Rezept, dessen komplette Zutatenliste in deiner Auswahl enthalten ist. Wähle weitere Zutaten aus oder ergänze deine Auswahl.");
    return;
  }
  // Avoid immediate repeats; once every matching recipe has appeared, start a new round.
  let pool=matching.filter(r=>!state.lastRecipeIds.includes(r.id));
  if(!pool.length){state.lastRecipeIds=[];pool=matching;}
  const chosen=pool[Math.floor(Math.random()*pool.length)];
  chosen.matched=[...chosen.ingredientIds];
  state.lastRecipeIds.push(chosen.id);
  if(state.lastRecipeIds.length>Math.max(25,matching.length))state.lastRecipeIds.shift();
  renderRecipe(chosen);
  setRecipeUrl(chosen.id);
  $("resultSection").hidden=false;
  scrollToRecipe();
}
function renderRecipe(r){
  const names=new Map(state.ingredients.map(x=>[x.id,x.name]));
  const matched=r.ingredientIds.filter(id=>state.selected.has(id)).map(id=>names.get(id)).filter(Boolean);
  // Strict matching means every recipe ingredient is selected; no inactive ingredient is listed.
  const ingredients=r.ingredients.filter(x=>state.selected.has(x.id)).map(x=>({name:names.get(x.id)||x.id,amount:x.amount,unit:x.unit}));
  const list=ingredients.map(x=>`<li><span>${escapeHtml(x.name)}</span><small>${x.amount} ${escapeHtml(x.unit)}</small></li>`).join("");
  $("recipeCard").innerHTML=`
    <div class="recipe-topline"><span class="pill">${escapeHtml(r.category)}</span><span class="pill">🎲 Zufallstreffer</span></div>
    <h2 class="recipe-title">${escapeHtml(r.title)}</h2><p class="recipe-description">${escapeHtml(r.description)}</p>
    <div class="recipe-meta"><span>◷ ${r.minutes} Minuten</span><span>♧ ${r.servings} Portionen</span><span>✓ ${matched.length} Zutaten aus deiner Auswahl</span></div>
    <div class="recipe-columns"><section><h3>Zutaten</h3><ul class="ingredient-list">${list}<li><span>Salz, Pfeffer & Öl</span><small>nach Bedarf</small></li></ul></section>
    <section><h3>Zubereitung</h3><ol class="steps">${r.steps.map(s=>`<li>${escapeHtml(s)}</li>`).join("")}</ol></section></div>`;
  $("matchNote").textContent=`Alle ${matched.length} benötigten Rezeptzutaten sind in deiner Auswahl enthalten. Salz, Pfeffer und Öl gelten als Grundzutaten.`;
}
function currentShareUrl(){
  const url=new URL(location.href);url.search="";url.hash="";
  if(state.selected.size)url.searchParams.set("i",[...state.selected].join(","));
  // This is deliberately a reusable ingredient-list QR, not a QR for one fixed recipe.
  // Each scan opens the same selection and draws a fresh random matching recipe.
  url.searchParams.set("draw","1");
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
