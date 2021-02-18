export declare function getRecord(args: any, subparsers?: any): Promise<any[] | {
    status: number;
    message: string;
}>;
export declare function dumpDeposition(args: any, id: any): Promise<void>;
export declare function duplicate(args: any, subparsers: any): Promise<0 | {
    status: number;
    message: string;
}>;
export declare function upload(args: any, subparsers: any): Promise<0 | {
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
    response?: undefined;
} | {
    status: number;
    message: string;
    response: any;
}>;
export declare function download(args: any, subparsers: any): Promise<0 | {
    status: number;
    message: string;
}>;
export declare function concept(args: any, subparsers?: any): Promise<any>;
export declare function create(args: any, subparsers?: any): Promise<any>;
