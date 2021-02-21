export declare function about(args: any, subparsers?: any): Promise<{
    access_token: string;
    env: string;
    zenodoAPIUrl: string;
} | {
    status: number;
    message: string;
}>;
export declare function getRecord(args: any, subparsers?: any): Promise<any[] | {
    status: number;
    message: string;
}>;
export declare function dumpDeposition(args: any, id: any): Promise<void>;
export declare function duplicate(args: any, subparsers: any): Promise<0 | {
    status: number;
    message: string;
}>;
export declare function upload(args: any, subparsers: any): Promise<{
    files: any[];
    final: {};
} | {
    status: number;
    message: string;
}>;
export declare function update(args: any, subparsers?: any): Promise<any>;
export declare function copy(args: any, subparsers: any): Promise<0 | {
    status: number;
    message: string;
}>;
export declare function listDepositions(args: any, subparsers?: any): Promise<any>;
export declare function newVersion(args: any, subparsers: any): Promise<{
    status: number;
    message: string;
    record?: undefined;
    response?: undefined;
    final?: undefined;
} | {
    status: number;
    message: string;
    record: any;
    response?: undefined;
    final?: undefined;
} | {
    status: number;
    message: string;
    response: any;
    final: any;
    record?: undefined;
}>;
export declare function download(args: any, subparsers: any): Promise<0 | {
    status: number;
    message: string;
}>;
export declare function concept(args: any, subparsers?: any): Promise<any>;
export declare function create(args: any, subparsers?: any): Promise<any>;
