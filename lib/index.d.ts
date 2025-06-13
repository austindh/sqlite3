export declare class Sqlite {
    private path;
    private connection;
    constructor(path: string);
    private getConnection;
    close(): Promise<void>;
    selectAll(sql: string, ...params: any[]): Promise<any[]>;
    selectOne(sql: string, ...params: any[]): Promise<any>;
    /** Returns id of inserted row, if applicable */
    run(sql: string, ...params: any[]): Promise<number>;
    /** Run contents of a SQL file, one query at a time, wrapped in a transaction */
    executeFile(filePath: string): Promise<void>;
}
