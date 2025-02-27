// filepath: src/providers/implementations/openai.ts
import React from 'react';
import { Provider } from '../types';
import { OpenAIIcon } from '../../components/Icons';

export const openaiProvider: Provider = {
  id: 'gpt',
  displayName: 'GPT-4',
  iconMappingKey: 'openai',
  getIcon: (props) => React.createElement(OpenAIIcon, props)
}; 