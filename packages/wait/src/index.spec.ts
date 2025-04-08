import wait from './';

describe('wait', () => {
  jest.useFakeTimers();

  it('should resolve after the given timeout', async () => {
    const timeout = 1000;
    const promise = wait(timeout);

    // Fast-forward time
    jest.advanceTimersByTime(timeout);

    await expect(promise).resolves.toBeUndefined();
  });
});
