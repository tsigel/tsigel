import DiscordTransport from './index';
import Transport from 'winston-transport';

// Мокаем fetch
global.fetch = jest.fn();

describe('DiscordTransport', () => {
  // Очищаем моки перед каждым тестом
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should extend Transport class', () => {
    const transport = new DiscordTransport({ webhook: 'https://example.com/webhook' });
    expect(transport).toBeInstanceOf(Transport);
  });

  it('should store webhook URL', () => {
    const webhookUrl = 'https://discord.com/api/webhooks/12345/abcde';
    const transport = new DiscordTransport({ webhook: webhookUrl });
    expect((transport as any).webhook).toBe(webhookUrl);
  });

  it('should call callback immediately in log method', (done) => {
    const transport = new DiscordTransport({ webhook: 'https://example.com/webhook' });

    transport.log({ level: 'info', message: 'Test message' }, () => {
      expect(true).toBeTruthy(); // просто проверяем, что колбэк вызван
      done();
    });
  });

  it('should not send to discord if discord is false', (done) => {
    const transport = new DiscordTransport({ webhook: 'https://example.com/webhook' });

    // Мокаем приватный метод sendToDiscord
    const spy = jest.spyOn(transport as any, 'sendToDiscord');

    transport.log({
      level: 'info',
      message: 'Test message',
      discord: false
    }, () => {
      setTimeout(() => {
        expect(spy).not.toHaveBeenCalled();
        done();
      }, 10); // Даем немного времени для асинхронных операций
    });
  });

  it('should send to discord with correct payload', (done) => {
    const webhookUrl = 'https://discord.com/api/webhooks/12345/abcde';
    const transport = new DiscordTransport({ webhook: webhookUrl });

    const mockFetch = global.fetch as jest.Mock;
    mockFetch.mockResolvedValue({ ok: true });

    const logInfo = {
      level: 'error',
      message: 'Error message',
      logger: 'app',
      timestamp: '2023-01-01T00:00:00Z',
      version: '1.0.0',
      customField: 'custom value'
    };

    transport.log(logInfo, () => {
      setTimeout(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith(webhookUrl, {
          method: 'POST',
          headers: {
            Accept: 'json',
            'Content-Type': 'application/json'
          },
          body: expect.any(String)
        });

        const body = JSON.parse(mockFetch.mock.calls[0][1].body);

        expect(body.embeds[0].description).toBe('Error message');
        expect(body.embeds[0].color).toBe(14362664); // Цвет для error

        // Проверяем поля
        const fields = body.embeds[0].fields;
        expect(fields).toContainEqual({ name: 'logger', value: 'app' });
        expect(fields).toContainEqual({ name: 'level', value: 'error' });
        expect(fields).toContainEqual({ name: 'customField', value: 'custom value' });

        // Проверяем, что определенные поля были исключены
        const fieldNames = fields.map((f: { name: string }) => f.name);
        expect(fieldNames).not.toContain('timestamp');
        expect(fieldNames).not.toContain('version');
        expect(fieldNames).not.toContain('message');

        done();
      }, 10);
    });
  });

  it('should handle different log levels with appropriate colors', (done) => {
    const webhookUrl = 'https://discord.com/api/webhooks/12345/abcde';
    const transport = new DiscordTransport({ webhook: webhookUrl });

    const mockFetch = global.fetch as jest.Mock;
    mockFetch.mockResolvedValue({ ok: true });

    // Проверяем разные уровни логирования
    const logLevels = [
      { level: 'crit', expectedColor: 10038562 },
      { level: 'error', expectedColor: 14362664 },
      { level: 'warning', expectedColor: 16497928 },
      { level: 'info', expectedColor: 2196944 },
      { level: 'debug', expectedColor: 8421504 }
    ];

    // Отслеживаем количество завершенных проверок
    let completedChecks = 0;

    for (const { level, expectedColor } of logLevels) {
      transport.log({
        level,
        message: `${level} message`,
        logger: 'app'
      }, () => {
        setTimeout(() => {
          const callIndex = completedChecks;
          const body = JSON.parse(mockFetch.mock.calls[callIndex][1].body);
          expect(body.embeds[0].color).toBe(expectedColor);

          completedChecks++;
          if (completedChecks === logLevels.length) {
            done();
          }
        }, 10);
      });
    }
  });

  it('should handle fetch errors gracefully', (done) => {
    const webhookUrl = 'https://discord.com/api/webhooks/12345/abcde';
    const transport = new DiscordTransport({ webhook: webhookUrl });

    const mockFetch = global.fetch as jest.Mock;
    mockFetch.mockRejectedValue(new Error('Network error'));

    // Мокаем console.error
    const originalConsoleError = console.error;
    console.error = jest.fn();

    transport.log({
      level: 'info',
      message: 'Test message',
      logger: 'app'
    }, () => {
      setTimeout(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith('Error sending to discord');

        // Восстанавливаем оригинальный console.error
        console.error = originalConsoleError;
        done();
      }, 10);
    });
  });
});