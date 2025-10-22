const getTransactionBySql = (sql, db = require('./')) => {
  const stmt = db.prepare(sql);
  const trans = db.transaction((rows) => {
    for (const row of rows) {
      stmt.run(...row);
    }
  });
  return trans;
};

const getTransactionByStatement = (stmt, db = require('./')) => {
  const trans = db.transaction((rows) => {
    for (const row of rows) {
      stmt.run(...row);
    }
  });
  return trans;
};

module.exports = { getTransactionBySql, getTransactionByStatement };
