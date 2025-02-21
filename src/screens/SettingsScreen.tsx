// filepath: src/screens/SettingsScreen.tsx
import React, { useContext, useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TouchableHighlight,
  ScrollView,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  TouchableOpacity
} from 'react-native'
import { NumberProp } from 'react-native-svg'
import { useNavigation } from '@react-navigation/native'
import Slider from '@react-native-community/slider'
import * as Haptics from 'expo-haptics'
import Ionicons from '@expo/vector-icons/Ionicons'
import { ThemeContext, AppContext } from '../contexts'
import { AnthropicIcon, OpenAIIcon, GeminiIcon } from '../components'
import { IconProps, MODELPROVIDERS, THEMES, SETTINGS_CONFIG, APP_CONFIG } from '../config'
import { getSettingsStyles } from '../styles/settings'

const models = Object.values(MODELPROVIDERS)
const themes = [
  { name: 'Be Water', theme: THEMES.light },
  { name: 'Pink Lady', theme: THEMES.miami },
  { name: 'Yohji', theme: THEMES.vercel }
]

type DynamicStyleProps = {
  baseType: string;
  type: string;
  theme: typeof THEMES.light;
}

type StyleObject = {
  color?: string;
  backgroundColor?: string;
}

type SettingsStyles = {
  container: any;
  contentContainer: any;
  sectionContainer: any;
  sectionTitle: any;
  buttonContainer: any;
  chatChoiceButton: any;
  chatTypeText: any;
  sectionDivider: any;
  settingRow: any;
  settingLabel: any;
  settingDescription: any;
  slider: any;
  switchRow: any;
  hiddenSectionTitle: any;
  hiddenSettingLabel: any;
  hiddenSettingDescription: any;
  hiddenSectionDivider: any;
  hiddenSectionHeader: any;
  hiddenSectionToggle: any;
  hiddenSectionContainer: any;
  switchTextContainer: any;
  doneButton: any;
  doneButtonText: any;
}

