(function(){
  'use strict';

  // Drawer toggling (mobile menu, cart, search)
  function bindDrawer(){
    document.querySelectorAll('[data-drawer-open]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        var id = btn.getAttribute('data-drawer-open');
        openDrawer(id);
      });
    });
    document.querySelectorAll('[data-drawer-close]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var drawer = btn.closest('.drawer');
        if(drawer) closeDrawer(drawer.id);
      });
    });
    document.querySelectorAll('.drawer__overlay').forEach(function(ov){
      ov.addEventListener('click', function(){
        var id = ov.getAttribute('data-drawer-overlay');
        if(id) closeDrawer(id);
      });
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){
        document.querySelectorAll('.drawer.is-open').forEach(function(d){ closeDrawer(d.id); });
      }
    });
  }
  function openDrawer(id){
    var drawer = document.getElementById(id);
    var overlay = document.querySelector('[data-drawer-overlay="' + id + '"]');
    if(drawer) drawer.classList.add('is-open');
    if(overlay) overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer(id){
    var drawer = document.getElementById(id);
    var overlay = document.querySelector('[data-drawer-overlay="' + id + '"]');
    if(drawer) drawer.classList.remove('is-open');
    if(overlay) overlay.classList.remove('is-open');
    if(!document.querySelector('.drawer.is-open')) document.body.style.overflow = '';
  }

  // Quantity input controls
  function bindQuantity(){
    document.querySelectorAll('.quantity').forEach(function(el){
      var input = el.querySelector('input');
      if(!input) return;
      var dec = el.querySelector('[data-qty="dec"]');
      var inc = el.querySelector('[data-qty="inc"]');
      if(dec) dec.addEventListener('click', function(){
        var v = parseInt(input.value, 10) || 1;
        var min = parseInt(input.min, 10) || 1;
        if(v > min){ input.value = v - 1; input.dispatchEvent(new Event('change', {bubbles:true})); }
      });
      if(inc) inc.addEventListener('click', function(){
        var v = parseInt(input.value, 10) || 1;
        input.value = v + 1; input.dispatchEvent(new Event('change', {bubbles:true}));
      });
    });
  }

  // Product gallery thumbnail switching
  function bindGallery(){
    var gallery = document.querySelector('[data-gallery]');
    if(!gallery) return;
    var main = gallery.querySelector('[data-gallery-main] img');
    var thumbs = gallery.querySelectorAll('[data-gallery-thumb]');
    thumbs.forEach(function(t){
      t.addEventListener('click', function(){
        var src = t.getAttribute('data-src');
        var srcset = t.getAttribute('data-srcset');
        if(main && src){
          main.src = src;
          if(srcset) main.srcset = srcset;
        }
        thumbs.forEach(function(x){ x.classList.remove('is-active'); });
        t.classList.add('is-active');
      });
    });
  }

  // Variant selection
  function bindVariants(){
    document.querySelectorAll('[data-product-form]').forEach(function(form){
      var variantsScript = form.querySelector('[data-variants]');
      if(!variantsScript) return;
      var variants;
      try { variants = JSON.parse(variantsScript.textContent); } catch(e){ return; }
      var optionInputs = form.querySelectorAll('[data-option-index]');
      var idInput = form.querySelector('[name="id"]');
      var priceEl = form.querySelector('[data-price]');
      var comparePriceEl = form.querySelector('[data-compare-price]');
      var addBtn = form.querySelector('[data-add-to-cart]');
      var addBtnText = addBtn ? addBtn.querySelector('[data-add-to-cart-text]') : null;

      function getSelectedOptions(){
        var opts = [];
        optionInputs.forEach(function(input){
          var idx = parseInt(input.getAttribute('data-option-index'), 10);
          if(input.type === 'radio'){
            if(input.checked) opts[idx] = input.value;
          } else {
            opts[idx] = input.value;
          }
        });
        return opts;
      }
      function updateUI(){
        var selected = getSelectedOptions();
        var match = variants.find(function(v){
          return v.options.every(function(opt, i){ return opt === selected[i]; });
        });
        if(match){
          if(idInput) idInput.value = match.id;
          if(priceEl) priceEl.innerHTML = match.price_html;
          if(comparePriceEl) comparePriceEl.innerHTML = match.compare_html || '';
          if(addBtn){
            addBtn.disabled = !match.available;
            if(addBtnText) addBtnText.textContent = match.available ? (addBtn.getAttribute('data-text-add') || 'Add to cart') : (addBtn.getAttribute('data-text-soldout') || 'Sold out');
          }
          // Update URL with variant id
          if(history.replaceState){
            var url = new URL(window.location.href);
            url.searchParams.set('variant', match.id);
            history.replaceState({}, '', url.toString());
          }
        } else if(addBtn){
          addBtn.disabled = true;
          if(addBtnText) addBtnText.textContent = addBtn.getAttribute('data-text-unavailable') || 'Unavailable';
        }
      }
      optionInputs.forEach(function(input){
        input.addEventListener('change', updateUI);
      });
      // Highlight active swatches
      form.querySelectorAll('.variant__options').forEach(function(group){
        group.addEventListener('change', function(){
          group.querySelectorAll('.variant__option').forEach(function(label){
            var input = label.querySelector('input');
            if(input && input.checked) label.classList.add('is-active');
            else label.classList.remove('is-active');
          });
        });
      });
    });
  }

  // Auto-submit facet/sort forms
  function bindFacets(){
    document.querySelectorAll('[data-facet-form]').forEach(function(form){
      form.addEventListener('change', function(){ form.submit(); });
    });
  }

  // Cart line quantity updates (cart page)
  function bindCartUpdates(){
    document.querySelectorAll('[data-cart-form]').forEach(function(form){
      form.querySelectorAll('input[name^="updates"]').forEach(function(input){
        var debounce;
        input.addEventListener('change', function(){
          clearTimeout(debounce);
          debounce = setTimeout(function(){ form.submit(); }, 250);
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    bindDrawer();
    bindQuantity();
    bindGallery();
    bindVariants();
    bindFacets();
    bindCartUpdates();
  });
})();
