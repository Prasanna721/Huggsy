// Types for the application data

export interface KidProfile {
  name: string
  age: number
  profileImage: string | null
  favorites: string
  restrictions: string
  routines: string
}

export interface DeviceSettings {
  name: string
  talkSpeed: 'Slow' | 'Normal' | 'Fast'
  language: string
  wifiName: string
  volume: number
  power: number
}

export interface LearningItem {
  id: string
  name: string
  description: string
  icon: string
  enabled: boolean
  progress: number // 0-100
}

export interface MiniGame {
  id: string
  name: string
  description: string
  icon: string
  color: string
  ageRange: string
  enabled: boolean
  playCount: number
}

export interface PracticeSession {
  id: string
  title: string
  description: string
  addedBy: 'parent' | 'system'
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'occasionally'
}

export interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  text: string
  emotion?: string
  timestamp: string
}

export interface AppState {
  kidProfile: KidProfile
  deviceSettings: DeviceSettings
  learningItems: LearningItem[]
  miniGames: MiniGame[]
  practiceSessions: PracticeSession[]
  messages: ChatMessage[]
  stats: {
    totalChats: number
    daysActive: number
    storiesHeard: number
    gamesPlayed: number
  }
}

// Default data for a 2-3 year old child
const defaultState: AppState = {
  kidProfile: {
    name: 'Andy',
    age: 3,
    profileImage: null,
    favorites: 'Andy loves playing with his friend Mia, building LEGO sets, and drawing. He likes red fire trucks, soccer, and his favorite color is green.',
    restrictions: 'Please avoid scary topics like monsters or ghosts - these make Andy anxious at night.',
    routines: "Andy's bedtime is 9:00 PM to 7:00 AM. He has snack time at 3 PM and loves story time before bed.",
  },
  deviceSettings: {
    name: 'Huggsy',
    talkSpeed: 'Normal',
    language: 'English',
    wifiName: 'MyWifi-1234',
    volume: 72,
    power: 93,
  },
  learningItems: [
    {
      id: 'alphabet',
      name: 'Alphabet',
      description: 'Learn letters A to Z with fun sounds',
      icon: '🔤',
      enabled: true,
      progress: 35,
    },
    {
      id: 'numbers',
      name: 'Numbers',
      description: 'Count from 1 to 20 with Huggsy',
      icon: '🔢',
      enabled: true,
      progress: 50,
    },
    {
      id: 'colors',
      name: 'Colors',
      description: 'Discover and name different colors',
      icon: '🎨',
      enabled: true,
      progress: 70,
    },
    {
      id: 'shapes',
      name: 'Shapes',
      description: 'Learn circles, squares, and more',
      icon: '⭐',
      enabled: false,
      progress: 0,
    },
    {
      id: 'animals',
      name: 'Animals',
      description: 'Animal names and sounds',
      icon: '🦁',
      enabled: true,
      progress: 45,
    },
    {
      id: 'words',
      name: 'First Words',
      description: 'Build vocabulary with everyday words',
      icon: '💬',
      enabled: false,
      progress: 10,
    },
  ],
  miniGames: [
    {
      id: 'color-quest',
      name: 'Color Quest',
      description: 'Find and name colors around you! Huggsy will ask you to spot colors in your room.',
      icon: '🌈',
      color: '#78e08f',
      ageRange: '2-4',
      enabled: true,
      playCount: 12,
    },
    {
      id: 'sound-safari',
      name: 'Sound Safari',
      description: 'Listen to animal sounds and guess which animal it is. Great for learning animal names!',
      icon: '🎵',
      color: '#f6b93b',
      ageRange: '2-4',
      enabled: true,
      playCount: 8,
    },
    {
      id: 'counting-fun',
      name: 'Counting Fun',
      description: 'Count objects together with Huggsy. Start with 1-5 and grow to bigger numbers!',
      icon: '🎯',
      color: '#38ada9',
      ageRange: '2-5',
      enabled: true,
      playCount: 15,
    },
  ],
  practiceSessions: [
    {
      id: 'morning-greeting',
      title: 'Morning Greeting',
      description: 'Practice saying good morning and talking about the day ahead',
      addedBy: 'system',
      enabled: true,
      frequency: 'daily',
    },
    {
      id: 'bedtime-story',
      title: 'Bedtime Story',
      description: 'Listen to a calming story before sleep',
      addedBy: 'system',
      enabled: true,
      frequency: 'daily',
    },
    {
      id: 'emotion-check',
      title: 'How Do You Feel?',
      description: 'Practice identifying and expressing emotions',
      addedBy: 'parent',
      enabled: true,
      frequency: 'daily',
    },
  ],
  messages: [],
  stats: {
    totalChats: 42,
    daysActive: 7,
    storiesHeard: 12,
    gamesPlayed: 35,
  },
}

const STORAGE_KEY = 'tuya-kids-app-state'

export function loadState(): AppState {
  if (typeof window === 'undefined') return defaultState

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Merge with defaults to handle new fields
      return { ...defaultState, ...parsed }
    }
  } catch (e) {
    console.error('Failed to load state:', e)
  }
  return defaultState
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save state:', e)
  }
}

export function resetState(): AppState {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
  return defaultState
}

// Helper to update nested state
export function updateKidProfile(state: AppState, updates: Partial<KidProfile>): AppState {
  const newState = {
    ...state,
    kidProfile: { ...state.kidProfile, ...updates },
  }
  saveState(newState)
  return newState
}

export function updateDeviceSettings(state: AppState, updates: Partial<DeviceSettings>): AppState {
  const newState = {
    ...state,
    deviceSettings: { ...state.deviceSettings, ...updates },
  }
  saveState(newState)
  return newState
}

export function toggleLearningItem(state: AppState, itemId: string): AppState {
  const newState = {
    ...state,
    learningItems: state.learningItems.map(item =>
      item.id === itemId ? { ...item, enabled: !item.enabled } : item
    ),
  }
  saveState(newState)
  return newState
}

export function toggleMiniGame(state: AppState, gameId: string): AppState {
  const newState = {
    ...state,
    miniGames: state.miniGames.map(game =>
      game.id === gameId ? { ...game, enabled: !game.enabled } : game
    ),
  }
  saveState(newState)
  return newState
}

export function addPracticeSession(state: AppState, session: Omit<PracticeSession, 'id'>): AppState {
  const newState = {
    ...state,
    practiceSessions: [
      ...state.practiceSessions,
      { ...session, id: `custom-${Date.now()}` },
    ],
  }
  saveState(newState)
  return newState
}

export function togglePracticeSession(state: AppState, sessionId: string): AppState {
  const newState = {
    ...state,
    practiceSessions: state.practiceSessions.map(session =>
      session.id === sessionId ? { ...session, enabled: !session.enabled } : session
    ),
  }
  saveState(newState)
  return newState
}

export function addMessage(state: AppState, message: Omit<ChatMessage, 'id'>): AppState {
  const newState = {
    ...state,
    messages: [
      ...state.messages,
      { ...message, id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}` },
    ],
    stats: {
      ...state.stats,
      totalChats: state.stats.totalChats + 1,
    },
  }
  saveState(newState)
  return newState
}
