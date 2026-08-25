function validateLoginInput(body) {
  const errors = {};
  const { email, password } = body || {};

  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "A valid email is required.";
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    errors.password = "Password is required (min 6 characters).";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateLoginInput };
