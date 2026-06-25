const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cakra',
  });

  const alterTable = `ALTER TABLE users
    ADD COLUMN level INT NOT NULL DEFAULT 1,
    ADD COLUMN exp INT NOT NULL DEFAULT 0,
    ADD COLUMN max_exp INT NOT NULL DEFAULT 500,
    ADD COLUMN streak INT NOT NULL DEFAULT 0,
    ADD COLUMN placement_level VARCHAR(50) NOT NULL DEFAULT 'pemula',
    ADD COLUMN join_date DATE NOT NULL DEFAULT (CURRENT_DATE()),
    ADD COLUMN bio TEXT NULL,
    ADD COLUMN login_dates JSON NULL,
    ADD COLUMN completed_modules JSON NULL,
    ADD COLUMN completed_module_dates JSON NULL,
    ADD COLUMN daily_xp_history JSON NULL;`;

  try {
    await connection.query(alterTable);
    const [columns] = await connection.query('SHOW COLUMNS FROM users');
    console.log(JSON.stringify(columns, null, 2));
  } catch (error) {
    console.error(error.stack || error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
