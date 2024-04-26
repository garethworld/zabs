window.forms = function () {
  return {
    submitForm(e) {
      e.preventDefault();
      let formTarget = this.$el.getAttribute('data-form');
      const form = document.getElementById(formTarget);
      const submitBtn = form.querySelector('.submit-btn');
      submitBtn.classList.remove('shake');

      const requiredFields = form.querySelectorAll('.required');
      let isValid = true;

      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('border-tint3');
        } else {
          field.classList.remove('border-tint3');
        }
      });

      // Check if all required fields are filled and email is valid
      const allFieldsFilled = Array.from(requiredFields).every((field) =>
        field.value.trim(),
      );
      const emailField = form.querySelector('input[type="email"]');
      const isEmailValid = this.validateEmail(emailField.value.trim());

      if (allFieldsFilled && isEmailValid) {
        form.submit();
      } else {
        void submitBtn.offsetWidth;
        submitBtn.classList.add('shake');
        if (!isEmailValid) {
          emailField.classList.add('border-tint3');
        }
      }
    },

    validateTxt() {
      if (this.$el.value.trim()) {
        this.$el.classList.remove('border-tint3');
        return true;
      } else {
        this.$el.classList.add('border-tint3');
        return false;
      }
    },

    validateEmail(email) {
      const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,20}$/;
      return regex.test(email);
    },
  };
};
