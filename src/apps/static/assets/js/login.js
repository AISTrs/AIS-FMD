function validatePassword() {
  var password1 = document.getElementById('signupPassword').value;
  var password2 = document.getElementById('confirmPassword').value;

  if (password1.length < 8) {
    alert("Password must be at least 8 characters long");
    return false;
  }

  if (password1 !== password2) {
    alert("Passwords do not match");
    return false;
  }

  var strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
  if (!strongPasswordRegex.test(password1)) {
    alert("Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character");
    return false;
  }

  return true;
}