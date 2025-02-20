import { StyleSheet } from 'react-native'
import { THEMES } from '../config'

export const getAgentStyles = (theme: typeof THEMES.light) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.backgroundColor
  },
  text: {
    color: theme.textColor,
    fontSize: 18,
    fontFamily: theme.mediumFont
  }
}) 