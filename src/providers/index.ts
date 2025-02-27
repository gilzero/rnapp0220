// src/providers/index.ts
import { providerRegistry } from './registry';
import React from 'react';
import { Provider, ProviderIdentifier } from './types';
import { DefaultProviderIcon, OpenAIIcon, AnthropicIcon, GeminiIcon } from '../components/Icons';
import rawProvidersConfig from '../config/providers.json';
import { logInfo, logWarn } from '../utils';

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

// Icon mapping for different provider types
const ICON_MAPPING = {
  'openai': OpenAIIcon,
  'anthropic': AnthropicIcon,
  'gemini': GeminiIcon,
  'default': DefaultProviderIcon
};

// Load providers from JSON configuration
try {
  if (providersConfig && providersConfig.providers) {
    // Register providers from configuration
    Object.entries(providersConfig.providers).forEach(([key, config]) => {
      if (!config.id || !config.displayName) {
        logWarn(`Provider config for '${key}' is missing required fields: id or displayName`);
        return;
      }
      
      // Get the appropriate icon component based on iconMappingKey
      const iconMappingKey = config.iconMappingKey ?? 'default';
      const IconComponent = ICON_MAPPING[iconMappingKey as keyof typeof ICON_MAPPING] || ICON_MAPPING['default'];
      
      // Create and register the provider
      const provider: Provider = {
        id: config.id as ProviderIdentifier,
        displayName: config.displayName,
        iconMappingKey: iconMappingKey,
        getIcon: (props) => React.createElement(IconComponent, props)
      };
      
      providerRegistry.register(provider);
      logInfo(`Registered provider: ${config.id} with icon: ${iconMappingKey}`);
    });
  }
} catch (e) {
  const error = e as Error;
  logWarn(
    `Error loading provider configuration: ${error.message}`
  );
}

// Set the default provider from configuration
if (providersConfig.defaultProvider) {
  const defaultId = providersConfig.defaultProvider;
  if (providerRegistry.getProvider(defaultId)) {
    providerRegistry.setDefaultProvider(defaultId);
    logInfo(`Set default provider to: ${defaultId}`);
  } else {
    logWarn(`Default provider '${defaultId}' not found in registry`);
  }
}

// Export helper functions
export const providers = Object.freeze(
  Object.values(providerRegistry.getAllProviders()).reduce((acc, provider) => {
    acc[provider.id] = {
      id: provider.id,
      displayName: provider.displayName,
      icon: (props: any) => provider.getIcon(props)
    };
    return acc;
  }, {} as Record<ProviderIdentifier, any>)
);

// Helper function to register a new provider at runtime
export function registerProvider(provider: Provider): void {
  providerRegistry.register(provider);
}

// Export everything
export * from './types';
export * from './registry';
export * from './hooks';

// Export a compatibility layer for existing code
export const PROVIDER_GPT = 'gpt' as const;
export const PROVIDER_CLAUDE = 'claude' as const;
export const PROVIDER_GEMINI = 'gemini' as const;

// Create a MODELPROVIDERS object that matches the original format
// This is a dynamic getter that will always return the latest providers
export const MODELPROVIDERS = Object.freeze(
  providerRegistry.getAllProviders().reduce((acc, provider) => {
    acc[provider.id] = {
      label: provider.id,
      displayName: provider.displayName,
      icon: provider.getIcon
    };
    return acc;
  }, {} as Record<ProviderIdentifier, any>)
);

export const DEFAULT_PROVIDER = providerRegistry.getDefaultProvider()?.id || PROVIDER_GPT;