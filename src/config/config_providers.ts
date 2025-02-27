// src/config/config_providers.ts
import { ModelProviderConfig, ProviderEnvConfig, ProviderIdentifier } from './config_types';
import { OpenAIIcon, AnthropicIcon, GeminiIcon } from '../components/Icons';

/* ---------- Providers ---------- */
export const PROVIDER_GPT = 'gpt' as const;
export const PROVIDER_CLAUDE = 'claude' as const;
export const PROVIDER_GEMINI = 'gemini' as const;

const FALLBACK_PROVIDER_CONFIG: Record<string, ProviderEnvConfig> = {
  [PROVIDER_GPT]: {
    id: PROVIDER_GPT,
    displayName: 'GPT',
    iconMappingKey: 'openai'
  }
};

const ICON_MAPPING = {
  'openai': OpenAIIcon,
  'anthropic': AnthropicIcon,
  'gemini': GeminiIcon
} as const;

const providersConfig: Record<string, ProviderEnvConfig> = (() => {
  try {
    const rawConfig = process.env['EXPO_PUBLIC_PROVIDERS'];
    if (!rawConfig) {
      console.warn('EXPO_PUBLIC_PROVIDERS is not defined, using fallback configuration');
      return FALLBACK_PROVIDER_CONFIG;
    }

    const parsedConfig = JSON.parse(rawConfig);
    
    // Validate the parsed configuration
    if (typeof parsedConfig !== 'object' || parsedConfig === null) {
      throw new Error('EXPO_PUBLIC_PROVIDERS must be a valid JSON object');
    }

    // Add shape validation
    Object.entries(parsedConfig).forEach(([key, config]: [string, any]) => {
      if (!config.id || !config.displayName || !config.iconMappingKey) {
        throw new Error(`Provider config for '${key}' is missing required fields: id, displayName, or iconMappingKey`);
      }
    });

    return parsedConfig;
  } catch (e) {
    const error = e as Error;
    console.error(
      'Failed to parse EXPO_PUBLIC_PROVIDERS:',
      '\nError:', error.message,
      '\nRaw config:', process.env['EXPO_PUBLIC_PROVIDERS'],
      '\nUsing fallback configuration'
    );
    return FALLBACK_PROVIDER_CONFIG;
  }
})();

export const DEFAULT_PROVIDER = (() => {
  const envDefaultProvider = process.env['EXPO_PUBLIC_DEFAULT_PROVIDER'];
  if (envDefaultProvider && Object.keys(providersConfig).includes(envDefaultProvider)) {
    return envDefaultProvider as ProviderIdentifier;
  }
  console.warn(
    `Invalid or undefined EXPO_PUBLIC_DEFAULT_PROVIDER: ${envDefaultProvider}. Falling back to default provider.`
  );
  return Object.keys(providersConfig)[0] as ProviderIdentifier || PROVIDER_GPT;
})();

export const MODELPROVIDERS = Object.entries(providersConfig).reduce((acc, [key, config]) => {
  acc[key as ProviderIdentifier] = {
    label: key as ProviderIdentifier,
    displayName: config.displayName,
    icon: ICON_MAPPING[config.iconMappingKey as keyof typeof ICON_MAPPING] || null
  };
  return acc;
}, {} as Record<ProviderIdentifier, ModelProviderConfig>);

export const MODEL_PARAMS = {
  TEMPERATURE: parseFloat(process.env['EXPO_PUBLIC_TEMPERATURE'] || '0.7'),
  MAX_TOKENS: parseInt(process.env['EXPO_PUBLIC_MAX_TOKENS'] || '2000', 10)
} as const;

export const SETTINGS_CONFIG = {
  MODEL_PARAMS: {
    TEMPERATURE: {
      DEFAULT: MODEL_PARAMS.TEMPERATURE,
      MIN: 0,
      MAX: 1,
      STEP: 0.01
    },
    MAX_TOKENS: {
      DEFAULT: MODEL_PARAMS.MAX_TOKENS,
      MIN: 100,
      MAX: 8192,
      STEP: 100
    }
  },
  STORAGE_KEYS: {
    THEME: 'theme',
    CHAT_TYPE: 'chatType'
  }
} as const; 