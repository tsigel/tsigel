import asyncMap from './asyncMap';

describe('asyncMap', () => {
    it('should handle synchronous functions', async () => {
        const input = [1, 2, 3, 4];
        const result = await asyncMap(2, (x) => x * 2, input);
        expect(result).toEqual([2, 4, 6, 8]);
    });

    it('should handle asynchronous functions', async () => {
        const input = [1, 2, 3];
        const result = await asyncMap(2, async (x) => {
            await new Promise((r) => setTimeout(r, 10));
            return x * 3;
        }, input);
        expect(result).toEqual([3, 6, 9]);
    });

    it('should return a curried function if list is not provided', async () => {
        const curried = asyncMap(2, (x: number) => x + 1);
        const result = await curried([1, 2, 3]);
        expect(result).toEqual([2, 3, 4]);
    });

    it('should preserve the order of items', async () => {
        const input = [1, 2, 3, 4];
        const result = await asyncMap(2, async (x) => {
            await new Promise((r) => setTimeout(r, 5 * (5 - x)));
            return x * 10;
        }, input);

        expect(result).toEqual([10, 20, 30, 40]);
    });

    it('should propagate errors from sync callback', async () => {
        const input = [1, 2, 3];
        const failingCallback = (x: number) => {
            if (x === 2) throw new Error('fail!');
            return x;
        };

        await expect(asyncMap(2, failingCallback, input)).rejects.toThrow('fail!');
    });

    it('should propagate errors from async callback', async () => {
        const input = [1, 2, 3];
        const failingAsyncCallback = async (x: number) => {
            if (x === 3) throw new Error('async fail!');
            return x;
        };

        await expect(asyncMap(2, failingAsyncCallback, input)).rejects.toThrow('async fail!');
    });

    it('should handle a large number of threads', async () => {
        const input = Array.from({ length: 20 }, (_, i) => i);
        const result = await asyncMap(10, async (x) => x * 2, input);
        expect(result).toEqual(input.map((x) => x * 2));
    });
});
