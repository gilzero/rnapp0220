import React from 'react';
import { Provider } from '../types';
import { DefaultProviderIcon } from '../../components/Icons';

export const exampleProvider: Provider = {
  id: 'example',
  displayName: 'Example Provider',
  iconMappingKey: 'example',
  getIcon: (props) => React.createElement(DefaultProviderIcon, props)
}; 