// filepath: src/utils/Utils.ts
import { ChatMessage, ModelProviderConfig, ProviderIdentifier, DOMAIN, APP_CONFIG } from '../config';
import EventSource from 'react-native-sse';

// =============== Error Handling ===============

export class ChatError extends Error {
  code: string;

  constructor(message: string, code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.code = code;
    this.name = 'ChatError';
  }
}

// =============== Message Utilities ===============

export function getFirstNCharsOrLess(text: string, numChars: number = APP_CONFIG.VALIDATION.MESSAGES.MAX_LENGTH): string {
  if (!text?.trim()) {
    return '';
  }
  const trimmedText = text.trim();
  if (trimmedText.length <= numChars) {
    return trimmedText;
  }
  return trimmedText.substring(0, numChars);
}

export function getFirstN({ messages, size = 10 }: { size?: number, messages: any[] }) {
  if (messages.length > size) {
    const firstN = new Array();
    for (let i = 0; i < size; i++) {
      firstN.push(messages[i]);
    }
    return firstN;
  } else {
    return messages;
  }
}

// =============== Message Validation ===============

export interface MessageValidationError {
  message: string;
  code: 'EMPTY_MESSAGE' | 'MESSAGE_TOO_LONG' | 'TOO_MANY_MESSAGES' | 'INVALID_ROLE';
}

export class ChatValidationError extends Error {
  constructor(
    public code: MessageValidationError['code'],
    message: string
  ) {
    super(message);
    this.name = 'ChatValidationError';
  }
}

export function validateMessage(message: ChatMessage): void {
  const content = message.content?.trim();

  if (!content) {
    throw new ChatValidationError('EMPTY_MESSAGE', APP_CONFIG.ERRORS.VALIDATION.EMPTY_MESSAGE);
  }

  if (content.length > APP_CONFIG.VALIDATION.MESSAGES.MAX_LENGTH) {
    throw new ChatValidationError(
      'MESSAGE_TOO_LONG',
      APP_CONFIG.ERRORS.VALIDATION.MESSAGE_TOO_LONG(APP_CONFIG.VALIDATION.MESSAGES.MAX_LENGTH)
    );
  }
}

export function validateMessages(messages: ChatMessage[]): MessageValidationError | null {
  if (messages.length > APP_CONFIG.VALIDATION.MESSAGES.MAX_HISTORY) {
    return {
      code: 'TOO_MANY_MESSAGES',
      message: APP_CONFIG.ERRORS.VALIDATION.TOO_MANY_MESSAGES(APP_CONFIG.VALIDATION.MESSAGES.MAX_HISTORY)
    };
  }

  for (const message of messages) {
    try {
      validateMessage(message);
    } catch (error) {
      if (error instanceof ChatValidationError) {
        return { code: error.code, message: error.message };
      }
      throw error;
    }
  }

  return null;
}

// ===============  Provider Utilities ===============

const MODEL_PROVIDER_MAP: Record<string, ProviderIdentifier> = {
  'gpt': 'gpt',
  'gemini': 'gemini',
  'claude': 'claude'
} as const;

export function getChatType(type: ModelProviderConfig): ProviderIdentifier {
  const label = type.label.toLowerCase();

  for (const [keyword, provider] of Object.entries(MODEL_PROVIDER_MAP)) {
    if (label.includes(keyword)) return provider;
  }

  const supportedModels = Object.keys(MODEL_PROVIDER_MAP);
  throw new Error(APP_CONFIG.ERRORS.CONNECTION.INVALID_MODEL(type.label, supportedModels));
}

// =============== SSE Connection Handling ===============

export interface SSEConnectionCallbacks {
  onConnectionStatus?: (status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting') => void;
}

const { MAX_ATTEMPTS, BACKOFF_MS, MAX_BACKOFF_MS } = APP_CONFIG.NETWORK.RETRY;

export async function createSSEConnection(
  url: string,
  body: string,
  callbacks: SSEConnectionCallbacks,
  retryCount: number = 0
): Promise<EventSource> {
  const { onConnectionStatus } = callbacks;

  try {
    if (onConnectionStatus) {
      onConnectionStatus(retryCount === 0 ? 'connecting' : 'reconnecting');
    }

    const es = new EventSource(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body,
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        es.close();
        reject(new ChatError(APP_CONFIG.ERRORS.CONNECTION.TIMEOUT, 'CONNECTION_TIMEOUT'));
      }, APP_CONFIG.NETWORK.TIMEOUTS.CONNECTION);

      es.addEventListener('open', () => {
        clearTimeout(timeout);
        if (onConnectionStatus) {
          onConnectionStatus('connected');
        }
        resolve(es);
      });

      es.addEventListener('error', async () => {
        clearTimeout(timeout);
        es.close();

        if (retryCount < MAX_ATTEMPTS) {
          const retryDelay = Math.min(
            BACKOFF_MS * Math.pow(2, retryCount),
            MAX_BACKOFF_MS
          );
          await new Promise(resolve => setTimeout(resolve, retryDelay));

          try {
            const newConnection = await createSSEConnection(url, body, callbacks, retryCount + 1);
            resolve(newConnection);
          } catch (error) {
            reject(error);
          }
        } else {
          if (onConnectionStatus) {
            onConnectionStatus('disconnected');
          }
          reject(new ChatError(APP_CONFIG.ERRORS.CONNECTION.FAILED, 'CONNECTION_FAILED'));
        }
      });
    });
  } catch (error) {
    if (onConnectionStatus) {
      onConnectionStatus('disconnected');
    }
    throw error;
  }
}

export function getEventSource({
  headers,
  body,
  type
}: {
  headers?: Record<string, string>,
  body: unknown,
  type: string
}): EventSource {
  const url = `${DOMAIN}/api/${type}`;
  const stringifiedBody = JSON.stringify(body);

  return new EventSource(url, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    method: 'POST',
    body: stringifiedBody,
  });
}