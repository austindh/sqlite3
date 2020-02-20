# sqlite3

This is a basic (incomplete) wrapper around the `sqlite3` library. I found myself copying and pasting the same boilerplate code into a few different projects, so I created this package to consolidate that into one place.

## Installation
```bash
$ npm install @adh/sqlite3
```

## Example Usage
```typescript
import { Sqlite } from '@adh/sqlite3';

const dbPath = 'path/to/test.db';
const db = new Sqlite(dbPath);

const main = async () => {
	// Get rows
	const rows = await db.selectAll('select * from table');

	// Get single row
	const row = await db.selectOne('select * from table where id = ?', 1);

	// Insert a row
	const newId = await db.run('insert into table(key, value) values(?, ?)', 'key', 'value');

	// Delete a row
	await db.run('delete from from table where id = ?', 1);
};
main();

```

## Notes
- A connection to the database is opened when a method is called (method calls after the first one will use a cached database connection)
- After the connection is opened, `PRAGMA foreign_keys = ON` is executed against the database to enable foreign key constraints
