const bcrypt = require('bcryptjs');

async function test() {
  const hashFromDB = '$2b$10$LHbHA4VIePGbaOgI3NMFKO6GRuVM4CsBRWhgR2BaMx/9WQS7b99.a';
  const password = 'customer123';

  const isValid = await bcrypt.compare(password, hashFromDB);
  console.log('Password "customer123" valid?', isValid);
}

test();
