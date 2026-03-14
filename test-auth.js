const bcrypt = require('bcryptjs');

async function test() {
  // Hash dari database
  const hash1 = '$2b$10$PlvaM4V5T8ipLGRHV7b.4Om'; // Ini incomplete, tapi untuk test

  // Generate hash baru dari password yang benar
  const password = 'admin123';
  const newHash = await bcrypt.hash(password, 10);

  console.log('New hash for admin123:', newHash);

  // Test compare
  const isValid = await bcrypt.compare(password, newHash);
  console.log('Compare result:', isValid);
}

test();
