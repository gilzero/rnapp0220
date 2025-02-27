// src/config/config_providers.ts
import { ModelProviderConfig, ProviderEnvConfig, ProviderIdentifier } from './config_types';
import { OpenAIIcon, AnthropicIcon, GeminiIcon, DefaultProviderIcon } from '../components/Icons';
import rawProvidersConfig from './providers.json';

// Define the expected shape of our JSON config
interface ProvidersJsonConfig {
  providers: Record<string, {
    id: string;
    displayName: string;
    iconMappingKey?: string;
  }>;
  defaultProvider: string;
}

// Type assertion for the imported JSON
const providersConfig = rawProvidersConfig as ProvidersJsonConfig;

/* ---------- Providers ---------- */

// Icon mapping for different provider types
const ICON_MAPPING = {
  'openai': OpenAIIcon,
  'anthropic': AnthropicIcon,
  'gemini': GeminiIcon,
  'default': DefaultProviderIcon
} as const;

// Get providers from the JSON configuration file
const providers: Record<string, ProviderEnvConfig> = (() => {
  try {
    // Validate the configuration
    Object.entries(providersConfig.providers).forEach(([key, config]) => {
      if (!config.id || !config.displayName) {
        throw new Error(`Provider config for '${key}' is missing required fields: id or displayName`);
      }
    });

    // Convert the JSON data to our expected type with proper type assertions
    return Object.entries(providersConfig.providers).reduce((acc, [key, config]) => {
      acc[key] = {
        id: config.id as ProviderIdentifier,
        displayName: config.displayName,
        iconMappingKey: config.iconMappingKey ?? 'default'
      };
      return acc;
    }, {} as Record<string, ProviderEnvConfig>);
  } catch (error) {
    console.error('Error loading provider configuration:', error);
    return {};
  }
})();

// Default provider from configuration
export const DEFAULT_PROVIDER = providersConfig.defaultProvider || 'gpt';

// Convert providers to ModelProviderConfig format
export const MODELPROVIDERS = Object.freeze(Object.entries(providers).reduce((acc, [key, config]) => {
  acc[key as ProviderIdentifier] = {
    label: key as ProviderIdentifier,
    displayName: config.displayName,
    icon: config.iconMappingKey ? (ICON_MAPPING[config.iconMappingKey as keyof typeof ICON_MAPPING] || ICON_MAPPING['default']) : ICON_MAPPING['default']
  };
  return acc;
}, {} as Record<ProviderIdentifier, ModelProviderConfig>));

// These can still be configured via environment variables if needed
export const MODEL_PARAMS = {
  TEMPERATURE: parseFloat(process.env['EXPO_PUBLIC_TEMPERATURE'] || '0.7'),
  MAX_TOKENS: parseInt(process.env['EXPO_PUBLIC_MAX_TOKENS'] || '4000', 10)
};

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