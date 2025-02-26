// filepath: src/screens/ChatScreen.tsx
import React, { useEffect, useCallback, useContext, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  KeyboardAvoidingView, 
  TouchableHighlight, 
  TextInput, 
  ScrollView, 
  ActivityIndicator, 
  FlatList, 
  Keyboard, 
  Animated, 
  Easing 
} from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';

import { ThemeContext, AppContext } from '../contexts';
import { ChatMessage, ChatState, APP_CONFIG, MessageRole } from '../config';
import { chatService } from '../services';
import { ChatError, validateMessage, getFirstNCharsOrLess, logInfo, logDebug, logError } from '../utils';
import { ChatMessage as ChatMessageComponent, ChatInput, TypingIndicator } from '../components/ChatUI';
import { getChatStyles } from '../styles/chat'

export function ChatScreen() {
  const [loading, setLoading] = useState<boolean>(false)
  const [input, setInput] = useState<string>('')
  const [callMade, setCallMade] = useState<boolean>(false)
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    index: uuid()
  })
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting' | null>(null)
  const fadeAnim = useRef(new Animated.Value(1)).current
  const inputOpacity = useRef(new Animated.Value(1)).current
  const typingDots = useRef<Animated.Value[]>([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;

  const scrollViewRef = useRef<ScrollView | null>(null)
  const { showActionSheetWithOptions } = useActionSheet()
  const buttonScale = useRef(new Animated.Value(1)).current
  const sendButtonScale = useRef(new Animated.Value(1)).current

  const { theme } = useContext(ThemeContext)
  const { chatType, clearChatRef } = useContext(AppContext)
  const styles = getChatStyles(theme)

  useEffect(() => {
    if (clearChatRef) {
      clearChatRef.current = handleClearChat
    }
    return () => {
      if (clearChatRef) {
        clearChatRef.current = undefined
      }
    }
  }, [])

  function handleClearChat() {
    if (loading) return
    
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: APP_CONFIG.UI.ANIMATION.DURATION.MEDIUM,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: APP_CONFIG.UI.ANIMATION.DURATION.SLOW,
        delay: APP_CONFIG.UI.ANIMATION.DELAY.DEFAULT,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      })
    ]).start()

    setTimeout(() => {
      setChatState({
        messages: [],
        index: uuid()
      })
      setInput('')
      setCallMade(false)
    }, 200)
  }

  const animateButton = (scale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: APP_CONFIG.UI.ANIMATION.DURATION.FAST,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: APP_CONFIG.UI.ANIMATION.DURATION.FAST,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start()
  }

  const showErrorToast = (error: ChatError) => {
    const errorMessages: Record<string, string> = {
      'PARSE_ERROR': 'Failed to process AI response',
      'STREAM_ERROR': 'Connection interrupted',
      'REQUEST_ERROR': 'Failed to connect to chat service',
      'HTTP_ERROR': 'Server error occurred',
      'UNKNOWN_ERROR': 'An unexpected error occurred'
    };

    Toast.show({
      type: 'error',
      text1: errorMessages[error.code] || 'Error',
      text2: error.message,
      position: 'bottom',
      visibilityTime: 4000,
    });
  };

  const showConnectionToast = (status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting') => {
    const statusMessages: Record<string, { text1: string; text2: string; type: string }> = {
      'connecting': {
        text1: 'Connecting...',
        text2: 'Establishing connection to chat service',
        type: 'info'
      },
      'connected': {
        text1: 'Connected',
        text2: 'Successfully connected to chat service',
        type: 'success'
      },
      'disconnected': {
        text1: 'Connection Lost',
        text2: 'Attempting to reconnect...',
        type: 'error'
      },
      'reconnecting': {
        text1: 'Reconnecting...',
        text2: 'Attempting to restore connection',
        type: 'info'
      }
    };

    const message = statusMessages[status];
    if (message) {
      Toast.show({
        type: message.type as any,
        text1: message.text1,
        text2: message.text2,
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  };

  const validateAndPrepareMessage = (input: string, chatState: ChatState) => {
    const userMessage = {
      role: 'user' as const,
      content: getFirstNCharsOrLess(input),
      timestamp: Date.now()
    };
    
    const messages = [...chatState.messages, userMessage];

    // Log user prompt
    logInfo('User sent message', { 
      messageId: userMessage.timestamp,
      contentLength: userMessage.content.length,
      action: 'user_message'
    });
    
    // For privacy reasons, we log a truncated version of the message
    logDebug('User message content (truncated)', { 
      preview: userMessage.content.length > 30 
        ? `${userMessage.content.substring(0, 30)}...` 
        : userMessage.content,
      action: 'user_message_content'
    });

    const newMessage = messages[messages.length - 1]!;
    validateMessage(newMessage);

    return messages;
  };

  const animateInputLoading = (isLoading: boolean) => {
    Animated.timing(inputOpacity, {
      toValue: isLoading ? 0.5 : 1,
      duration: APP_CONFIG.UI.ANIMATION.DURATION.MEDIUM,
      useNativeDriver: true,
    }).start();
  };

  const animateTypingDots = () => {
    const createDotAnimation = (dot: Animated.Value) => {
      return Animated.sequence([
        Animated.timing(dot, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        })
      ]);
    };

    Animated.loop(
      Animated.stagger(200, [
        createDotAnimation(typingDots[0]!),
        createDotAnimation(typingDots[1]!),
        createDotAnimation(typingDots[2]!)
      ])
    ).start();
  };

  async function chat() {
    if (!input.trim()) return
    animateButton(sendButtonScale)
    Keyboard.dismiss()

    if (!callMade) {
      setCallMade(true)
    }

    try {
      const messages = validateAndPrepareMessage(input, chatState);
      
      setChatState(prev => ({
        ...prev,
        messages
      }));

      scrollToBottom()

      setLoading(true)
      setInput('')
      animateInputLoading(true)
      animateTypingDots()

      const responseMap = new Map<string, string>();
      const startTime = Date.now();

      await chatService.streamChat(
        messages,
        {
          provider: chatType.label,
          temperature: 0.3,
          streaming: true
        },
        {
          onToken: (token, messageId) => {
            const currentContent = responseMap.get(messageId) || '';
            const newContent = currentContent + token;
            responseMap.set(messageId, newContent);

            setChatState(prev => {
              const messages = [...prev.messages];
              const lastMessage = messages[messages.length - 1];
              
              if (lastMessage?.role === 'assistant') {
                messages[messages.length - 1] = {
                  ...lastMessage,
                  content: newContent
                };
              } else {
                // New AI message started
                const aiMessage: ChatMessage = {
                  role: 'assistant' as MessageRole,
                  content: newContent,
                  timestamp: Date.now(),
                  model: chatType.displayName
                };
                
                messages.push(aiMessage);
                
                // Log the start of AI response
                logInfo('AI response started', { 
                  messageId,
                  model: chatType.displayName,
                  action: 'ai_response_started'
                });
              }

              return {
                ...prev,
                messages
              };
            });

            requestAnimationFrame(scrollToBottom);
          },
          onError: (error) => {
            logError('Chat error occurred', { 
              error: error instanceof Error ? error.message : String(error),
              provider: chatType.label,
              action: 'chat_error'
            });
            
            console.error('Chat error:', error)
            setLoading(false)
            animateInputLoading(false)
            if (error instanceof ChatError) {
              showErrorToast(error)
            } else {
              showErrorToast(new ChatError('An unexpected error occurred', 'UNKNOWN_ERROR'))
            }
          },
          onComplete: () => {
            const responseTime = Date.now() - startTime;
            
            // Get the final AI response
            setChatState(prev => {
              const lastMessage = prev.messages[prev.messages.length - 1];
              if (lastMessage?.role === 'assistant') {
                // Log completion of AI response
                logInfo('AI response completed', { 
                  responseTimeMs: responseTime,
                  contentLength: lastMessage.content.length,
                  model: chatType.displayName,
                  action: 'ai_response_completed'
                });
                
                // For privacy reasons, we log a truncated version of the message
                logDebug('AI response content (truncated)', { 
                  preview: lastMessage.content.length > 50 
                    ? `${lastMessage.content.substring(0, 50)}...` 
                    : lastMessage.content,
                  action: 'ai_response_content'
                });
              }
              return prev;
            });
            
            setLoading(false)
            animateInputLoading(false)
            scrollToBottom()
          },
          onConnectionStatus: (status) => {
            logInfo('Connection status changed', { 
              status,
              provider: chatType.label,
              action: 'connection_status_change'
            });
            
            setConnectionStatus(status)
            showConnectionToast(status)
          }
        }
      )
    } catch (error) {
      logError('Failed to send message', { 
        error: error instanceof Error ? error.message : String(error),
        action: 'message_send_failed'
      });
      
      console.error('Failed to send message:', error)
      setLoading(false)
      animateInputLoading(false)
      if (error instanceof ChatError) {
        showErrorToast(error)
      } else if (error instanceof Error) {
        showErrorToast(new ChatError(error.message, 'UNKNOWN_ERROR'))
      } else {
        showErrorToast(new ChatError('Failed to send message', 'UNKNOWN_ERROR'))
      }
    }
  }

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }

  const renderItem = useCallback(({ item }: { item: ChatMessage }) => (
    <ChatMessageComponent 
      item={item} 
      theme={theme}
      onPressOptions={showClipboardActionsheet}
    />
  ), [theme, showClipboardActionsheet]);

  async function copyToClipboard(text: string) {
    await Clipboard.setStringAsync(text)
  }

  async function showClipboardActionsheet(text: string) {
    const cancelButtonIndex = 2
    showActionSheetWithOptions({
      options: ['Copy to clipboard', 'Clear chat', 'cancel'],
      cancelButtonIndex
    }, selectedIndex => {
      if (selectedIndex === 0) {
        copyToClipboard(text)
      }
      if (selectedIndex === 1) {
        handleClearChat()
      }
    })
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={styles.container}
      keyboardVerticalOffset={110}
    >
      {connectionStatus === 'reconnecting' && (
        <View style={styles.connectionStatusBar}>
          <ActivityIndicator size="small" color={theme.tintTextColor} />
          <Text style={styles.connectionStatusText}>Reconnecting...</Text>
        </View>
      )}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          keyboardShouldPersistTaps='handled'
          ref={scrollViewRef}
          contentContainerStyle={[
            !callMade && styles.scrollContentContainer,
            { paddingBottom: 20 }
          ]}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        >
          {!callMade ? (
            <View style={styles.midChatInputWrapper}>
              <View style={styles.midChatInputContainer}>
                <TextInput
                  onChangeText={setInput}
                  style={styles.midInput}
                  placeholder='Message'
                  placeholderTextColor={theme.placeholderTextColor + '80'}
                  autoCorrect={true}
                  maxLength={APP_CONFIG.VALIDATION.MESSAGES.MAX_LENGTH}
                  accessible={true}
                  accessibilityLabel="Message input field"
                  accessibilityHint="Enter your message to the AI"
                />
                <TouchableHighlight
                  onPress={() => {
                    animateButton(buttonScale)
                    chat()
                  }}
                  underlayColor={theme.tintColor + '90'}
                  style={styles.midButtonContainer}
                  accessible={true}
                  accessibilityLabel={`Start ${chatType.displayName} Chat`}
                  accessibilityHint="Begins a new chat session with the AI"
                >
                  <Animated.View 
                    style={[
                      styles.midButtonStyle,
                      {
                        transform: [{ scale: buttonScale }]
                      }
                    ]}
                  >
                    <Ionicons
                      name="chatbox-ellipses-outline"
                      size={22}
                      color={theme.tintTextColor}
                      style={styles.midButtonIcon}
                    />
                    <Text style={styles.midButtonText}>
                      Start {chatType.displayName} Chat
                    </Text>
                  </Animated.View>
                </TouchableHighlight>
                <Text style={styles.chatDescription}>
                  It's time to prompt...
                </Text>
              </View>
            </View>
          ) : (
            <FlatList
              data={chatState.messages}
              renderItem={renderItem}
              scrollEnabled={false}
              keyExtractor={(_, index) => `${chatType.label}-${index}`}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              windowSize={5}
            />
          )}
          {loading && (
            <TypingIndicator 
              theme={theme}
              typingDots={typingDots}
              modelDisplayName={chatType.displayName}
            />
          )}
          {loading && <ActivityIndicator style={styles.loadingContainer} />}
        </ScrollView>
      </Animated.View>
      {callMade && (
        <ChatInput
          input={input}
          loading={loading}
          theme={theme}
          inputOpacity={inputOpacity}
          sendButtonScale={sendButtonScale}
          onChangeText={setInput}
          onSend={() => {
            if (!loading && input.trim()) {
              animateButton(sendButtonScale);
              chat();
            }
          }}
        />
      )}
      <Toast />
    </KeyboardAvoidingView>
  )
}