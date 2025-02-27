# Provider Architecture

This directory contains the refactored provider architecture for the application. The goal of this refactoring was to create a more maintainable and extensible way to manage AI providers in the application.

## Structure

- `types.ts`: Contains the core interfaces for providers
- `registry.ts`: Implements the provider registry pattern
- `implementations/`: Contains individual provider implementations
- `index.ts`: Exports everything and maintains backward compatibility

## Adding a New Provider

To add a new provider, follow these steps:

1. Create a new icon component in `src/components/Icons.tsx` (or use the DefaultProviderIcon)
2. Create a new provider implementation in `src/providers/implementations/`
3. Register the provider in `src/providers/index.ts`

Example provider implementation:

```typescript
// src/providers/implementations/newProvider.ts
import React from 'react';
import { Provider } from '../types';
import { DefaultProviderIcon } from '../../components/Icons';

export const newProvider: Provider = {
  id: 'new-provider',
  displayName: 'New Provider',
  iconMappingKey: 'default',
  getIcon: (props) => React.createElement(DefaultProviderIcon, props)
};
```

## Environment Configuration

Providers can still be configured via environment variables:

```
EXPO_PUBLIC_PROVIDERS='{"new-provider":{"id":"new-provider","displayName":"New Provider","iconMappingKey":"default"}}'
EXPO_PUBLIC_DEFAULT_PROVIDER="new-provider"
```

## Backward Compatibility

The refactoring maintains backward compatibility with the existing codebase by:

1. Exporting the same constants (PROVIDER_GPT, PROVIDER_CLAUDE, etc.)
2. Creating a MODELPROVIDERS object that matches the original format
3. Exporting DEFAULT_PROVIDER in the same format

This allows the rest of the application to continue working without changes while benefiting from the improved architecture. 