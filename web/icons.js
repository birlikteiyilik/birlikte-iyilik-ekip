/* SVG line icons. Geometry is normalized for a consistent redraw gesture.
   Decorative only: control labels remain the accessible source of meaning. */
(() => {
  'use strict';
  const g=(part,body)=>`<g data-icon-part="${part}">${body}</g>`;
  const p=d=>`<path d="${d}"/>`;
  const icons={
    moon:g('crescent',p('M20.7 13.2A8.7 8.7 0 0 1 10.8 3.3 9 9 0 1 0 20.7 13.2Z')),
    sun:g('rays',p('M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6 19 19M5 19l1.4-1.4M17.6 6.4 19 5'))+g('core','<circle cx="12" cy="12" r="4"/>'),
    'work-list':g('row1',p('M10 6h11'))+g('row2',p('M10 12h11'))+g('row3',p('M10 18h7'))+g('tick',p('m2 6 2 2 3-4'))+g('boxes','<rect x="3" y="11" width="3" height="3" rx=".6"/><rect x="3" y="17" width="3" height="3" rx=".6"/>'),
    tasks:g('row1',p('M9 6h11M3 6h1'))+g('row2',p('M9 12h11M3 12h1'))+g('row3',p('M9 18h11M3 18h1')),
    folder:p('M3 8V5a2 2 0 0 1 2-2h4l3 3h7a2 2 0 0 1 2 2v11H3Z')+g('lid',p('M3 9h18v11H3Z')),
    hierarchy:g('root','<rect x="9" y="2" width="6" height="5" rx="1"/>')+g('branches',p('M12 7v5M4 17v-5h16v5M12 12v5'))+g('leaves','<rect x="1" y="17" width="6" height="5" rx="1"/><rect x="9" y="17" width="6" height="5" rx="1"/><rect x="17" y="17" width="6" height="5" rx="1"/>'),
    team:g('person1','<circle cx="9" cy="7" r="4"/>'+p('M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2'))+g('person2',p('M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87')),
    user:g('head','<circle cx="12" cy="7" r="4"/>')+g('body',p('M4 22v-3a8 8 0 0 1 16 0v3')),
    calendar:p('M8 2v4M16 2v4')+'<rect x="3" y="4" width="18" height="17" rx="2"/>'+p('M3 10h18')+g('date',p('M8 14h3M8 17h7')),
    bell:g('bell',p('M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9'))+g('clapper',p('M10 21h4')),
    check:g('tick','<path d="m5 12 4 4L19 6" pathLength="1"/>'),
    checkCircle:'<circle cx="12" cy="12" r="9"/>'+g('tick','<path d="m8 12 3 3 5-6" pathLength="1"/>'),
    'check-square':'<rect x="3" y="3" width="18" height="18" rx="3"/>'+g('tick','<path d="m7 12 3 3 7-7" pathLength="1"/>'),
    search:g('lens','<circle cx="10.5" cy="10.5" r="6.5"/>')+g('handle',p('m16 16 5 5')),
    arrow:g('arrow',p('M5 12h14m-5-5 5 5-5 5')),
    back:g('arrow',p('M19 12H5m5-5-5 5 5 5')),
    plus:g('vertical',p('M12 5v14'))+g('horizontal',p('M5 12h14')),
    minus:g('horizontal',p('M5 12h14')),
    share:p('M4 12v9h16v-9')+g('arrow',p('M12 15V3m-4 4 4-4 4 4')),
    download:p('M4 16v5h16v-5')+g('arrow',p('M12 3v12m-4-4 4 4 4-4')),
    layers:g('layer1',p('m12 3 10 5-10 5L2 8Z'))+g('layer2',p('M2 12l10 5 10-5'))+g('layer3',p('M2 16l10 5 10-5')),
    board:g('column1','<rect x="3" y="4" width="7" height="16" rx="1"/>')+g('column2','<rect x="14" y="4" width="7" height="10" rx="1"/>'),
    clock:'<circle cx="12" cy="12" r="9"/>'+g('hand',p('M12 7v5l3 2')),
    star:g('star',p('m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z')),
    link:g('link1',p('M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2'))+g('link2',p('M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2')),
    fit:g('corners',p('M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5'))+'<rect x="8" y="8" width="8" height="8" rx="1"/>',
    undo:g('arrow',p('M3 10h11a6 6 0 0 1 0 12M3 10l5-5M3 10l5 5')),
    redo:g('arrow',p('M21 10H10a6 6 0 0 0 0 12M21 10l-5-5M21 10l-5 5')),
    refresh:g('arrows',p('M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 3M5 15a8 8 0 0 0 13 3')),
    chat:g('bubble',p('M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z'))+g('dots',p('M8 11h.01M12 11h.01M16 11h.01')),
    help:'<circle cx="12" cy="12" r="9"/>'+g('question',p('M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 17h.01')),
    close:g('cross',p('m6 6 12 12M18 6 6 18')),
    sidebar:'<rect x="3" y="3" width="18" height="18" rx="2"/>'+g('panel',p('M9 3v18M5.5 7h1M5.5 11h1')),
    'panel-right':'<rect x="3" y="3" width="18" height="18" rx="2"/>'+g('panel',p('M15 3v18M18 7h.1M18 11h.1')),
    copy:g('backpage',p('M16 4V3H3v13h1'))+g('page','<rect x="8" y="8" width="13" height="13" rx="2"/>'),
    trash:g('lid',p('M3 6h18M8 6V3h8v3'))+g('bin',p('M5 6l1 15h12l1-15M10 10v7M14 10v7')),
    branch:p('M6 3v12a5 5 0 0 0 5 5h7')+g('arrow',p('M6 7h12m-3-3 3 3-3 3m0 7 3 3-3 3')),
    note:p('M14 2H4v20h16V8ZM14 2v6h6')+g('row1',p('M8 12h8'))+g('row2',p('M8 16h6')),
    'file-plus':p('M13 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10ZM13 2v8h8')+g('plus',p('M8 16h8M12 12v8')),
    shield:p('m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Z')+g('tick','<path d="m8 12 3 3 5-6" pathLength="1"/>'),
    leaf:g('leaf',p('M20 4c-7-1-15 0-15 8a5 5 0 0 0 5 5c8 0 9-8 10-13Z'))+g('stem',p('M4 21l10-10')),
    menu:g('row1',p('M4 6h16'))+g('row2',p('M4 12h16'))+g('row3',p('M4 18h16')),
    flag:p('M4 22V3')+g('cloth',p('M4 3c5-4 9 4 15 0v11c-6 4-10-4-15 0')),
    more:g('dot1',p('M5 12h.01'))+g('dot2',p('M12 12h.01'))+g('dot3',p('M19 12h.01')),
    down:g('arrow',p('m6 9 6 6 6-6')),
    chevron:g('arrow',p('m9 5 7 7-7 7')),
    info:'<circle cx="12" cy="12" r="9"/>'+g('info',p('M12 11v6M12 7h.01'))
  };
  const aliases={projects:'folder',org:'hierarchy',map:'hierarchy',list:'tasks',table:'board','arrow-right':'arrow','arrow-left':'back',maximize:'fit','chevron-down':'down'};
  function render(name,className='',fallback='') {
    const key=aliases[name]||name,body=(icons[key]||g('body',fallback)).replace(/<(path|circle|rect|line|polyline|polygon)\b([^>]*)>/g,(tag,shape,attrs)=>attrs.includes('pathLength=')?tag:'<'+shape+' pathLength="1"'+attrs+'>');
    return `<svg class="motion-icon ${className}" data-motion-icon="${key}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
  }
  window.DalIcons={render};
})();
