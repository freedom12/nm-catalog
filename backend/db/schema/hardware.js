module.exports = {
  create: () => `
    CREATE TABLE IF NOT EXISTS hardware (
      name TEXT PRIMARY KEY,
      year INTEGER
    );
   `,
  select: () => `SELECT * FROM hardware ORDER BY year DESC`,
  insert: () => `INSERT INTO hardware (name, year) VALUES (?, ?)`,
  preparedData: [
    ['Nintendo Entertainment System', 1983],
    ['Game Boy', 1989],
    ['Super Nintendo Entertainment System', 1990],
    ['Nintendo 64', 1996],
    ['Game Boy Advance', 2001],
    ['Nintendo GameCube', 2002],
    ['Nintendo DS', 2004],
    ['Wii', 2006],
    ['Nintendo 3DS', 2011],
    ['Wii U', 2012],
    ['Nintendo Switch', 2017],
    ['Nintendo Switch 2', 2025],
  ],
};
