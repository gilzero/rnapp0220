// filepath: src/screens/AgentScreen.tsx
import React, { useContext } from 'react'
import { View, Text } from 'react-native'
import { ThemeContext } from '../contexts'
import { getAgentStyles } from '../styles/agent'

export function AgentScreen() {
  const { theme } = useContext(ThemeContext)
  const styles = getAgentStyles(theme)

  return (
    <View style={styles.container}>
      <Text style={styles.text}>AI Agents coming in next update, stay tuned! 🥷</Text>
    </View>
  )
} 