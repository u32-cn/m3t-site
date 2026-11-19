
(function(){
  // 侧栏分区折叠（移动端）
  document.querySelectorAll('[data-u32-name="side-toggle"]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var box = btn.parentNode.querySelector('[data-u32-name="side-body"]');
      if(!box) return;
      var open = box.hasAttribute('hidden');
      if(open){ box.removeAttribute('hidden'); } else { box.setAttribute('hidden',''); }
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  // 图片灯箱
  var lb = document.querySelector('[data-u32-name="lightbox"]');
  if(lb){
    var lbImg = lb.querySelector('img');
    document.querySelectorAll('.prose img').forEach(function(img){
      img.addEventListener('click', function(){
        lbImg.src = img.src; lbImg.alt = img.alt || '';
        lb.classList.add('on');
      });
    });
    lb.addEventListener('click', function(){ lb.classList.remove('on'); lbImg.src=''; });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') lb.classList.remove('on'); });
  }
})();
