const mysql = require('mysql2/promise');
(async () => {
  try {
    const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'cakra' });
    const [rows] = await pool.query('SHOW COLUMNS FROM users');
    console.log(JSON.stringify(rows, null, 2));
    await pool.end();
  } catch (e) {
    console.error(e.stack || e);
    process.exit(1);
  }
})();
