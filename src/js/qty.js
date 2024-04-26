window.qty = function () {
  const update = document.getElementById('update-cart');
  return {
    add(e) {
      let qty = this.$el.parentElement.querySelector('.qty');
      let max = parseInt(qty.getAttribute('data-max'), 10); // Ensure max is an integer
      let currentValue = parseInt(qty.value, 10); // Convert current value to integer
      if (currentValue < max) {
        qty.value = currentValue + 1;
        if (update) {
          update.click();
        }
      }
    },
    minus(e) {
      let qty = this.$el.parentElement.querySelector('.qty');
      let currentValue = parseInt(qty.value, 10); // Convert current value to integer
      if (currentValue > 1) {
        qty.value = currentValue - 1;
        if (update) {
          update.click();
        }
      }
    },
  };
};
