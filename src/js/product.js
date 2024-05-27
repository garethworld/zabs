window.product = function () {
  var currentVariant = document.getElementById('VariantId');
  var price = document.getElementById('product-price');
  var compareAtPrice = document.getElementById('compare-at-price');

  var add = document.getElementById('add-to-cart');
  return {
    init() {
      // move the recharge section to the recharge-container div
      const rechargeSection = document.querySelector(
        '#RechargeWidget_8504682610932',
      );
      const rechargeContainer = document.getElementById('recharge-container');

      if (rechargeSection && rechargeContainer) {
        rechargeContainer.appendChild(rechargeSection);
      }
      alert('product.js loaded');
    },
    setVariant(e) {
      e.preventDefault();
      const qty = document.querySelector('.qty');
      const variantId = this.$el.getAttribute('data-variant-id');
      const variantPrice = this.$el.getAttribute('data-variant-price');
      const variantAvailable = this.$el.getAttribute('data-variant-available');
      const compareAtVariantPrice = this.$el.getAttribute(
        'data-compare-at-variant-price',
      );
      currentVariant.value = variantId;
      price.innerHTML = variantPrice;
      if (compareAtVariantPrice) {
        compareAtPrice.classList.remove('hidden');
        compareAtPrice.innerHTML = compareAtVariantPrice;
      } else {
        compareAtPrice.classList.add('hidden');
      }
      // set max of qty input
      qty.setAttribute(
        'data-max',
        this.$el.getAttribute('data-variant-inventory'),
      );
      // set qty input value if it's greater than max
      if (qty.value > qty.getAttribute('data-max')) {
        qty.value = qty.getAttribute('data-max');
      }
      // set product price
      price.innerHTML = variantPrice;
      // activate add to cart button
      if (variantAvailable === 'true') {
        add.removeAttribute('disabled');
        add.classList.add('hover:bg-tint3');
        add.classList.remove('opacity-50');
        add.innerHTML = '<span class="my-auto inline-block">Add to cart</span>';
      } else {
        add.setAttribute('disabled', 'disabled');
        add.classList.remove('hover:bg-tint3');
        add.classList.add('opacity-50');
        add.innerHTML = '<span class="my-auto inline-block">Sold out</span>';
      }
      // set active class
      this.$el.classList.remove('bg-tint2', 'text-tint3');
      this.$el.classList.add('bg-tint3', 'text-tint2', 'active');
      // remove active class from other variants
      const variants = document.querySelectorAll('.variant');
      variants.forEach((variant) => {
        if (variant !== this.$el) {
          variant.classList.remove('bg-tint3', 'text-tint2', 'active');
          variant.classList.add('bg-tint2', 'text-tint3');
        }
      });
      // update the url with the variant id
      const url = new URL(window.location.href);
      url.searchParams.set('variant', variantId);
      window.history.pushState({}, '', url);

      // update the element current-var
      const currentVar = document.querySelector('#VariantId');
      currentVar.value = variantId;

      // set variant image if available
      const varimg = this.$el.getAttribute('data-variant-image');
      if (varimg) {
        const thumb = document.querySelector(`[data-img-id="${varimg}"]`);
        if (thumb) {
          thumb.click();
        }
      }
    },
  };
};
