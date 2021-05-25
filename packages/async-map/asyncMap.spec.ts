import { asyncMap } from './asyncMap';

describe('Async map', () => {

    it('Check chain call', (done) => {
        return asyncMap(1, (item) => {
            return Promise.resolve(item);
        }, [1, 2, 3])
            .then((list) => {
                expect(list).toEqual([1, 2, 3]);
            }).then(done);
    });

    it('Check all treads', (done) => {
        return asyncMap(5, (item) => {
            return new Promise((resolve) => {
                setTimeout(() => resolve(item), (5 - item) * 10);
            });
        }, [1, 2, 3, 4, 5])
            .then((list) => {
                expect(list).toEqual([1, 2, 3, 4, 5]);
            }).then(done);
    });

    it('Not promise return', (done) => {
        return asyncMap(1, (item) => ({ [item]: item }), [1, 2, 3])
            .then((list) => {
                expect(list).toEqual([{ 1: 1 }, { 2: 2 }, { 3: 3 }]);
            }).then(done);
    });

    it('Run with exception in callback function', (done) => {
        return asyncMap(1, (item) => {
            if (item === 3) {
                throw new Error('Check exception');
            }
            return item;
        }, [1, 2, 3])
            .then(
                () => {
                    throw new Error('Wrong test work!');
                },
                (e) => {
                    expect(e.message).toBe('Check exception');
                    done();
                }
            );
    });

    it('Check long async array', (done) => {
        const list: Array<number> = [];

        for (let i = 0; i < 100; i++) {
            list.push(i);
        }

        function randomInteger(min: number, max: number): number {
            const rand = min - 0.5 + Math.random() * (max - min + 1);
            return Math.round(rand);
        }

        return asyncMap(5, (item) => {
            return new Promise(resolve => {
                setTimeout(() => resolve(item), randomInteger(0, 100));
            });
        }, list)
            .then(result => {
                expect(result).toEqual(list);
                done();
            });
    });
});
