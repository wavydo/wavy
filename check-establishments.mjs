import Database from 'better-sqlite3';

const db = new Database('tapp.db');

console.log('\n📊 ESTABLISHMENTS EN LA BASE DE DATOS:\n');

const establishments = db.prepare(`
  SELECT id, businessName, category, status, contactEmail 
  FROM establishments 
  ORDER BY businessName
`).all();

console.log(`Total establishments: ${establishments.length}\n`);

establishments.forEach((est, index) => {
  console.log(`${index + 1}. ${est.businessName}`);
  console.log(`   - ID: ${est.id}`);
  console.log(`   - Category: ${est.category}`);
  console.log(`   - Status: ${est.status}`);
  console.log(`   - Email: ${est.contactEmail || 'N/A'}`);
  console.log('');
});

// Contar por status
const byStatus = db.prepare(`
  SELECT status, COUNT(*) as count 
  FROM establishments 
  GROUP BY status
`).all();

console.log('\n📈 Por Status:');
byStatus.forEach(s => {
  console.log(`   ${s.status}: ${s.count}`);
});

db.close();
