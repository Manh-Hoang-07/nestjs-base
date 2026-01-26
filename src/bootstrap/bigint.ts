export function patchBigInt() {
    // Helper để xử lý BigInt khi serialize JSON (Global fix)
    (BigInt.prototype as any).toJSON = function () {
        return this.toString();
    };
}
