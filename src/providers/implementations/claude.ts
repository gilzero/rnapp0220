// filepath: src/providers/implementations/claude.ts
import React from 'react';
import { Provider } from '../types';
import { AnthropicIcon } from '../../components/Icons';

export const claudeProvider: Provider = {
  id: 'claude',
  displayName: 'Claude',
  iconMappingKey: 'anthropic',
  getIcon: (props) => React.createElement(AnthropicIcon, props)
}; 