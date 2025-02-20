// filepath: src/config.ts
import { SetStateAction, Dispatch } from 'react'
import { NumberProp } from 'react-native-svg'
import { OpenAIIcon, AnthropicIcon, GeminiIcon } from './components/Icons'

export namespace NetworkConfig {
  export type Timeouts = typeof APP_CONFIG.NETWORK.TIMEOUTS;
  export type Retry = typeof APP_CONFIG.NETWORK.RETRY;
  export type RateLimits = typeof APP_CONFIG.NETWORK.RATE_LIMITS;
}

export namespace ValidationConfig {
  export type Messages = typeof APP_CONFIG.VALIDATION.MESSAGES;
  export type Inputs = typeof APP_CONFIG.VALIDATION.INPUTS;
  export type Errors = typeof APP_CONFIG.ERRORS.VALIDATION;
}

export namespace ErrorConfig {
  export type Validation = typeof APP_CONFIG.ERRORS.VALIDATION;
  export type Connection = typeof APP_CONFIG.ERRORS.CONNECTION;
  export type Cache = typeof APP_CONFIG.ERRORS.CACHE;
}

export type CacheConfig = typeof APP_CONFIG.CACHE;

export type AppConfig = typeof APP_CONFIG;

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp?: number;
  model?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  index: string;
}

export namespace OpenAI {
  export interface UserHistory {
    user: string;
    assistant: string;
    fileIds?: string[];
  }

  export interface StateWithIndex {
    messages: Array<{
      user: string;
      assistant: string;
    }>;
    index: string;
  }

  export interface Message {
    role: MessageRole;
    content: string;
  }
}

const GPT_PROVIDER = 'gpt' as const;
const CLAUDE_PROVIDER = 'claude' as const;
const GEMINI_PROVIDER = 'gemini' as const;

export type ModelProvider = typeof GPT_PROVIDER | typeof CLAUDE_PROVIDER | typeof GEMINI_PROVIDER;

export interface Model {
  label: ModelProvider;
  icon: React.ComponentType<any> | null;
  displayName: string;
}

export interface Theme {
  name: string;
  backgroundColor: string;
  textColor: string;
  tintColor: string;
  tintTextColor: string;
  borderColor: string;
  tabBarActiveTintColor: string;
  tabBarInactiveTintColor: string;
  placeholderTextColor: string;
  secondaryBackgroundColor: string;
  secondaryTextColor: string;
  regularFont: string;
  mediumFont: string;
  semiBoldFont: string;
  boldFont: string;
  lightFont: string;
}

export interface ThemeContext {
  theme: typeof THEMES.light;
  themeName: string;
  setTheme: Dispatch<SetStateAction<typeof THEMES.light>>;
}

export interface AppContext {
  chatType: Model;
  setChatType: Dispatch<SetStateAction<Model>>;
  handlePresentModalPress: () => void;
  closeModal: () => void;
  clearChat: () => void;
  clearChatRef: React.MutableRefObject<(() => void) | undefined>;
}

export interface IconProps {
  type?: string;
  theme: Theme;
  size?: NumberProp;
  selected?: boolean;
  [key: string]: any;
}

