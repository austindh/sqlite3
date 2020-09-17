import * as sqlite from 'sqlite3';
sqlite.verbose();
import * as fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

export class Sqlite {
	private path: string;
	private connection: Promise<sqlite.Database>

	constructor(path: string) {
		this.path = path;
	}

	private getConnection() {
		if (this.connection) {
			return this.connection;
		}

		this.connection = new Promise((resolve, reject) => {
			const db = new sqlite.Database(this.path, err => {
				if (err) {
					reject(err);
				} else {
					resolve(db.get('PRAGMA foreign_keys = ON'));
				}
			})
		});
		return this.connection;
	}

	async close() {
		const db = await this.getConnection();
		return new Promise((resolve, reject) => {
			db.close(err => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	async selectAll(sql: string, ...params): Promise<any[]> {
		const db = await this.getConnection();
		return new Promise((resolve, reject) => {
			db.all(sql, [ ...params ], (err, rows) => {
				if (err) {
					reject(err);
				} else {
					resolve(rows);
				}
			});
		});
	}

	async selectOne(sql: string, ...params): Promise<any> {
		const rows = await this.selectAll(sql, ...params);
		return rows[0];
	}

	/** Returns id of inserted row, if applicable */
	async run(sql: string, ...params): Promise<number> {
		const db = await this.getConnection();
		return new Promise((resolve, reject) => {
			db.run(sql, [...params], function(err) {
				if (err) {
					reject(err);
				} else {
					resolve(this.lastID); // inserted id
				}
			});
		});
	}

	/** Run contents of a SQL file, one query at a time, wrapped in a transaction */
	async executeFile(filePath: string): Promise<void> {
		const db = await this.getConnection();
		const sql = (await readFile(filePath)).toString();
		const queries = sql.split(';');

		db.serialize(() => {
			db.run('BEGIN TRANSACTION;');
			for (let q of queries) {
				if (q) {
					db.run(q + ';');
				}
			}
			db.run('COMMIT;');
		});	
	}
}
