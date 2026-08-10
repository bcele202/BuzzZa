// ... existing main.js content is preserved above; we'll append a diagnostic helper at the end of the file

// Diagnostic: detect elements wider than the viewport and highlight them (temporary)
(function(){
  function findOverflowingElements(root=document.body){
    const docWidth = document.documentElement.clientWidth;
    const overflowing = [];
    const all = root.querySelectorAll('*');
    all.forEach(el=>{
      // ignore elements that are not displayed
      const style = window.getComputedStyle(el);
      if(style.display === 'none' || style.visibility === 'hidden') return;
      const sw = el.scrollWidth;
      const cw = el.clientWidth;
      if(sw > docWidth + 1){ // allow 1px tolerance
        overflowing.push({el, sw, cw, tag: el.tagName, cls: el.className});
      }
    });
    return overflowing;
  }

  // Run diagnostic a short time after page init so rendering has settled
  window.addEventListener('load', ()=>{
    setTimeout(()=>{
      try{
        const list = findOverflowingElements();
        if(list.length){
          console.warn('Overflowing elements detected:', list.map(l=>({tag:l.tag, class:l.cls, scrollWidth:l.sw, clientWidth:l.cw})) );
          // add visible outlines to help identify on mobile (temporary)
          list.forEach(l=>{
            try{ l.el.style.outline = '3px solid rgba(255,0,0,0.6)'; l.el.style.zIndex = 9999; }catch(e){}
          });
        } else {
          console.info('No overflowing elements detected');
        }
      }catch(e){ console.error('Overflow diagnostic failed', e); }
    }, 500);
  });
})();
