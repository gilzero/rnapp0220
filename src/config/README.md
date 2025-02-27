# Provider Configuration

This directory contains configuration files for the application, including provider configurations.

## Provider Configuration

Providers are configured in the `providers.json` file. This file contains:

- A list of available providers
- The default provider to use

### Structure

The `providers.json` file has the following structure:

```json
{
  "providers": {
    "provider-id": {
      "id": "provider-id",
      "displayName": "Provider Display Name",
      "iconMappingKey": "icon-key"
    },
    // Additional providers...
  },
  "defaultProvider": "provider-id"
}
```

### Fields

- `providers`: An object containing provider configurations
  - `id`: The unique identifier for the provider (must match the key)
  - `displayName`: The human-readable name for the provider
  - `iconMappingKey`: The key to use for icon mapping (must match an available icon)
- `defaultProvider`: The ID of the default provider to use

### Adding a New Provider

To add a new provider:

1. Add a new entry to the `providers` object in `providers.json`
2. Ensure the provider has all required fields
3. If needed, add a new icon mapping in `config_providers.ts`

### Icon Mapping

Icons are mapped in the `ICON_MAPPING` constant in `config_providers.ts`. To add a new icon:

1. Import the icon component
2. Add it to the `ICON_MAPPING` object with the appropriate key

## Benefits Over Environment Variables

Using a JSON file for configuration offers several advantages:

- Better structure and validation
- Easier to read and modify
- Less error-prone
- Better type checking
- Can be extended with additional configuration options
- Can be loaded dynamically at runtime
- Can be versioned and tracked in source control 