const db = require('../db');
const [lang, hardware, game, track, game_related] = [
  require('./schema/lang'),
  require('./schema/hardware'),
  require('./schema/game'),
  require('./schema/track'),
  require('./schema/game_related'),
];

const statements = {
  lang: prepareGroup(db, lang),
  hardware: prepareGroup(db, hardware),
  game: prepareGroup(db, game),
  track: prepareGroup(db, track),
  game_related: prepareGroup(db, game_related),
  sql: (sql) => db.prepare(sql),
};

function prepareGroup(db, module) {
  return Object.fromEntries(
    Object.entries(module)
      .filter(([x, fn]) => x !== 'create' && typeof fn === 'function')
      .map(([x, fn]) => [
        x,
        !fn.length ? db.prepare(fn()) : (...args) => db.prepare(fn(...args)),
      ])
  );
}

module.exports = statements;
