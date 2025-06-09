const getTransaction = (sql, db = require('./')) => {
  const stmt = db.prepare(sql);
  const trans = db.transaction((rows) => {
    for (const row of rows) {
      stmt.run(...row);
    }
  });
  return trans;
};

module.exports = { getTransaction };
