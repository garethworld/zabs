window.login = function () {
  return {
    showReset(e) {
      document.getElementById('RecoverPasswordForm').classList.remove('hidden');
      document.getElementById('CustomerLoginForm').classList.add('hidden');
    },
    hideReset(e) {
      document.getElementById('RecoverPasswordForm').classList.add('hidden');
      document.getElementById('CustomerLoginForm').classList.remove('hidden');
    },
  };
};
