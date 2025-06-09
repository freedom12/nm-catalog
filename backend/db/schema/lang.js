module.exports = {
  create: () => `
    CREATE TABLE IF NOT EXISTS lang (
      id TEXT PRIMARY KEY,
      desc TEXT
    );
  `,
  select: () => `SELECT * FROM lang ORDER BY id`,
  insert: () => `INSERT INTO lang (id, desc) VALUES (?, ?)`,
  preparedData: [
    ['de-DE', 'German (Germany)'],
    ['en-US', 'English (United States)'],
    ['es-ES', 'Spanish (Spain)'],
    ['fr-FR', 'French (France)'],
    ['it-IT', 'Italian (Italy)'],
    ['ja-JP', 'Japanese (Japan)'],
    ['ko-KR', 'Korean (Korea)'],
    ['zh-CN', 'Chinese (S)'],
    ['zh-TW', 'Chinese (T)'],
  ],
};
