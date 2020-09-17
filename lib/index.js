"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite = require("sqlite3");
sqlite.verbose();
const fs = require("fs");
const util_1 = require("util");
const readFile = util_1.promisify(fs.readFile);
class Sqlite {
    constructor(path) {
        this.path = path;
    }
    getConnection() {
        if (this.connection) {
            return this.connection;
        }
        this.connection = new Promise((resolve, reject) => {
            const db = new sqlite.Database(this.path, err => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(db.get('PRAGMA foreign_keys = ON'));
                }
            });
        });
        return this.connection;
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.getConnection();
            return new Promise((resolve, reject) => {
                db.close(err => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    selectAll(sql, ...params) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.getConnection();
            return new Promise((resolve, reject) => {
                db.all(sql, [...params], (err, rows) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(rows);
                    }
                });
            });
        });
    }
    selectOne(sql, ...params) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield this.selectAll(sql, ...params);
            return rows[0];
        });
    }
    /** Returns id of inserted row, if applicable */
    run(sql, ...params) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.getConnection();
            return new Promise((resolve, reject) => {
                db.run(sql, [...params], function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(this.lastID); // inserted id
                    }
                });
            });
        });
    }
    /** Run contents of a SQL file, one query at a time, wrapped in a transaction */
    executeFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.getConnection();
            const sql = (yield readFile(filePath)).toString();
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
        });
    }
}
exports.Sqlite = Sqlite;
