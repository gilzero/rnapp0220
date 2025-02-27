// filepath: src/providers/implementations/gemini.ts
import React from 'react';
import { Provider } from '../types';
import { GeminiIcon } from '../../components/Icons';

export const geminiProvider: Provider = {
  id: 'gemini',
  displayName: 'Gemini',
  iconMappingKey: 'gemini',
  getIcon: (props) => React.createElement(GeminiIcon, props)
}; 