/* Display preference only. Apply before styles load to avoid a theme flash.
   No account, project or authentication data is stored here. */
(() => {
  'use strict';
  const key='dal:appearance',root=document.documentElement;
  let theme='light';
  try { if(localStorage.getItem(key)==='dark')theme='dark'; } catch(_) { /* Storage is optional. */ }
  const label=()=>theme==='light'?'Koyu temaya geç':'Açık temaya geç';
  function apply(next,persist=false){
    theme=next==='dark'?'dark':'light';
    root.dataset.theme=theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#181b21':'#f3f6fa');
    document.querySelectorAll('[data-theme-toggle]').forEach(button=>{
      button.setAttribute('aria-label',label());button.title=label();
      button.querySelector('[data-theme-label]')?.replaceChildren(label());
    });
    if(persist)try {localStorage.setItem(key,theme);} catch(_) { /* Theme still works in memory. */ }
  }
  function button(){
    const icon=name=>window.DalIcons.render(name,'h-icon');
    return `<button type="button" class="h-top-icon theme-toggle" data-theme-toggle aria-label="${label()}" title="${label()}"><span class="theme-to-dark">${icon('moon')}</span><span class="theme-to-light">${icon('sun')}</span><span class="theme-label" data-theme-label>${label()}</span></button>`;
  }
  apply(theme);
  document.addEventListener('click',event=>{if(event.target.closest('[data-theme-toggle]'))apply(theme==='light'?'dark':'light',true);});
  window.addEventListener('storage',event=>{if(event.key===key||event.key===null)apply(event.newValue==='dark'?'dark':'light');});
  window.DalTheme={button};
})();
