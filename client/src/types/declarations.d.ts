declare module 'clsx' {
    export type ClassValue = string | number | boolean | undefined | null | { [key: string]: any } | ClassValue[];
    export function clsx(...inputs: ClassValue[]): string;
    export default clsx;
}

declare module 'tailwind-merge' {
    export function twMerge(...classLists: string[]): string;
}

declare module 'socket.io-client' {
    export * from 'socket.io-client/build/index';
    const io: any;
    export { io };
}
