window.password = function () {
  return {
    toggle(e) {
      var x = document.getElementById('CustomerPassword');
      if (x.type === 'password') {
        x.type = 'text';
        e.target.innerHTML = 'Hide password';
      } else {
        x.type = 'password';
        e.target.innerHTML = 'Show password';
      }
    },
  };
};
