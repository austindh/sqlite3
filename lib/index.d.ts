export declare class Sqlite {
    private path;
    private connection;
    constructor(path: string);
    private getConnection;
    close(): Promise<unknown>;
    selectAll(sql: string, ...params: any[]): Promise<any[]>;
    selectOne(sql: string, ...params: any[]): Promise<any>;
    /** Returns id of inserted row, if applicable */
    run(sql: string, ...params: any[]): Promise<number>;
}
