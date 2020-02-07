import * as sqlite from 'sqlite3';
sqlite.verbose();

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
}
