/* Dal Ekip 3.0.0 — authenticated workspace and guarded synchronization. */
(() => {
  'use strict';
  const C=window.DalCore, D=window.DalCollab, E=C.esc;
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const base=location.pathname.endsWith('/')?location.pathname:location.pathname+'/';
  const roleName={manager:'Çalışma yöneticisi',editor:'Düzenleyici',commenter:'Yorumcu',viewer:'İzleyici'};
  const kindName={'board.created':'Çalışma oluşturuldu','board.changed':'Şema güncellendi','board.restored':'Eski sürüm geri yüklendi','member.updated':'Üye yetkisi değişti','member.removed':'Üye çıkarıldı','comment.added':'Yorum eklendi','comment.removed':'Yorum kaldırıldı','board.archived':'Çalışma arşivlendi','board.unarchived':'Çalışma arşivden çıkarıldı'};
  const symbol='<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="11" y="3" width="10" height="8" rx="2"/><path d="M16 11v7M7 23v-5h18v5"/><rect x="3" y="23" width="8" height="6" rx="2"/><rect x="21" y="23" width="8" height="6" rx="2"/></svg>';
  const state={user:null,csrf:'',initial:null,editor:null,serverDoc:null,revision:0,flight:null,retry:null,conflict:null,blocked:false,invalid:false,undo:[],redo:[],boards:[],busy:false,historyBusy:false,timer:null,firstPendingAt:0,pollTimer:null,commentTimer:null,route:'boards',lastHeartbeat:0};
  const uid=()=>C.uid('op');
  const dateTime=s=>s?new Date(s).toLocaleString('tr-TR',{timeZone:'Europe/Istanbul',dateStyle:'medium',timeStyle:'short'}):'—';
  function badge(s){return `<span class="team-badge">${E(s)}</span>`;}
  function message(text,error=false){const el=document.createElement('div');el.className='team-toast'+(error?' error':'');el.textContent=text;document.body.appendChild(el);setTimeout(()=>el.remove(),error?8000:4000);}
  function errorText(err){return err?.body?.detail||err?.message||'İşlem tamamlanamadı.';}
  async function api(path,method='GET',body){
    if(window.DalFirebase)return window.DalFirebase.api(path,method,body);
    const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),15000);
    try{
      const response=await fetch(base+'api'+path,{method,credentials:'same-origin',cache:'no-store',signal:ac.signal,
        headers:method==='GET'?{}:{'Content-Type':'application/json','X-CSRF-Token':state.csrf},
        body:method==='GET'?undefined:JSON.stringify(body||{})});
      let data;try{data=await response.json();}catch(_){throw new Error('Sunucudan geçerli yanıt alınamadı.');}
      if(!response.ok){const err=new Error(data.detail||'İşlem reddedildi.');err.status=response.status;err.body=data;throw err;}
      return data;
    }catch(err){if(err.name==='AbortError')throw new Error('Sunucu yanıtı zaman aşımına uğradı. Bekleyen değişiklikler bu sekmede korunuyor.');throw err;}
    finally{clearTimeout(timer);}
  }
  function download(value,name,type='application/json;charset=utf-8'){
    const blob=new Blob([typeof value==='string'?value:JSON.stringify(value,null,2)],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  function dialog(title,subtitle,body,mode=''){
    clearInterval(state.commentTimer);
    const el=$('#team-dialog');el.dataset.mode=mode;
    el.innerHTML=`<header><div><span class="team-eyebrow">BİRLİKTE İYİLİK / DAL</span><h2 id="team-dialog-title">${E(title)}</h2><p>${E(subtitle)}</p></div><button class="team-close" data-team="close" aria-label="Pencereyi kapat">×</button></header><section class="team-dialog-body">${body}</section><p id="team-form-error" class="team-form-error" role="alert"></p>`;
    if(!el.open)el.showModal();
    return el;
  }
  function close(){clearInterval(state.commentTimer);$('#team-dialog').close();}
  function formError(err){const el=$('#team-form-error')||$('#login-error');if(el)el.textContent=errorText(err);else message(errorText(err),true);}
  function nav(){
    if(window.DalHub){window.DalHub.navigation(state.user,!!state.editor,state.initial);return;}
    $('#team-nav').classList.remove('hidden');
    $('#team-nav').innerHTML=`<a href="${E(base)}" class="team-brand" data-team="home"><span>${symbol}</span><strong>birlikte<span>iyilik</span></strong><i>EKİP ALANI</i></a><nav aria-label="Ekip gezintisi"><button data-team="home">Çalışmalar</button><button data-team="my-work">Görevlerim</button>${state.user?.role==='admin'?'<button data-team="users">Ekip yönetimi</button>':''}${state.editor?'<button data-team="members">Üyeler</button><button data-team="comments">Yorumlar</button><button data-team="history">Geçmiş</button>':''}</nav><div id="team-live" aria-live="polite"></div><button class="team-account" data-team="account"><span class="team-avatar">${E(state.user.name.slice(0,1).toLocaleUpperCase('tr'))}</span><span>${E(state.user.name)}</span></button>`;
  }
  function showLogin(claim=null){
    document.body.classList.remove('hub-auth','hub-menu-open');
    $('#app').classList.add('hidden');$('#team-nav').classList.add('hidden');$('#team-shell').classList.remove('hidden');
    const isClaim=!!claim,isInvite=claim?.kind==='invite';
    $('#team-shell').innerHTML=`<div class="team-login"><section class="login-story"><a href="https://birlikteiyilik.com" class="login-logo"><img src="assets/brand/wordmark-white.png" alt="birlikteiyilik.com"></a><div><span class="team-eyebrow">AYNI AMAÇ. ORTAK EMEK.</span><h1>Yapımız net.<br>İşimiz birlikte.</h1><p>Organizasyonu görünür kılın. Görevleri paylaşın. Kararları ve ilerlemeyi aynı yerde takip edin.</p><div class="login-diagram" aria-hidden="true"><div>Ortak koordinasyon</div><span></span><section><div>Eğitim</div><div>İçerik</div><div>Operasyon</div></section></div></div><small>DAL EKİP · BİRLİKTE İYİLİK</small></section><section class="login-form-wrap"><div class="login-form-card"><span class="login-icon brand-symbol"><img src="assets/brand/symbol.png" alt="Birlikte İyilik"></span><h2>${isInvite?'Ekibe katılın':isClaim?'Yeni parola oluşturun':'Ekip hesabınıza giriş yapın'}</h2><p>${isInvite?'Davet bağlantınızla kişisel hesabınızı oluşturun.':isClaim?'Bu bağlantı tek kullanımlıktır.':'Bu alan yalnız yetkilendirilmiş ekip üyelerine açıktır.'}</p><form id="team-login-form">${isClaim?(isInvite?'<label>Adınız soyadınız<input name="name" autocomplete="name" maxlength="250" required></label>':''):'<label>E-posta<input type="email" name="email" autocomplete="username" required maxlength="254"></label>'}<label>${isClaim?'Yeni parola':'Parola'}<input type="password" name="password" autocomplete="${isClaim?'new-password':'current-password'}" ${isClaim?'minlength="12"':''} maxlength="128" required></label>${isClaim?'<p class="team-hint">En az 12 karakter. Başka bir hesabınızın parolasını kullanmayın.</p>':''}<p id="login-error" role="alert"></p><button class="team-button solid" type="submit">${isClaim?'Hesabı etkinleştir':'Güvenli giriş'} <span>→</span></button></form><p class="login-footnote">${isClaim?'<button class="team-link" data-team="login">Giriş ekranına dön</button>':'Hesabınız yoksa veya parolanızı unuttuysanız kurum yöneticinizden davet / parola yenileme bağlantısı isteyin.'}</p></div></section></div>`;
    $('#team-login-form').onsubmit=async e=>{
      e.preventDefault();const f=new FormData(e.target),btn=e.target.querySelector('button[type=submit]');btn.disabled=true;$('#login-error').textContent='';
      try{
        if(isClaim){const result=await api('/claim','POST',{token:claim.token,name:String(f.get('name')||''),password:String(f.get('password'))});showLogin();$('#team-login-form [name=email]').value=result.email;message('Hesabınız hazır. Kişisel parolanızla giriş yapın.');}
        else{const res=await api('/login','POST',Object.fromEntries(f));state.user=res.user;window.DalProfiles?.register([res.user]);state.csrf=res.csrf;await load();}
      }catch(err){if($('#login-error'))$('#login-error').textContent=errorText(err);else message(errorText(err),true);}finally{btn.disabled=false;}
    };
  }
  async function load(){
    if(state.editor){location.href=base;return;}
    nav();
    const bid=new URLSearchParams(location.search).get('board');
    if(bid){
      try{
        state.initial=await api('/boards/'+encodeURIComponent(bid));state.serverDoc=D.clone(state.initial.doc);state.revision=state.initial.revision;
        $('#team-shell').classList.add('hidden');$('#app').classList.remove('hidden');
        await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='app.js';s.onload=resolve;s.onerror=()=>reject(new Error('Editör yüklenemedi.'));document.body.appendChild(s);});
      }catch(err){$('#app').classList.add('hidden');$('#team-shell').classList.remove('hidden');$('#team-shell').innerHTML=`<section class="team-empty"><h1>Çalışma açılamadı</h1><p>${E(errorText(err))}</p><a class="team-button solid" href="${E(base)}">Çalışmalara dön</a></section>`;}
    }else await dashboard();
  }
  async function dashboard(){
    if(window.DalHub)return window.DalHub.start(state.user);
    state.route='boards';const res=await api('/boards');state.boards=res.boards;
    const active=res.boards.filter(b=>!b.archived),cards=active.reduce((s,b)=>s+b.cards,0),open=active.reduce((s,b)=>s+b.tasks-b.done,0);
    $('#team-shell').innerHTML=`<div class="team-dashboard"><section class="dashboard-heading"><div><span class="team-eyebrow">BİRLİKTE İYİLİK · ÇALIŞMA MERKEZİ</span><h1>Birlikte planla.<br><span>Birlikte tamamla.</span></h1><p>Merhaba ${E(state.user.name.split(' ')[0])}. Organizasyon, görevler ve ekip hafızası burada buluşuyor.</p></div><div class="dashboard-actions">${state.user.role==='admin'?'<button class="team-button solid" data-team="new">+ Yeni çalışma</button><button class="team-button" data-team="import">JSON içe aktar</button>':''}</div></section><section class="team-summary"><div><strong>${active.length}</strong><span>aktif çalışma</span></div><div><strong>${cards}</strong><span>organizasyon kartı</span></div><div><strong>${open}</strong><span>açık iş</span></div><div class="summary-note"><span class="team-pulse"></span><div><strong>Tek güncel kayıt</strong><span>Veriler kurumun sunucusunda.</span></div></div></section><section class="section-title"><h2>Çalışma alanlarınız <span>${res.boards.length}</span></h2><button class="team-link" data-team="refresh">Yenile ↻</button></section><section class="team-boards">${res.boards.length?res.boards.map(b=>`<article class="team-board ${b.archived?'archived':''}"><div class="board-top"><span class="board-symbol">${symbol}</span>${badge(b.archived?'Arşiv':roleName[b.role])}</div><h3>${E(b.name)}</h3><p>${b.cards} kart <span>·</span> ${b.members} üye <span>·</span> Sürüm ${b.revision}</p><div class="board-progress"><i style="width:${b.tasks?Math.round(b.done/b.tasks*100):0}%"></i></div><div class="board-progress-meta"><span>${b.done} / ${b.tasks} iş tamamlandı</span><span>${b.tasks?Math.round(b.done/b.tasks*100):0}%</span></div><footer><small>${E(dateTime(b.updatedAt))}</small><a class="team-link" href="${E(base)}?board=${encodeURIComponent(b.id)}">Çalışmayı aç →</a></footer></article>`).join(''):`<div class="team-empty"><h3>Henüz bir çalışmaya dahil değilsiniz.</h3><p>${state.user.role==='admin'?'Boş bir organizasyon veya Birlikte İyilik öneri şablonuyla başlayın.':'Kurum yöneticiniz sizi ilgili çalışmaya eklediğinde burada görünecek.'}</p></div>`}</section><div class="team-note"><strong>Şema ortak, görünüm kişisel.</strong> Bir kartın görevleri, sorumlusu ve notları ekipçe paylaşılır. Yakınlaştırma, yerleşim ve dal açma tercihleri yalnız sizin ekranınızı etkiler.</div></div>`;
  }
  function home(){if(window.DalHub)return window.DalHub.go('today');if(state.editor){if(hasPending()&&!confirm('Henüz sunucuda olmayan değişiklikler var. Sayfadan ayrılmak istiyor musunuz?'))return;location.href=base;}else dashboard().catch(err=>message(errorText(err),true));}
  async function newBoard(){
    if(state.user.role!=='admin'){message('Yeni çalışma açma yetkisi kurum yöneticisindedir.',true);return;}
    dialog('Yeni ortak çalışma','Her çalışma, kendi üye ve yetki listesine sahiptir.',`<form id="new-board-form"><label>Çalışma adı<input name="name" value="Birlikte İyilik — Organizasyon" maxlength="250" required></label><label>Başlangıç yapısı<select name="template"><option value="education">Birlikte İyilik / TACEV öneri şablonu</option><option value="blank">Boş organizasyon</option><option value="project">Proje organizasyonu</option></select></label><div class="team-note">Şablonlar öneridir; onaylanmış kurum yapısı veya gerçek personel ataması değildir. Mevcut çalışmalar değiştirilmez.</div><button class="team-button solid" type="submit">Çalışmayı oluştur</button></form>`);
    $('#new-board-form').onsubmit=async e=>{e.preventDefault();try{if(hasPending()&&!await flush())throw new Error('Önce açık çalışmadaki bekleyen değişiklikleri kaydedin.');const f=new FormData(e.target),doc=C.newDocument(String(f.get('template')));doc.name=String(f.get('name')).trim();const r=await api('/boards','POST',{doc});location.href=base+'?board='+encodeURIComponent(r.id);}catch(err){formError(err);}};
  }
  function importBoard(){
    if(state.user.role!=='admin'){message('İçe aktarma yetkisi kurum yöneticisindedir.',true);return;}
    dialog('Dal dosyasını ekibe taşıyın','Dosya yeni bir çalışma olarak eklenir. Mevcut ortak kayıtların üzerine yazılmaz.',`<div class="team-note">Kartlar, görevler, notlar ve ilişkiler korunur. Dosyadaki sorumlu adları aktarılır; gerçek hesaplarla yeniden eşleştirmeniz gerekir. Yorum, üye yetkisi ve geçmiş JSON dosyasında bulunmaz.</div><form id="import-board-form"><label>Dal JSON dosyası<input id="team-import-file" type="file" accept=".json,application/json" required></label><button class="team-button solid">Yeni çalışma olarak içe aktar</button></form>`);
    $('#import-board-form').onsubmit=async e=>{e.preventDefault();try{const file=$('#team-import-file').files[0];if(!file||file.size>4.8*1024*1024)throw new Error('Dosya en fazla 4,8 MB olmalıdır.');if(hasPending()&&!await flush())throw new Error('Önce açık çalışmayı kaydedin.');const doc=C.validateStrict(JSON.parse(await file.text()));const res=await api('/boards','POST',{doc});location.href=base+'?board='+encodeURIComponent(res.id);}catch(err){formError(err);}};
  }
  function hasPending(){return !!(state.flight||state.retry||state.conflict||(state.editor&&state.serverDoc&&D.diff(state.serverDoc,state.editor.store.doc).length));}
  function canEdit(){return !!state.initial&&!state.initial.archived&&['manager','editor'].includes(state.initial.role)&&!state.conflict&&!state.blocked&&!state.historyBusy&&state.flight?.mode!=='undo'&&state.flight?.mode!=='redo';}
  function saveStatus(text,warn=false){const el=$('#save-state');if(el){el.classList.toggle('warning',warn);const label=text.startsWith('Sunucuyla eşitlendi')?'Tüm değişiklikler kaydedildi':text.startsWith('Bu sekmede güncel')?'Önizleme güncel':text;el.innerHTML='<span class="save-dot"></span>'+E(label);}}
  function pendingBanner(text){const el=$('#storage-notice');if(!el)return;el.classList.remove('hidden');el.innerHTML=`<span>${E(text)}</span><span class="pending-actions"><button data-team="retry" class="text-button">Yeniden dene</button><button data-team="draft" class="text-button">Taslağı indir</button>${state.conflict?'<button data-team="conflict" class="text-button">Çakışmayı incele</button>':''}<button data-team="reload" class="text-button">Sunucudaki sürüme dön</button></span>`;}
  function queue(){
    if(!state.editor||state.conflict||state.blocked)return;
    state.invalid=false;
    if(!hasPending()){saveStatus((window.DalDemo?'Bu sekmede güncel · s':'Sunucuyla eşitlendi · s')+state.revision);return;}
    saveStatus(state.retry?'Kayıt bekliyor — sekmeyi kapatmayın':'Kaydediliyor…',!!state.retry);
    if(!state.firstPendingAt)state.firstPendingAt=Date.now();clearTimeout(state.timer);state.timer=setTimeout(()=>flush(),Math.max(0,Math.min(1800,5000-(Date.now()-state.firstPendingAt))));
  }
  function decorate(){
    const allowed=canEdit();
    $$('[data-field],[data-task-field],[data-team-owner],[data-team-task-owner],[data-plan-field],#work-plan-form input,#work-plan-form select,#work-plan-form button[type=submit]').forEach(el=>el.disabled=!allowed);
    $('#document-name')?.toggleAttribute('disabled',!allowed);
    const mutators=['plan-add','add-child','add-sibling','duplicate','delete','paste-branch','rename','move-dialog','bulk','color-branch','order-up','order-down','delete-task','delete-link','delete-relation','relationship'];
    $$('[data-action]').forEach(el=>{if(mutators.includes(el.dataset.action))el.disabled=!allowed;if(['new','open'].includes(el.dataset.action))el.classList.toggle('hidden',state.user?.role!=='admin');});
    $$('#task-form input,#task-form button,#link-form input,#link-form button,#relation-form input,#relation-form select,#relation-form button,[data-color]').forEach(el=>el.disabled=!allowed);
    if($('#undo-btn'))$('#undo-btn').disabled=!allowed||hasPending()||!state.undo.length;
    if($('#redo-btn'))$('#redo-btn').disabled=!allowed||hasPending()||!state.redo.length;
    if(state.initial&&$('#team-live')){
      const others=(state.initial.presence||[]).filter(u=>u.id!==state.user.id);
      $('#team-live').innerHTML=state.initial.archived?badge('Arşiv · salt okunur'):`<span class="team-online" title="${E(others.map(u=>u.name+(u.nodeId?' — '+(state.serverDoc?.nodes.find(n=>n.id===u.nodeId)?.title||'seçili kart'):'')).join('\n')||'Değişiklikler proje üyeleriyle ortak kayda aktarılır.')}"><i></i>${others.length?others.length+' ekip üyesi açık':'Ortak çalışma'}</span>`;
    }
  }
  async function flush(notify=false,mode='normal'){
    clearTimeout(state.timer);state.firstPendingAt=0;
    if(!state.editor)return true;
    if(state.flight)return state.flight.promise;
    if(state.conflict||state.blocked){if(notify)message('Bekleyen kayıt uyarısını çözün. Taslağınız henüz sunucuda değil.',true);return false;}
    let pending=state.retry;
    if(!pending){
      const changes=D.diff(state.serverDoc,state.editor.store.doc);
      if(!changes.length){saveStatus((window.DalDemo?'Bu sekmede güncel · s':'Sunucuyla eşitlendi · s')+state.revision);if(notify)message('Bekleyen değişiklik yok.');return true;}
      if(!canEdit()){pendingBanner('Düzenleme yetkiniz yok. Taslağınızı indirip yöneticinizle paylaşabilirsiniz.');return false;}
      pending={payload:{operationId:uid(),changes,label:mode==='undo'?'Kendi değişikliği geri alındı':mode==='redo'?'Kendi değişikliği yinelendi':'Şema ve görevler güncellendi'},sent:D.clone(state.editor.store.doc),mode};
    }
    state.retry=null;state.invalid=false;state.flight=pending;saveStatus('Sunucuya kaydediliyor…');decorate();
    pending.promise=(async()=>{
      try{
        const res=await api('/boards/'+state.initial.id+'/changes','POST',pending.payload);
        const tail=D.diff(pending.sent,state.editor.store.doc),merged=D.apply(res.doc,tail);
        state.serverDoc=D.clone(res.doc);state.revision=res.revision;state.initial={...state.initial,...res};
        if(pending.mode==='undo'){state.undo.pop();state.redo.push(D.inverse(pending.payload.changes));}
        else if(pending.mode==='redo'){state.redo.pop();state.undo.push(D.inverse(pending.payload.changes));}
        else{state.undo.push(D.inverse(pending.payload.changes));state.redo=[];}
        state.undo=state.undo.slice(-40);state.redo=state.redo.slice(-40);
        if(merged.conflicts.length){state.conflict={changes:tail,state:res,local:D.clone(state.editor.store.doc),conflicts:merged.conflicts};pendingBanner('Kayıt sırasında aynı alan yeniden değişti. Son yazdıklarınız bu sekmede korunuyor.');saveStatus('Çakışma — son taslak bekliyor',true);}
        else{state.editor.receive(merged.doc);$('#storage-notice').classList.add('hidden');saveStatus(tail.length?'Son değişiklikler kaydedilecek…':'Sunucuyla eşitlendi · s'+state.revision);if(notify&&!tail.length)message('Değişiklikler ortak kayda işlendi.');}
        return !state.conflict&&!tail.length;
      }catch(err){
        if(err.status===409&&err.body?.state){state.conflict={changes:D.diff(state.serverDoc,state.editor.store.doc),state:err.body.state,local:D.clone(state.editor.store.doc),conflicts:err.body.conflicts||[]};pendingBanner('Aynı alan değiştirildi. Hiçbir değer sessizce ezilmedi; taslağınızı inceleyin.');saveStatus('Çakışma — kayıt duraklatıldı',true);}
        else if([400,413,422].includes(err.status)){state.invalid=true;pendingBanner(errorText(err)+' Alanları düzelttiğinizde yeniden kaydedilir.');saveStatus('Doğrulama — taslak düzeltilmeli',true);}
        else if([401,403,404,409].includes(err.status)){state.blocked=true;pendingBanner(errorText(err)+' Taslağınızı indirerek koruyabilirsiniz.');saveStatus('Kayıt uygulanmadı',true);}
        else{state.retry=pending;pendingBanner('Bağlantı / sunucu sorunu. Bekleyen değişiklikler yalnız bu sekmede; sekmeyi kapatmayın.');saveStatus('Sunucu onayı bekleniyor',true);}
        if(notify)message(errorText(err),true);return false;
      }finally{state.flight=null;decorate();if(!state.retry&&!state.conflict&&!state.blocked&&!state.invalid&&hasPending())queue();}
    })();
    return pending.promise;
  }
  async function poll(){
    if(!state.initial||state.busy||state.historyBusy||document.hidden||!navigator.onLine)return;
    state.busy=true;
    try{
      const res=await api('/boards/'+state.initial.id+'?since='+state.revision);
      state.initial={...state.initial,role:res.role,archived:res.archived,members:res.members,presence:res.presence};
      if(res.doc&&res.revision>state.revision&&!state.historyBusy&&!hasPending()&&!state.editor.editing()){
        state.serverDoc=D.clone(res.doc);state.revision=res.revision;state.initial={...state.initial,...res};state.editor.receive(res.doc);saveStatus((window.DalDemo?'Bu sekmede güncel · s':'Sunucuyla eşitlendi · s')+state.revision);
      }
      if(!window.DalFirebase&&Date.now()-state.lastHeartbeat>30000){state.lastHeartbeat=Date.now();await api('/boards/'+state.initial.id+'/presence','POST',{nodeId:state.editor.selected||''});}
      if(state.retry&&!state.blocked&&!state.conflict)await flush();
      decorate();
    }catch(err){if([401,403,404].includes(err.status)){state.blocked=true;pendingBanner('Oturum veya çalışma erişimi sona erdi. Bekleyen taslağınızı indirip yeniden giriş yapın.');saveStatus('Erişim doğrulanamadı',true);decorate();}else if(!state.flight){saveStatus('Sunucuya ulaşılamıyor',true);}}
    finally{state.busy=false;}
  }
  function attach(editor){
    state.editor=editor;nav();decorate();
    if(window.DalHub)window.DalHub.onEditor(editor,state.initial);
    const node=new URLSearchParams(location.search).get('node');if(node&&editor.store.doc.nodes.some(n=>n.id===node))editor.select(node,true,true);
    state.pollTimer=setInterval(poll,30000);poll();
    window.addEventListener('beforeunload',e=>{if(hasPending()){e.preventDefault();e.returnValue='';}});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll();});
    window.addEventListener('online',()=>{if(state.retry)flush();poll();});
    window.addEventListener('offline',()=>{saveStatus('Çevrimdışı — sunucuya kayıt yok',true);pendingBanner('Bağlantı kesildi. Yeni değişiklikler bu sekmede bekler; sayfayı kapatmayın.');});
    saveStatus((window.DalDemo?'Bu sekmede güncel · s':'Sunucuyla eşitlendi · s')+state.revision);
  }
  async function undo(redo=false){
    if(!canEdit()||hasPending())return message('Önce bekleyen değişiklikleri sunucuyla eşitleyin.',true);
    const stack=redo?state.redo:state.undo,patch=stack.at(-1);if(!patch)return;
    // Prevent local edits and poll application while fetching an inverse operation.
    state.historyBusy=true;decorate();
    try{
      const latest=await api('/boards/'+state.initial.id);
      const result=D.apply(latest.doc,patch);
      if(result.conflicts.length)return message('Bu alan sizden sonra değiştirilmiş. Diğer kişinin çalışmasını korumak için geri alma uygulanmadı.',true);
      C.validate(result.doc);state.serverDoc=D.clone(latest.doc);state.revision=latest.revision;state.initial={...state.initial,...latest};state.editor.receive(result.doc);
      state.historyBusy=false;
      await flush(true,redo?'redo':'undo');
    }catch(err){message(errorText(err),true);}
    finally{state.historyBusy=false;decorate();}
  }
  function draft(){if(state.editor)download(state.editor.store.doc,'Dal_Ekip_KAYDEDILMEMIS_TASLAK.json');}
  function reload(){if(hasPending()&&!confirm('Sunucuya kaydedilmeyen taslak bırakılacak. Gerekliyse önce “Taslağı indir” seçeneğini kullanın. Devam edilsin mi?'))return;state.retry=null;state.flight=null;state.conflict=null;state.blocked=false;if(state.editor)state.serverDoc=D.clone(state.editor.store.doc);location.reload();}
  function conflictLabel(path,c){
    const labels={title:'Başlık',text:'İş metni',parentId:'Üst birim',type:'Kart türü',owner:'Sorumlu adı',ownerUserId:'Sorumlu hesap',assignee:'Görev sorumlusu',assigneeId:'Görev hesabı',role:'Rol',description:'Açıklama',responsibilities:'Sorumluluklar',goals:'Hedefler',notes:'Notlar',status:'Durum',priority:'Öncelik',progress:'İlerleme',dueDate:'Son tarih',done:'Tamamlanma',color:'Renk',tags:'Etiketler',order:'Sıra',tasks:'İşler',links:'Bağlantılar',url:'Adres',label:'Etiket',from:'Kaynak kart',to:'Hedef kart',name:'Çalışma adı'};
    const last=labels[path.at(-1)]||'Kayıt';
    if(path[0]==='nodes'){
      const n=state.serverDoc?.nodes.find(n=>n.id===path[1])||c.local.nodes.find(n=>n.id===path[1])||c.state.doc.nodes.find(n=>n.id===path[1]);
      const parts=[n?.title||'Kart'];
      if(path[2]==='tasks')parts.push(n?.tasks?.find(t=>t.id===path[3])?.text||'İş');
      else if(path[2]==='links')parts.push('Belge bağlantısı');
      if(path.length>2)parts.push(last);else parts.push('Kartın tamamı');
      return parts.join(' · ');
    }
    return (path[0]==='relations'?'Birimler arası ilişki':'Çalışma bilgisi')+' · '+last;
  }
  function conflictValue(slot){
    if(!slot.exists)return '(kayıt yok / silinmiş)';
    if(typeof slot.value==='string')return slot.value||'(boş)';
    if(typeof slot.value==='boolean')return slot.value?'Evet':'Hayır';
    return JSON.stringify(slot.value,null,2);
  }
  function conflictDialog(){
    const c=state.conflict;if(!c)return;
    const current=D.project(c.state.doc);
    const rows=c.changes.map((ch,i)=>{const remote=D.slot(current,ch.path),clash=!D.equal(remote,ch.before);return {ch,remote,clash,i};});
    dialog('İki değişiklik karşılaştı','Farklı alanlar birlikte korunur. Aynı alanda hangi değerin kullanılacağına siz karar verirsiniz.',`<div class="conflict-list">${rows.map(({ch,remote,clash,i})=>`<section class="conflict-item"><strong>${E(conflictLabel(ch.path,c))}</strong>${clash?badge('Aynı alan değişmiş'):badge('Çakışmıyor')}<div class="conflict-values"><div><small>Sunucudaki</small><pre>${E(conflictValue(remote))}</pre></div><div><small>Bu sekmedeki</small><pre>${E(conflictValue(ch.after))}</pre></div></div>${clash?`<label>Bu alan için<select data-conflict-choice="${i}"><option value="remote">Sunucudaki değeri koru</option><option value="mine">Benim değerimi uygula</option></select></label>`:'<p class="team-hint">Sizin değişikliğiniz korunacak.</p>'}</section>`).join('')}</div><p class="team-hint">Silinmiş üst kayıt veya değişmiş hiyerarşi yeniden kurulmadan birleştirilemez. Bu durumda taslağı indirip sunucudaki sürümde devam edin.</p><div class="team-row"><button class="team-button" data-team="draft">Taslağı indir</button><button class="team-button solid" data-team="resolve">Seçimleri uygula</button></div>`,'conflict');
  }
  async function resolve(){
    const c=state.conflict;if(!c)return;
    try{
      const tree=D.project(c.state.doc),patch=[];
      c.changes.forEach((ch,i)=>{const current=D.slot(tree,ch.path),clash=!D.equal(current,ch.before);if(clash&&$(`[data-conflict-choice="${i}"]`)?.value!=='mine')return;if(!D.equal(current,ch.after))patch.push({...ch,before:current});});
      const merged=D.apply(c.state.doc,patch);if(merged.conflicts.length)throw new Error('Üst kayıt silinmiş. Taslağı indirip sunucudaki sürümde yeniden düzenleyin.');
      const doc=C.validate(merged.doc);state.serverDoc=D.clone(c.state.doc);state.revision=c.state.revision;state.initial={...state.initial,...c.state};state.conflict=null;state.retry=null;state.blocked=false;state.editor.receive(doc);close();$('#storage-notice').classList.add('hidden');await flush(true);
    }catch(err){formError(err);}
  }
  function ownerOptions(id){
    const ms=(state.initial?.members||[]).filter(u=>u.active);
    let out='<option value="">Ekip hesabına bağlanmadı</option>'+ms.map(u=>`<option value="${E(u.id)}" ${u.id===id?'selected':''}>${E(u.name)}</option>`).join('');
    if(id&&!ms.some(u=>u.id===id))out+=`<option value="${E(id)}" selected>Önceki sorumlu (üyelik kapalı)</option>`;
    return out;
  }
  function ownerField(n){return `<label class="field"><span>Sorumlu ekip üyesi</span><select data-team-owner aria-label="Kartın ekip sorumlusu">${ownerOptions(n.ownerUserId)}</select><small class="team-hint">Görev kartları kişinin “Görevlerim” listesinde görünür.</small></label>`;}
  function taskOwnerField(t){return `<select data-team-task-owner="${E(t.id)}" aria-label="İşin ekip hesabı">${ownerOptions(t.assigneeId)}</select>`;}
  async function myWork(){
    if(window.DalHub)return window.DalHub.go('tasks');
    try{
      const res=await api('/my-work'),today=new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Istanbul'});
      const items=[...res.items].sort((a,b)=>Number(a.done)-Number(b.done)||(a.dueDate||'9999').localeCompare(b.dueDate||'9999'));
      dialog('Görevlerim','Kendi hesabınıza bağlanmış kart ve işler. Serbest metin olarak yazılmış isimler otomatik eşleştirilmez.',`<div class="my-work-list">${items.length?items.map(x=>`<article class="my-work-item ${x.done?'done':''}"><span class="work-check">${x.done?'✓':'○'}</span><div><strong>${E(x.text)}</strong><p>${E(x.boardName)} · ${x.type==='task'?E(x.nodeTitle):'Kart sorumluluğu'}</p>${x.dueDate?`<small class="${!x.done&&x.dueDate<today?'late':''}">${E(x.dueDate)}${!x.done&&x.dueDate<today?' · Tarihi geçti':''}</small>`:''}</div><a class="team-link" href="${E(base)}?board=${encodeURIComponent(x.boardId)}&node=${encodeURIComponent(x.nodeId)}">Aç →</a></article>`).join(''):'<div class="team-empty"><h3>Hesabınıza bağlı görev yok.</h3><p>Karttaki “Ekip hesabına ata” alanı ile gerçek kullanıcı eşleştirmesi yapılmalıdır.</p></div>'}</div>`,'my-work');
    }catch(err){message(errorText(err),true);}
  }
  async function users(){
    if(window.DalDemo){
      const data=await api('/users');
      dialog('Demo ekibi','Üç kişinin sorumluluklarıyla hazırlanmış örnek çalışma alanı.',`<section class="team-users-list">${data.users.map(u=>`<article><span class="team-avatar">${E(u.name.slice(0,1))}</span><div><strong>${E(u.name)}</strong><small>${E(u.title||'')}</small></div></article>`).join('')}</section><p class="team-hint">Alttaki “Görünümü seç” alanından ekip üyeleri arasında geçiş yapabilirsiniz. Görevler bu sekmede geçici olarak tutulur; sayfa yenilendiğinde örnek plana döner.</p>`,'users');
      return;
    }
    try{
      const [data,boards]=await Promise.all([api('/users'),api('/boards')]);state.boards=boards.boards;
      dialog('Ekip ve hesap yönetimi','Kurum yöneticileri tüm çalışmalara erişebilir. Diğer üyeler yalnız eklenmiş oldukları çalışmaları görür.',`<form id="invite-form" class="team-invite-form"><h3>Yeni ekip üyesi davet edin</h3><label>E-posta<input name="email" type="email" required maxlength="254" placeholder="ad@kurum.org"></label><div class="team-grid2"><label>İlk çalışma<select name="boardId"><option value="">Şimdilik çalışma atama</option>${state.boards.filter(b=>!b.archived).map(b=>`<option value="${E(b.id)}">${E(b.name)}</option>`).join('')}</select></label><label>Çalışma yetkisi<select name="role">${Object.entries(roleName).map(([k,v])=>`<option value="${k}" ${k==='editor'?'selected':''}>${E(v)}</option>`).join('')}</select></label></div><button class="team-button solid" type="submit">Davet bağlantısı oluştur</button><p class="team-hint">E-posta otomatik gönderilmez. Oluşan tek kullanımlık bağlantıyı ilgili kişiye güvenli bir kanaldan iletin.</p></form><section class="team-users-list">${data.users.map(u=>`<article><span class="team-avatar">${E(u.name.slice(0,1))}</span><div><strong>${E(u.name)}</strong><small>${E(u.email)} · ${u.role==='admin'?'Kurum yöneticisi':'Ekip üyesi'} · ${u.active?'Aktif':'Erişimi kapalı'}</small></div><div class="team-user-actions"><button class="team-link" data-team="reset-user" data-id="${E(u.id)}" ${!u.active?'disabled':''}>Parola bağlantısı</button><button class="team-link" data-team="edit-user" data-id="${E(u.id)}" data-role="${E(u.role)}" data-active="${u.active}">Yetki / erişim</button></div></article>`).join('')}</section>`,'users');
      $('#invite-form').onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));data.boardId||=null;try{const r=await api('/invitations','POST',data);tokenDialog(r,'Davet bağlantısı');}catch(err){formError(err);}};
    }catch(err){message(errorText(err),true);}
  }
  function tokenDialog(result,title){
    if(window.DalFirebase&&result.reset){window.DalFirebase.reset(result.email).then(()=>message('Parola yenileme e-postası gönderildi.')).catch(formError);return;}
    dialog(title,'Bu bağlantıya sahip kişi ilgili hesabı etkinleştirebilir. Herkese açık bir yere yapıştırmayın.',`<label>Tek kullanımlık bağlantı<textarea id="team-token-url" readonly rows="4">${E(result.url)}</textarea></label><p class="team-hint">Geçerlilik: ${result.expiresInHours} saat. Otomatik e-posta gönderilmedi.</p><button class="team-button solid" data-team="copy-token">Bağlantıyı kopyala</button>`);
  }
  function editUser(el){
    const id=el.dataset.id,role=el.dataset.role,active=el.dataset.active==='true';
    dialog('Hesabın erişimini düzenleyin','Rol veya aktiflik değiştiğinde kullanıcının mevcut oturumları kapatılır.',`<form id="edit-user-form"><label>Kurum rolü<select name="role"><option value="member" ${role==='member'?'selected':''}>Ekip üyesi</option><option value="admin" ${role==='admin'?'selected':''}>Kurum yöneticisi — tüm çalışmalara erişir</option></select></label><label>Erişim<select name="active"><option value="true" ${active?'selected':''}>Aktif</option><option value="false" ${!active?'selected':''}>Erişimi kapat</option></select></label><button class="team-button solid">Değişikliği uygula</button></form>`);
    $('#edit-user-form').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);try{await api('/users/'+id,'PATCH',{role:f.get('role'),active:f.get('active')==='true'});if(id===state.user.id){location.href=base;}else await users();}catch(err){formError(err);}};
  }
  async function members(){
    if(!state.initial)return;
    if(window.DalDemo){
      const fresh=await api('/boards/'+state.initial.id);
      dialog('Proje ekibi','Demo bağlantısı herkese açık. Her kişinin denemeleri kendi sekmesinde kalır.',`<div class="team-note"><strong>${E(fresh.name)}</strong></div><div class="team-members-list">${fresh.members.map(u=>`<article><span class="team-avatar">${E(u.name.slice(0,1))}</span><div><strong>${E(u.name)}</strong><small>${E(u.title||roleName[u.role])}</small></div></article>`).join('')}</div><label>Demo bağlantısı<textarea id="team-token-url" readonly rows="3">${E(location.href.split('?')[0])}</textarea></label><button class="team-button solid" data-team="copy-token">Bağlantıyı kopyala</button><p class="team-hint">Bu bağlantı ekip demosunu açar. Kendi görev ve yorum denemeleriniz başkalarına aktarılmaz.</p>`,'members');
      return;
    }
    try{
      const fresh=await api('/boards/'+state.initial.id),manage=fresh.role==='manager';state.initial={...state.initial,...fresh};
      const directory=manage?await api('/directory'):{users:[]};
      dialog('Çalışma üyeleri','Yetkiler bu çalışmanın tamamını kapsar. Hassas bir dalı ayrı ve sınırlı üyeli bir çalışma olarak tutun.',`<div class="team-note"><strong>${E(fresh.name)}</strong><br>Yönetici: üyeler ve geri yükleme. Düzenleyici: bütün kartlar ve işler. Yorumcu: okuma ve yorum. İzleyici: okuma ve dışa aktarma.</div>${manage?`<form id="member-form"><div class="team-grid2"><label>Ekip üyesi<select name="userId" required><option value="">Kişi seçin…</option>${directory.users.map(u=>`<option value="${E(u.id)}">${E(u.name)}</option>`).join('')}</select></label><label>Yetki<select name="role">${Object.entries(roleName).map(([k,v])=>`<option value="${k}" ${k==='editor'?'selected':''}>${E(v)}</option>`).join('')}</select></label></div><button class="team-button solid">Üyeliği ekle / güncelle</button></form>`:''}<div class="team-members-list">${fresh.members.map(u=>`<article><span class="team-avatar">${E(u.name.slice(0,1))}</span><div><strong>${E(u.name)}</strong><small>${E(roleName[u.role])}${!u.active?' · Hesap kapalı':''}</small></div>${manage?`<button class="team-link danger-text" data-team="remove-member" data-id="${E(u.id)}">Çıkar</button>`:''}</article>`).join('')}</div>${manage?`<div class="team-note">Kurum yöneticileri bu listeye eklenmeseler de erişebilir.</div><button class="team-button" data-team="archive">${fresh.archived?'Arşivden çıkar':'Çalışmayı arşivle'}</button>`:''}`,'members');
      if(manage)$('#member-form').onsubmit=async e=>{e.preventDefault();try{await api('/boards/'+fresh.id+'/members','PUT',Object.fromEntries(new FormData(e.target)));await members();state.editor?.refresh();}catch(err){formError(err);}};
    }catch(err){message(errorText(err),true);}
  }
  async function comments(){
    if(!state.editor)return;
    const n=state.editor.store.doc.nodes.find(n=>n.id===state.editor.selected),allowed=!state.initial.archived&&state.initial.role!=='viewer';
    dialog('Kartın konuşmaları',n.title,`<div id="team-comments-list" class="team-comments">Yorumlar yükleniyor…</div>${allowed?'<form id="comment-form"><label>Ekibe not bırakın<textarea name="body" rows="3" maxlength="5000" required placeholder="Sorun, karar gerekçesi veya bir sonraki adım…"></textarea></label><button class="team-button solid">Yorumu gönder</button></form>':'<p class="team-hint">Bu çalışmada yorum ekleme yetkiniz yok veya çalışma arşivlenmiş.</p>'}<p class="team-hint">Son 100 yorum gösterilir. Konuşmalar 5 saniyede bir yenilenir. Yorumlar biçimlendirilmemiş metindir.</p>`,'comments');
    window.DalCoord?.mentions($('#team-dialog'),state.initial.members);let requestId=uid(),lastBody='';
    const refresh=async()=>{
      try{
        const res=await api('/boards/'+state.initial.id+'/comments?nodeId='+encodeURIComponent(n.id));
        if($('#team-dialog').dataset.mode!=='comments'||!$('#team-comments-list'))return;
        $('#team-comments-list').innerHTML=res.comments.length?res.comments.slice().reverse().map(c=>`<article><header><strong>${E(c.author)}</strong><small>${E(dateTime(c.createdAt))}</small>${allowed&&(c.userId===state.user.id||state.initial.role==='manager')?`<button class="team-link" data-team="delete-comment" data-id="${E(c.id)}">Kaldır</button>`:''}</header><p>${E(c.body)}</p></article>`).join(''):'<div class="team-empty">Henüz yorum yok. Konuyu kartın yanında konuşun.</div>';
      }catch(err){if($('#team-comments-list'))$('#team-comments-list').textContent=errorText(err);}
    };
    state.refreshComments=refresh;await refresh();state.commentTimer=setInterval(()=>{if(!document.hidden&&navigator.onLine)refresh();},45000);
    if(allowed)$('#comment-form').onsubmit=async e=>{e.preventDefault();const text=new FormData(e.target).get('body').trim(),btn=e.target.querySelector('button');if(text!==lastBody){requestId=uid();lastBody=text;}btn.disabled=true;try{await api('/boards/'+state.initial.id+'/comments','POST',{nodeId:n.id,body:text,operationId:requestId});e.target.reset();requestId=uid();lastBody='';await refresh();}catch(err){formError(err);}finally{btn.disabled=false;}};
  }
  async function history(){
    if(!state.initial)return;
    try{
      const bid=state.initial.id,res=await api('/boards/'+bid+'/history'),expected=state.revision;
      dialog('Kayıt geçmişi','Kim, neyi, ne zaman değiştirdi? İlk sürüm ve son 30 sürüm sıkıştırılarak saklanır. Veri değiştiğinde alınan son 7 günlük yedek tutulur.',`${state.initial.role==='manager'&&window.DalFirebase&&!window.DAL_CONFIG?.emulators?'<div class="team-note"><button class="team-link" data-team="backup-metadata">Kayıt yedeğini indir</button> · <button class="team-link" data-team="backup-full">Dosyalarla tam ZIP indir</button><p>Günlük yedek kayıtları ve dosya bağlantılarını içerir. Tam ZIP ayrıca dosyaları içerir; en fazla 100 MB.</p></div>':''}<details class="team-snapshots"><summary>Tam sürüm kopyaları ve geri yükleme</summary>${res.snapshots.map(s=>`<article><div><strong>Sürüm ${s.revision}</strong><small>${E(s.actor)} · ${E(dateTime(s.created_at))}</small></div><button class="team-link" data-team="snapshot-download" data-revision="${s.revision}">JSON indir</button>${state.initial.role==='manager'&&!state.initial.archived?`<button class="team-link" data-team="snapshot-restore" data-revision="${s.revision}" data-expected="${expected}">Geri yükle</button>`:''}</article>`).join('')}</details><div class="team-history">${res.events.map(ev=>`<article><i></i><div><strong>${E(ev.actor||'Sistem')}</strong><p>${E(kindName[ev.action]||ev.action)}${ev.detail.label?' · '+E(ev.detail.label):''}${ev.detail.revision?' · s'+ev.detail.revision:''}</p><small>${E(dateTime(ev.created_at))}</small></div></article>`).join('')}</div>${res.nextBefore?'<p class="team-hint">En yeni 100 hareket gösteriliyor. Daha eski kayıtlar sunucuda tutulur ve sayfalı API üzerinden alınabilir.</p>':''}<div class="team-note">Tüm çalışma geri yüklemesi yalnız yönetici içindir. İşlem yeni bir sürüm oluşturur; mevcut geçmişi silmez.</div>`,'history');
    }catch(err){message(errorText(err),true);}
  }
  function help(){dialog('Ortak çalışma nasıl işler?','Bu sürüm, tek kişilik HTML uygulaması değil; kimlik doğrulamalı bir ekip sistemidir.',`<div class="team-help"><h3>Organizasyonu kurun</h3><p>Alt kart / eş düzey kart ekleyin. Sürükleyerek bağlılığı değiştirin. Notlar bölümünde amaç, sorumluluk, hedef ve belge bağlantılarını yazın. “İşler” bölümünde iş, sorumlu ve tarih belirleyin.</p><h3>İsim ile hesabı ayırın</h3><p>“Ekip hesabına ata” gerçek kullanıcıya bağlar ve Görevlerim ekranına yansır. Serbest metin isimleri kişi eşleştirmesi veya giriş yetkisi oluşturmaz.</p><h3>Ortak kaydı koruyun</h3><p>İçerik değişiklikleri otomatik gönderilir. Diğer ekip üyelerinin kaydettiği değişiklikler yaklaşık 30 saniyede bir yapılan sorgularla alınır. Aynı alan eşzamanlı değişirse otomatik ezme yerine karşılaştırma açılır. Aynı metinde karakter karakter ortak yazım yoktur.</p><h3>Görünümünüz size aittir</h3><p>Yakınlaştırma, dal açma/kapama, serbest konum ve yerleşim modu diğer kullanıcıların ekranını değiştirmez. Bu tercihler yalnız açık sekmenin belleğinde tutulur.</p><h3>Bağlantı yokken</h3><p>Sunucu onayı alınmayan değişiklikler henüz paylaşılmamıştır. Sekmeyi kapatmayın; “Taslağı indir” ile koruyun. Bu sürüm çevrimdışı öncelikli bir uygulama değildir.</p><h3>Yetkiler</h3><p>Yetkiler çalışma düzeyindedir, tek dal düzeyinde değildir. Bir çalışmaya erişebilen herkes o çalışmanın tüm kartlarını, notlarını, yorumlarını ve geçmişini görebilir. Hassas ayrıntıları ayrı bir çalışmaya ayırın. Öğrenci sağlık, kimlik veya özel aile bilgilerini buraya girmeyin.</p><h3>Kısayollar</h3><p>Tab: alt kart. Enter: eş düzey. Ctrl/⌘ S: sunucuyla eşitle. Ctrl/⌘ Z: yalnız kendi son kayıtlı değişikliğini kontrollü geri al. 0: ekrana sığdır. Ctrl/⌘ K: ara.</p><h3>Sınırlar</h3><p>MindManager .mmap desteği yoktur. Görev ayrıntılarında dosya yükleyebilir, bağımlılık ve tekrar tanımlayabilirsiniz. Otomatik ekip e-postası, telefon bildirimi ve karakter düzeyinde ortak yazım yoktur. JSON belge yedeğidir; üye, yorum ve geçmiş için sunucu yedeği gerekir.</p></div>`);}
  function account(){
    document.body.classList.remove('hub-menu-open');nav();
    const profile=window.DalProfiles.form(state.user);
    const password=window.DalDemo?'':`<details class="profile-password"><summary>Parola ve güvenlik</summary><form id="password-form"><p class="team-hint">Parolanızı Firebase’in e-posta bağlantısıyla yenileyin.</p><button class="team-button" type="submit">Parola yenileme e-postası gönder</button></form></details><hr><button class="team-button" data-team="logout">Bu oturumdan çıkış yap</button>`;
    dialog('Profilim',state.user.email||'Yerel önizleme',profile+password,'profile');
    window.DalProfiles.mount(state.user,{api,canSave:()=>!hasPending(),onSaved:async user=>{
      state.user=user;window.DalProfiles.register([user]);close();nav();message('Profiliniz kaydedildi.');
      if(!state.editor)await window.DalHub?.start(user);
    }});
    const form=$('#password-form');if(form)form.onsubmit=async e=>{e.preventDefault();try{if(hasPending())throw new Error('Önce bekleyen taslağı kaydedin veya indirin.');await api('/password','POST',{});message('Parola yenileme bağlantısı e-postanıza gönderildi.');close();}catch(err){formError(err);}};
  }
  async function handle(action,el){
    if(action==='home')return home();if(action==='close')return close();if(action==='refresh')return dashboard();if(action==='new')return newBoard();if(action==='import')return importBoard();if(action==='my-work')return myWork();if(action==='users')return users();if(action==='members')return members();if(action==='comments')return comments();if(action==='history')return history();if(action==='account')return account();if(action==='draft')return draft();if(action==='reload')return reload();if(action==='conflict')return conflictDialog();if(action==='resolve')return resolve();if(action==='login')return showLogin();
    if(action==='retry'){if(state.conflict)return conflictDialog();state.blocked=false;return flush(true);}
    if(action==='logout'){if(hasPending()&&!confirm('Kaydedilmemiş taslak var. Önce indirmeniz önerilir. Yine de çıkış yapılsın mı?'))return;await api('/logout','POST');state.serverDoc=state.editor?D.clone(state.editor.store.doc):null;state.retry=state.flight=state.conflict=null;location.href=base;return;}
    if(action==='copy-token'){const text=$('#team-token-url');try{await navigator.clipboard.writeText(text.value);message('Bağlantı kopyalandı.');}catch(_){text.select();message('Bağlantıyı seçtim. Ctrl/⌘ C ile kopyalayın.');}return;}
    if(action==='edit-user')return editUser(el);
    if(action==='reset-user'){if(!confirm('Bu kullanıcı için tek kullanımlık parola yenileme bağlantısı oluşturulsun mu?'))return;return tokenDialog(await api('/users/'+el.dataset.id+'/reset','POST'),'Parola yenileme bağlantısı');}
    if(action==='remove-member'){if(!confirm('Bu kişinin çalışma üyeliği kaldırılsın mı? Kurum yöneticilerinin genel erişimi ayrıca devam eder.'))return;await api('/boards/'+state.initial.id+'/members/'+el.dataset.id,'DELETE');return members();}
    if(action==='archive'){if(hasPending())throw new Error('Önce bekleyen değişiklikleri kaydedin.');if(!confirm(state.initial.archived?'Çalışma yeniden düzenlemeye açılsın mı?':'Çalışma herkes için salt okunur arşive alınsın mı?'))return;await api('/boards/'+state.initial.id+'/archive','PATCH',{archived:!state.initial.archived,expectedRevision:state.revision});close();await poll();return;}
    if(action==='delete-comment'){if(!confirm('Yorum görünümden kaldırılsın mı? İşlem geçmişte kaydedilir.'))return;await api('/boards/'+state.initial.id+'/comments/'+el.dataset.id,'DELETE');return state.refreshComments();}
    if(action==='backup-metadata'||action==='backup-full'){el.disabled=true;try{await window.DalFirebase.backup(state.initial.id,action==='backup-full'?'full':'metadata');}finally{el.disabled=false;}return;}
    if(action==='snapshot-download'){const res=await api('/boards/'+state.initial.id+'/snapshots/'+el.dataset.revision);return download(res.doc,'Dal_Ekip_Surum_'+el.dataset.revision+'.json');}
    if(action==='snapshot-restore'){
      if(hasPending())throw new Error('Önce bekleyen taslağı kaydedin.');
      const reason=prompt('Tüm çalışma seçilen sürüme dönecek. Gerekçeyi yazın (en az 5 karakter):');if(reason===null)return;
      const res=await api('/boards/'+state.initial.id+'/restore','POST',{revision:Number(el.dataset.revision),expectedRevision:Number(el.dataset.expected),reason});state.serverDoc=D.clone(res.doc);state.revision=res.revision;state.initial={...state.initial,...res};state.undo=[];state.redo=[];state.editor.receive(res.doc);close();message('Geri yükleme yeni bir sürüm olarak kaydedildi.');return;
    }
  }
  document.addEventListener('click',e=>{const el=e.target.closest('[data-team]');if(!el)return;e.preventDefault();Promise.resolve(handle(el.dataset.team,el)).catch(formError);});
  document.addEventListener('change',e=>{
    const el=e.target;
    if(!el.matches('[data-team-owner],[data-team-task-owner]'))return;
    try{if(!canEdit())throw new Error('Düzenleme yetkiniz yok.');const who=state.initial.members.find(u=>u.id===el.value);
      state.editor.store.change(doc=>{const n=doc.nodes.find(n=>n.id===state.editor.selected);if(el.hasAttribute('data-team-owner')){n.ownerUserId=el.value;if(who)n.owner=who.name;}else{const task=n.tasks.find(t=>t.id===el.dataset.teamTaskOwner);task.assigneeId=el.value;if(who)task.assignee=who.name;}});
    }catch(err){message(errorText(err),true);}
  });
  $('#team-dialog').addEventListener('close',()=>clearInterval(state.commentTimer));
  window.DalTeam={get initial(){return state.initial;},get user(){return state.user;},get revision(){return state.revision;},api,attach,queue,flush,hasPending,canEdit,decorate,ownerField,taskOwnerField,undo:()=>undo(false),redo:()=>undo(true),newBoard,importBoard,history,help,reload};
  if(window.DalDemo)window.DalTeam.setDemoUser=async user=>{state.user=user;await dashboard();};
  (async()=>{
    const hash=new URLSearchParams(location.hash.slice(1));let claim=null;
    if(hash.has('invite')||hash.has('reset')){const kind=hash.has('invite')?'invite':'reset';claim={kind,token:hash.get(kind)};window.history.replaceState(null,'',location.pathname+location.search);}
    if(claim){showLogin(claim);return;}
    try{const res=await api('/me');state.user=res.user;window.DalProfiles?.register([res.user]);state.csrf=res.csrf;await load();}
    catch(err){if([401,403].includes(err.status)){showLogin();if(err.status===403)$('#login-error').textContent=errorText(err);}else $('#team-shell').innerHTML=`<div class="team-empty"><h1>Ekip servisine bağlanılamadı</h1><p>${E(errorText(err))}</p><p>Bu sürüm HTML dosyasına çift tıklayarak çalışmaz. Sunucu üzerinden açılmalıdır.</p><button class="team-button" data-team="reload">Yeniden dene</button></div>`;}
  })();
})();