export const APP_CONFIG = {
  NETWORK: {
    TIMEOUTS: {
      API_REQUEST: 30_000,
      STREAM: 60_000,
      CONNECTION: 10_000,
      SOCKET: 5_000,
    },
    RETRY: {
      MAX_ATTEMPTS: 3,
      BACKOFF_MS: 1_000,
      MAX_BACKOFF_MS: 5_000,
    },
    RATE_LIMITS: {
      REQUESTS_PER_MINUTE: 60,
      CONCURRENT_STREAMS: 3,
    },
  },

  VALIDATION: {
    MESSAGES: {
      MAX_LENGTH: 4_000,
      MIN_LENGTH: 1,
      MAX_HISTORY: 100,
    },
    INPUTS: {
      MAX_FILE_SIZE: 10 * 1024 * 1024,
      ALLOWED_FILE_TYPES: ['txt', 'pdf', 'doc', 'docx'] as const,
    },
  },

  CACHE: {
    MESSAGE_TTL: 24 * 60 * 60 * 1_000,
    MAX_CACHE_SIZE: 50 * 1024 * 1024,
    INVALIDATION_INTERVAL: 60 * 60 * 1_000,
  },

  ERRORS: {
    VALIDATION: {
      EMPTY_MESSAGE: 'Message content cannot be empty',
      MESSAGE_TOO_LONG: (limit: number) => 
        `Message exceeds maximum length of ${limit} characters`,
      TOO_MANY_MESSAGES: (limit: number) => 
        `Conversation exceeds maximum of ${limit} messages`,
      INVALID_FILE_TYPE: (types: readonly string[]) => 
        `File type not supported. Allowed types: ${types.join(', ')}`,
      FILE_TOO_LARGE: (maxSize: number) => 
        `File size exceeds maximum of ${maxSize / (1024 * 1024)}MB`,
    },
    CONNECTION: {
      TIMEOUT: 'Connection timeout',
      FAILED: 'Failed to establish connection',
      INVALID_MODEL: (model: string, supported: string[]) => 
        `Unsupported model type: ${model}. Must be one of: ${supported.join(', ')}`,
      RATE_LIMITED: 'Too many requests. Please try again later.',
      CONCURRENT_LIMIT: 'Maximum number of concurrent streams reached',
    },
    CACHE: {
      STORAGE_FULL: 'Local storage is full. Please clear some space.',
      INVALID_CACHE: 'Cache data is corrupted or invalid',
    },
  },
  UI: {
    SPACING: {
      TINY: 4,
      SMALL: 8,
      MEDIUM: 12,
      LARGE: 16,
      XLARGE: 20,
      XXLARGE: 24,
      HUGE: 32,
      SECTION: 40,
    },
    TYPOGRAPHY: {
      SMALL: 13,
      BODY: 15,
      MEDIUM: 16,
      LARGE: 18,
      XLARGE: 20,
      TITLE: 24,
    },
    BORDER_RADIUS: {
      SMALL: 4,
      MEDIUM: 8,
      LARGE: 12,
      PILL: 24,
    },
    ANIMATION: {
      DURATION: {
        FAST: 100,
        MEDIUM: 200,
        SLOW: 300,
        VERY_SLOW: 400
      },
      DELAY: {
        DEFAULT: 100,
        LONG: 200
      },
      EASING: {
        DEFAULT: 'ease',
        IN_OUT: 'ease-in-out',
        BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      }
    },
    INPUT: {
      BORDER_RADIUS: 24,
      PADDING: {
        VERTICAL: 5,
        HORIZONTAL: 12
      },
      HEIGHT: 44
    },
    SIZES: {
      ICON: {
        SMALL: 18,
        MEDIUM: 22,
        LARGE: 28
      },
      TYPING_INDICATOR: {
        WIDTH: 28,
        HEIGHT: 28,
        DOT_SIZE: 6
      }
    },
    SHADOW: {
      OFFSET: {
        DEFAULT: { width: 0, height: 4 },
        SMALL: { width: 0, height: 2 },
        INVERTED: { width: 0, height: -4 }
      }
    }
  },
  STORAGE_KEYS: {
    THEME: 'theme',
    CHAT_TYPE: 'chatType'
  }
} as const;

export const DOMAIN = process.env['EXPO_PUBLIC_ENV'] === 'DEVELOPMENT' ?
  process.env['EXPO_PUBLIC_DEV_API_URL'] :
  process.env['EXPO_PUBLIC_PROD_API_URL']

function createModel(
  label: ModelProvider, 
  displayName: string, 
  icon: React.ComponentType<any>
): Model {
  return { label, icon, displayName }
}

export const DEFAULT_PROVIDER = (process.env['EXPO_PUBLIC_DEFAULT_PROVIDER'] || GPT_PROVIDER) as ModelProvider;

export const PROVIDERS = {
  GPT: (process.env['EXPO_PUBLIC_PROVIDER_GPT'] || GPT_PROVIDER) as typeof GPT_PROVIDER,
  CLAUDE: (process.env['EXPO_PUBLIC_PROVIDER_CLAUDE'] || CLAUDE_PROVIDER) as typeof CLAUDE_PROVIDER,
  GEMINI: (process.env['EXPO_PUBLIC_PROVIDER_GEMINI'] || GEMINI_PROVIDER) as typeof GEMINI_PROVIDER
} as const;

export const MODELS = {
  [GPT_PROVIDER]: createModel(
    GPT_PROVIDER,
    'GPT-4',
    OpenAIIcon
  ),
  [CLAUDE_PROVIDER]: createModel(
    CLAUDE_PROVIDER,
    'Claude',
    AnthropicIcon
  ),
  [GEMINI_PROVIDER]: createModel(
    GEMINI_PROVIDER,
    'Gemini',
    GeminiIcon
  )
} as Record<ModelProvider, Model>;

const COLORS = {
  white: '#fff',
  black: '#000',
  gray: 'rgba(0, 0, 0, .5)',
  lightWhite: 'rgba(255, 255, 255, .5)',
  blueTint: '#0281ff',
  lightPink: '#F7B5CD',
  vercelGray: '#171717',
  miamiDark: '#231F20',
} as const;

export const FONTS = {
  'Geist-Regular': require('./assets/fonts/Geist-Regular.otf'),
  'Geist-Light': require('./assets/fonts/Geist-Light.otf'),
  'Geist-Bold': require('./assets/fonts/Geist-Bold.otf'),
  'Geist-Medium': require('./assets/fonts/Geist-Medium.otf'),
  'Geist-Black': require('./assets/fonts/Geist-Black.otf'),
  'Geist-SemiBold': require('./assets/fonts/Geist-SemiBold.otf'),
  'Geist-Thin': require('./assets/fonts/Geist-Thin.otf'),
  'Geist-UltraLight': require('./assets/fonts/Geist-UltraLight.otf'),
  'Geist-UltraBlack': require('./assets/fonts/Geist-UltraBlack.otf')
} as const;

