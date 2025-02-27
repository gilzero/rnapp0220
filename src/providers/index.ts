// src/providers/index.ts
import { providerRegistry } from './registry';
import { openaiProvider } from './implementations/openai';
import { claudeProvider } from './implementations/claude';
import { geminiProvider } from './implementations/gemini';
import { exampleProvider } from './implementations/exampleProvider';
import { Provider, ProviderIdentifier } from './types';
import { DefaultProviderIcon } from '../components/Icons';
import React from 'react';
import { logInfo, logWarn } from '../utils';

// Register built-in providers
providerRegistry.register(openaiProvider);
providerRegistry.register(claudeProvider);
providerRegistry.register(geminiProvider);
providerRegistry.register(exampleProvider);

// Load providers from environment
try {
  const rawConfig = process.env['EXPO_PUBLIC_PROVIDERS'];
  if (rawConfig) {
    const parsedConfig = JSON.parse(rawConfig);
    
    // Register providers from environment
    Object.entries(parsedConfig).forEach(([key, config]: [string, any]) => {
      if (!config.id || !config.displayName || !config.iconMappingKey) {
        logWarn(`Provider config for '${key}' is missing required fields: id, displayName, or iconMappingKey`);
        return;
      }
      
      // Skip if already registered
      if (providerRegistry.getProvider(config.id)) {
        logInfo(`Provider '${config.id}' already registered, skipping`);
        return;
      }
      
      // Create and register the provider
      const provider: Provider = {
        id: config.id,
        displayName: config.displayName,
        iconMappingKey: config.iconMappingKey,
        getIcon: (props) => React.createElement(DefaultProviderIcon, props)
      };
      
      providerRegistry.register(provider);
    });
  }
} catch (e) {
  const error = e as Error;
  logWarn(
    `Failed to parse EXPO_PUBLIC_PROVIDERS: Error: ${error.message}, Raw config: ${process.env['EXPO_PUBLIC_PROVIDERS']}`
  );
}

// Set default provider from environment
const envDefaultProvider = process.env['EXPO_PUBLIC_DEFAULT_PROVIDER'];
if (envDefaultProvider) {
  providerRegistry.setDefaultProvider(envDefaultProvider as ProviderIdentifier);
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
      icon: (props: any) => provider.getIcon(props)
    };
    return acc;
  }, {} as Record<ProviderIdentifier, any>)
);

export const DEFAULT_PROVIDER = providerRegistry.getDefaultProvider()?.id || PROVIDER_GPT;

// Helper function to register a new provider at runtime
export function registerProvider(provider: Provider): void {
  providerRegistry.register(provider);
  // Note: MODELPROVIDERS will automatically update on next access
} 