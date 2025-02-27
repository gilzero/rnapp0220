// src/providers/registry.ts
import { Provider, ProviderIdentifier } from './types';
import { logWarn } from '../utils';

class ProviderRegistry {
  private providers: Record<string, Provider> = {};
  private defaultProviderId: ProviderIdentifier | null = null;

  register(provider: Provider): void {
    this.providers[provider.id] = provider;
    // Set as default if it's the first one
    if (Object.keys(this.providers).length === 1) {
      this.defaultProviderId = provider.id;
    }
  }

  getProvider(id: ProviderIdentifier): Provider | undefined {
    return this.providers[id];
  }

  getAllProviders(): Provider[] {
    return Object.values(this.providers);
  }

  getProviderIds(): ProviderIdentifier[] {
    return Object.keys(this.providers);
  }

  setDefaultProvider(id: ProviderIdentifier): void {
    if (this.providers[id]) {
      this.defaultProviderId = id;
    } else {
      logWarn(`Attempted to set non-existent provider '${id}' as default`);
    }
  }

  getDefaultProvider(): Provider | undefined {
    return this.defaultProviderId ? this.providers[this.defaultProviderId] : undefined;
  }
}

export const providerRegistry = new ProviderRegistry(); 