const FONT_STYLES = {
  regularFont: 'Geist-Regular',
  lightFont: 'Geist-Light',
  boldFont: 'Geist-Bold',
  mediumFont: 'Geist-Medium',
  blackFont: 'Geist-Black',
  semiBoldFont: 'Geist-SemiBold',
  thinFont: 'Geist-Thin',
  ultraLightFont: 'Geist-UltraLight',
  ultraBlackFont: 'Geist-UltraBlack',
} as const;

type BaseTheme = {
  name: string;
  label: string;
  textColor: string;
  secondaryTextColor: string;
  mutedForegroundColor: string;
  backgroundColor: string;
  placeholderTextColor: string;
  secondaryBackgroundColor: string;
  borderColor: string;
  tintColor: string;
  tintTextColor: string;
  tabBarActiveTintColor: string;
  tabBarInactiveTintColor: string;
} & typeof FONT_STYLES;

type ThemeType = {
  light: BaseTheme;
  dark: BaseTheme;
  miami: BaseTheme;
  vercel: BaseTheme;
};

const DARK_THEME: BaseTheme = {
  ...FONT_STYLES,
  name: 'Dark',
  label: 'dark',
  textColor: COLORS.white,
  secondaryTextColor: COLORS.black,
  mutedForegroundColor: COLORS.lightWhite,
  backgroundColor: COLORS.black,
  placeholderTextColor: COLORS.lightWhite,
  secondaryBackgroundColor: COLORS.white,
  borderColor: 'rgba(255, 255, 255, .2)',
  tintColor: COLORS.blueTint,
  tintTextColor: COLORS.white,
  tabBarActiveTintColor: COLORS.blueTint,
  tabBarInactiveTintColor: COLORS.lightWhite,
} as const;

export const THEMES: ThemeType = {
  light: {
    ...FONT_STYLES,
    name: 'Light',
    label: 'light',
    textColor: COLORS.black,
    secondaryTextColor: COLORS.white,
    mutedForegroundColor: COLORS.gray,
    backgroundColor: COLORS.white,
    placeholderTextColor: COLORS.gray,
    secondaryBackgroundColor: COLORS.black,
    borderColor: 'rgba(0, 0, 0, .15)',
    tintColor: COLORS.blueTint,
    tintTextColor: COLORS.white,
    tabBarActiveTintColor: COLORS.black,
    tabBarInactiveTintColor: COLORS.gray,
  },
  dark: DARK_THEME,
  miami: {
    ...FONT_STYLES,
    ...DARK_THEME,
    name: 'Miami',
    label: 'miami',
    backgroundColor: COLORS.miamiDark,
    tintColor: COLORS.lightPink,
    tintTextColor: COLORS.miamiDark,
    tabBarActiveTintColor: COLORS.lightPink,
  },
  vercel: {
    ...FONT_STYLES,
    ...DARK_THEME,
    name: 'Vercel',
    label: 'vercel',
    backgroundColor: COLORS.black,
    tintColor: COLORS.vercelGray,
    tintTextColor: COLORS.white,
    tabBarActiveTintColor: COLORS.white,
    tabBarInactiveTintColor: COLORS.lightWhite,
  }
} as const;

export const SETTINGS_CONFIG = {
  MODEL_PARAMS: {
    TEMPERATURE: {
      DEFAULT: 0.7,
      MIN: 0,
      MAX: 1,
      STEP: 0.01
    },
    MAX_TOKENS: {
      DEFAULT: 2000,
      MIN: 100,
      MAX: 8192,
      STEP: 100
    }
  },
  STORAGE_KEYS: {
    THEME: 'theme',
    CHAT_TYPE: 'chatType'
  }
} as const;

interface BottomSheetStyles {
  handleIndicator: {
    backgroundColor: string;
    width: number;
  };
  handle: {
    backgroundColor: string;
    borderTopLeftRadius: number;
    borderTopRightRadius: number;
  };
  background: {
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    shadowColor: string;
    shadowOffset: {
      width: number;
      height: number;
    };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export function getBottomSheetStyles(theme: typeof THEMES.light): BottomSheetStyles {
  return {
    handleIndicator: {
      backgroundColor: theme.mutedForegroundColor,
      width: APP_CONFIG.UI.SIZES.ICON.MEDIUM,
    },
    handle: {
      backgroundColor: theme.backgroundColor,
      borderTopLeftRadius: APP_CONFIG.UI.BORDER_RADIUS.MEDIUM,
      borderTopRightRadius: APP_CONFIG.UI.BORDER_RADIUS.MEDIUM,
    },
    background: {
      backgroundColor: theme.backgroundColor,
      borderColor: theme.borderColor,
      borderWidth: 1,
      shadowColor: COLORS.black,
      shadowOffset: APP_CONFIG.UI.SHADOW.OFFSET.INVERTED,
      shadowOpacity: 0.1,
      shadowRadius: APP_CONFIG.UI.BORDER_RADIUS.SMALL,
      elevation: 5,
    },
  }
}