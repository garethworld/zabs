window.newsletter = function () {
  return {
    open() {
      var formID = this.$el.getAttribute('data-id');
      console.log(formID);
      window._klOnsite = window._klOnsite || [];
      window._klOnsite.push(['openForm', formID]);
    },
  };
};
// RjdCjJ   TA2Bfj