export function SettingsScreen() {
  const { theme, setTheme } = useContext(ThemeContext)
  const { chatType, setChatType, clearChatRef } = useContext(AppContext)
  const styles = getSettingsStyles(theme) as SettingsStyles
  const [showHiddenSettings, setShowHiddenSettings] = useState(false)
  const [temperature, setTemperature] = useState<number>(SETTINGS_CONFIG.MODEL_PARAMS.TEMPERATURE.DEFAULT)
  const [maxTokens, setMaxTokens] = useState<number>(SETTINGS_CONFIG.MODEL_PARAMS.MAX_TOKENS.DEFAULT)

  const pullDistance = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const lastPullY = useRef(0)
  const pullThreshold = 80
  const navigation = useNavigation()

  const currentThemeName = themes.find(t => t.theme === theme)?.name || 'Light'

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y

    if (y <= 0) {
      const pull = Math.abs(y)
      pullDistance.setValue(pull)
      lastPullY.current = pull

      if (pull > pullThreshold && !showHiddenSettings) {
        setShowHiddenSettings(true)
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        )
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: APP_CONFIG.UI.ANIMATION.DURATION.MEDIUM,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: APP_CONFIG.UI.ANIMATION.DURATION.MEDIUM,
            useNativeDriver: true,
          })
        ]).start()
      }
    }
  }, [showHiddenSettings, fadeAnim, rotateAnim])

  const handleScrollEnd = useCallback(() => {
    Animated.spring(pullDistance, {
      toValue: 0,
      useNativeDriver: true,
      tension: 30,
      friction: 7
    }).start()
  }, [pullDistance])

  const toggleHiddenSettings = useCallback(() => {
    setShowHiddenSettings(prev => !prev)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: showHiddenSettings ? 0 : 1,
        duration: APP_CONFIG.UI.ANIMATION.DURATION.MEDIUM,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: showHiddenSettings ? 0 : 1,
        duration: APP_CONFIG.UI.ANIMATION.DURATION.MEDIUM,
        useNativeDriver: true,
      })
    ]).start()
  }, [showHiddenSettings, fadeAnim, rotateAnim])

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  })

  function handleModelSelect(newModel: typeof MODELPROVIDERS[keyof typeof MODELPROVIDERS]) {
    if (newModel.label === chatType.label) {
      return
    }

    Alert.alert(
      'Switch to ' + newModel.displayName,
      'Would you like to continue with the current conversation or start a new one?',
      [
        {
          text: '✕ Cancel',
          style: 'cancel'
        },
        {
          text: '🗑️ New Conversation',
          style: 'destructive',
          onPress: () => {
            setChatType(newModel)
            if (clearChatRef.current) {
              clearChatRef.current()
            }
          }
        },
        {
          text: '💬 Continue Chat',
          style: 'default',
          onPress: () => {
            setChatType(newModel)
          }
        }
      ],
      { cancelable: true }
    )
  }

  function renderIcon(props: IconProps): React.ReactElement | null {
    const { type, size, theme, selected } = props

    if (!type) return null;

    const iconSize = typeof size === 'string' ? parseInt(size, 10) : size;
    if (type.includes('gpt')) {
      return <OpenAIIcon size={iconSize ?? 0} theme={theme} selected={selected || false} />
    }
    if (type.includes('claude')) {
      return <AnthropicIcon size={iconSize ?? 0} theme={theme} selected={selected || false} />
    }
    if (type.includes('gemini')) {
      return <GeminiIcon size={iconSize ?? 0} theme={theme} selected={selected || false} />
    }
    return null;
  }

  const handleThemeChange = (newTheme: typeof THEMES.light) => {
    setTheme(newTheme)
  }

  return (
    <ScrollView
      style={styles['container']}
      contentContainerStyle={styles['contentContainer']}
      onScroll={handleScroll}
      onScrollEndDrag={handleScrollEnd}
      scrollEventThrottle={16}
    >
      {showHiddenSettings && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles['hiddenSectionContainer']}>
            <View style={styles['hiddenSectionHeader']}>
              <Text style={styles['hiddenSectionTitle']}>Advanced Settings</Text>
              <TouchableOpacity
                onPress={toggleHiddenSettings}
                style={styles['hiddenSectionToggle']}
              >
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Ionicons
                    name="chevron-up"
                    size={24}
                    color={theme.textColor + '90'}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>

            <View style={styles['settingRow']}>
              <Text style={styles['hiddenSettingLabel']}>Temperature: {temperature.toFixed(2)}</Text>
              <Text style={styles['hiddenSettingDescription']}>
                Controls randomness: Lower values make responses more focused and deterministic, higher values make them more creative and varied.
              </Text>
              <Slider
                style={styles['slider']}
                minimumValue={SETTINGS_CONFIG.MODEL_PARAMS.TEMPERATURE.MIN}
                maximumValue={SETTINGS_CONFIG.MODEL_PARAMS.TEMPERATURE.MAX}
                step={SETTINGS_CONFIG.MODEL_PARAMS.TEMPERATURE.STEP}
                value={temperature}
                onValueChange={setTemperature}
                minimumTrackTintColor={theme.tintColor + '90'}
                maximumTrackTintColor={theme.borderColor + '60'}
                thumbTintColor={theme.tintColor + '90'}
              />
            </View>

            <View style={styles['settingRow']}>
              <Text style={styles['hiddenSettingLabel']}>Max Tokens: {maxTokens}</Text>
              <Text style={styles['hiddenSettingDescription']}>
                Maximum length of the model's response. Higher values allow for longer responses but may increase latency.
              </Text>
              <Slider
                style={styles['slider']}
                minimumValue={SETTINGS_CONFIG.MODEL_PARAMS.MAX_TOKENS.MIN}
                maximumValue={SETTINGS_CONFIG.MODEL_PARAMS.MAX_TOKENS.MAX}
                step={SETTINGS_CONFIG.MODEL_PARAMS.MAX_TOKENS.STEP}
                value={maxTokens}
                onValueChange={setMaxTokens}
                minimumTrackTintColor={theme.tintColor + '90'}
                maximumTrackTintColor={theme.borderColor + '60'}
                thumbTintColor={theme.tintColor + '90'}
              />
            </View>


          </View>
          <View style={[styles['sectionDivider'], styles['hiddenSectionDivider']]} />
        </Animated.View>
      )}

      <View style={styles['sectionContainer']}>
        <Text style={styles['sectionTitle']}>Chat Model</Text>
        <View style={styles['buttonContainer']}>
          {models.map((model, index) => {
            return (
              <TouchableHighlight
                key={index}
                underlayColor='transparent'
                onPress={() => handleModelSelect(model)}
              >
                <View
                  style={{ ...styles['chatChoiceButton'], ...getDynamicViewStyle({ baseType: chatType.label, type: model.label, theme } as DynamicStyleProps) }}
                >
                  {renderIcon({
                    theme,
                    type: model.label,
                    size: APP_CONFIG.UI.SIZES.ICON.SMALL as NumberProp,
                    selected: chatType.label === model.label || false
                  })}
                  <Text
                    style={{ ...styles['chatTypeText'], ...getDynamicTextStyle({ baseType: chatType.label, type: model.label, theme } as DynamicStyleProps) }}
                  >
                    {model.displayName}
                  </Text>
                </View>
              </TouchableHighlight>
            )
          })}
        </View>
      </View>

      <View style={styles['sectionDivider']} />

      <View style={styles['sectionContainer']}>
        <Text style={styles['sectionTitle']}>Theme</Text>
        <View style={styles['buttonContainer']}>
          {themes.map((themeOption, index) => (
            <TouchableHighlight
              key={index}
              underlayColor='transparent'
              onPress={() => handleThemeChange(themeOption.theme)}
            >
              <View
                style={{
                  ...styles['chatChoiceButton'],
                  ...getDynamicViewStyle({
                    baseType: currentThemeName,
                    type: themeOption.name,
                    theme
                  } as DynamicStyleProps)
                }}
              >
                <Text
                  style={{
                    ...styles['chatTypeText'],
                    ...getDynamicTextStyle({
                      baseType: currentThemeName,
                      type: themeOption.name,
                      theme
                    } as DynamicStyleProps)
                  }}
                >
                  {themeOption.name}
                </Text>
              </View>
            </TouchableHighlight>
          ))}
        </View>
      </View>

      <View style={styles['sectionContainer']}>
        <TouchableOpacity
          style={styles['doneButton']}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles['doneButtonText']}>Done</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

function getDynamicTextStyle({ baseType, type, theme }: DynamicStyleProps): StyleObject {
  if (type === baseType) {
    return {
      color: theme.tintTextColor,
    }
  } else return {}
}

function getDynamicViewStyle({ baseType, type, theme }: DynamicStyleProps): StyleObject {
  if (type === baseType) {
    return {
      backgroundColor: theme.tintColor
    }
  } else return {}
}