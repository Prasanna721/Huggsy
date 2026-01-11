'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  loadState, saveState, AppState, ChatMessage,
  updateKidProfile, toggleLearningItem, toggleMiniGame,
  togglePracticeSession, addPracticeSession, addMessage
} from '@/lib/store'

type TabType = 'home' | 'messages' | 'profile'

// Icons
const BirdIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.5 9.5c-.33 0-.67.06-1 .17-.98-1.16-2.46-1.9-4.13-1.9-.56 0-1.1.08-1.62.21C14.03 6.22 12.15 5 10 5c-2.76 0-5 2.24-5 5 0 .28.02.55.07.82C3.3 11.41 2 13.05 2 15c0 2.76 2.24 5 5 5h12c1.93 0 3.5-1.57 3.5-3.5 0-1.64-1.13-3.02-2.66-3.41.1-.36.16-.73.16-1.09 0-.28-.02-.55-.07-.82.7-.47 1.57-.68 2.57-.68.28 0 .5-.22.5-.5s-.22-.5-.5-.5zM12 15c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
  </svg>
)

const HomeIcon = ({ active }: { active?: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill={active ? "#38ada9" : "#8ab5a5"}>
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
)

const ChatIcon = ({ active }: { active?: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill={active ? "#38ada9" : "#8ab5a5"}>
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
  </svg>
)

const ProfileIcon = ({ active }: { active?: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill={active ? "#38ada9" : "#8ab5a5"}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
)

const VolumeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </svg>
)

const PowerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/>
  </svg>
)

const MoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
)

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
)

const AddIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
)

// Game Card Component (new pink style from reference)
const GameCard = ({
  name,
  difficulty,
  ageFrom,
  illustration,
  enabled,
  onToggle
}: {
  name: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  ageFrom: number
  illustration: React.ReactNode
  enabled: boolean
  onToggle: () => void
}) => {
  const badgeClass = difficulty === 'Easy' ? 'badge-easy' : difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'

  return (
    <div className="w-full bg-white rounded-3xl p-5 flex items-center justify-between shadow-soft mb-3 card-hover">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 flex items-center justify-center">
          {illustration}
        </div>
        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-1 ${badgeClass}`}>
            {difficulty}
          </span>
          <h3 className="text-xl font-bold text-gray-800">{name}</h3>
          <p className="text-sm text-gray-500">From {ageFrom} year</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`toggle-switch flex-shrink-0 ${enabled ? 'active' : ''}`}
      />
    </div>
  )
}

// Illustrations for games
const FindIllustration = () => (
  <div className="relative w-14 h-14">
    <div className="absolute -left-1 top-0 w-8 h-10 bg-yellow-100 rounded-lg rotate-[-8deg] flex items-center justify-center text-lg shadow-sm">🍌</div>
    <div className="absolute left-3 top-1 w-8 h-10 bg-blue-100 rounded-lg rotate-[5deg] flex items-center justify-center text-lg shadow-sm">🌧️</div>
  </div>
)

const CountIllustration = () => (
  <div className="w-14 h-14 relative">
    <div className="absolute inset-0 bg-green-200 rounded-full shadow-sm"></div>
    <div className="absolute inset-1 flex flex-wrap justify-center items-center gap-0.5 p-1">
      {[...Array(6)].map((_, i) => (
        <span key={i} className="text-[10px]">🍎</span>
      ))}
    </div>
  </div>
)

const MathIllustration = () => (
  <div className="flex items-center gap-1">
    <div className="relative">
      <span className="text-2xl">🍎</span>
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm border">3</span>
    </div>
    <div className="relative">
      <span className="text-2xl">🍊</span>
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm border">2</span>
    </div>
  </div>
)

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [state, setState] = useState<AppState | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentTime, setCurrentTime] = useState('')
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showAddSession, setShowAddSession] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const currentEmotionRef = useRef<string>('neutral')

  // Initialize state from localStorage
  useEffect(() => {
    const loaded = loadState()
    setState(loaded)
  }, [])

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString())
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Connect to SSE for live messages
  useEffect(() => {
    const evtSource = new EventSource('/api/events')

    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.event === 'ai_emotion') {
          currentEmotionRef.current = data.message
          return
        }
        if (data.event === 'user_speech' || data.event === 'ai_response') {
          setState(prev => {
            if (!prev) return prev
            return addMessage(prev, {
              type: data.event === 'user_speech' ? 'user' : 'ai',
              text: data.message,
              emotion: data.event === 'ai_response' ? currentEmotionRef.current : undefined,
              timestamp: data.timestamp || new Date().toLocaleTimeString(),
            })
          })
          if (activeTab !== 'messages') {
            setUnreadCount(prev => prev + 1)
          }
        }
      } catch (e) {
        console.error('SSE parse error:', e)
      }
    }

    return () => evtSource.close()
  }, [activeTab])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state?.messages])

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    if (tab === 'messages') {
      setUnreadCount(0)
    }
  }

  const startEditing = (field: string, currentValue: string) => {
    setIsEditing(field)
    setEditValue(currentValue)
  }

  const saveEdit = (field: string) => {
    if (!state) return
    const updates: Record<string, string> = { [field]: editValue }
    const newState = updateKidProfile(state, updates)
    setState(newState)
    setIsEditing(null)
    setEditValue('')
  }

  const cancelEdit = () => {
    setIsEditing(null)
    setEditValue('')
  }

  const handleToggleLearning = (itemId: string) => {
    if (!state) return
    setState(toggleLearningItem(state, itemId))
  }

  const handleToggleGame = (gameId: string) => {
    if (!state) return
    setState(toggleMiniGame(state, gameId))
  }

  const handleToggleSession = (sessionId: string) => {
    if (!state) return
    setState(togglePracticeSession(state, sessionId))
  }

  const handleAddSession = (title: string, description: string) => {
    if (!state || !title.trim()) return
    setState(addPracticeSession(state, {
      title: title.trim(),
      description: description.trim(),
      addedBy: 'parent',
      enabled: true,
      frequency: 'daily',
    }))
    setShowAddSession(false)
  }

  if (!state) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#fdfdf8]">
        <div className="animate-bounce-gentle">
          <BirdIcon size={64} className="text-[#38ada9]" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#fdfdf8]">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide pb-20">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="p-4 animate-fade-in">
            {/* Device Card */}
            <div className="gradient-mint rounded-3xl p-6 mb-4 shadow-card relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/20 rounded-full blur-2xl" />

              <div className="flex items-center gap-4 mb-5 relative z-10">
                <div className="w-20 h-20 gradient-forest rounded-full flex items-center justify-center shadow-lg animate-bounce-gentle">
                  <BirdIcon size={48} className="text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-800">
                    {state.deviceSettings.name}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 status-glow" />
                    <span className="font-medium">Online</span>
                    <span className="text-gray-500">{currentTime}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 relative z-10">
                <div className="flex-1 glass rounded-2xl p-4 flex items-center gap-3 card-hover cursor-pointer">
                  <div className="w-10 h-10 gradient-mint rounded-xl flex items-center justify-center">
                    <VolumeIcon />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Volume</p>
                    <p className="text-lg font-bold text-gray-800">{state.deviceSettings.volume}%</p>
                  </div>
                </div>
                <div className="flex-1 glass rounded-2xl p-4 flex items-center gap-3 card-hover cursor-pointer">
                  <div className="w-10 h-10 gradient-mint rounded-xl flex items-center justify-center">
                    <PowerIcon />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Power</p>
                    <p className="text-lg font-bold text-gray-800">{state.deviceSettings.power}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* About Device Card */}
            <div className="bg-white rounded-3xl p-5 mb-4 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  About {state.deviceSettings.name}
                </h2>
                <button className="w-9 h-9 rounded-xl bg-[#e8f5e9] flex items-center justify-center hover:bg-[#c8e6c9] transition-colors">
                  <MoreIcon />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Name', value: state.deviceSettings.name },
                  { label: 'Talk Speed', value: state.deviceSettings.talkSpeed },
                  { label: 'Language', value: state.deviceSettings.language },
                  { label: 'Wi-Fi', value: state.deviceSettings.wifiName },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-[#e8f5e9] rounded-2xl p-4 card-hover cursor-pointer"
                  >
                    <p className="text-xs text-gray-500 font-medium mb-1">{item.label}</p>
                    <p className="text-base font-semibold text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* About Kid Card */}
            <div className="bg-blue-50 rounded-3xl p-5 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  About {state.kidProfile.name}
                </h2>
                <button className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors">
                  <MoreIcon />
                </button>
              </div>

              {/* Editable Sections */}
              {[
                { key: 'favorites', label: 'Favorites', value: state.kidProfile.favorites },
                { key: 'restrictions', label: 'Restrictions', value: state.kidProfile.restrictions },
                { key: 'routines', label: 'Routines', value: state.kidProfile.routines },
              ].map((section) => (
                <div key={section.key} className="bg-white/70 rounded-2xl p-4 mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      {section.label}
                    </p>
                    {isEditing === section.key ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(section.key)}
                          className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center hover:bg-green-200"
                        >
                          <CheckIcon />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center hover:bg-red-200"
                        >
                          <CloseIcon />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(section.key, section.value)}
                        className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center hover:bg-blue-200"
                      >
                        <EditIcon />
                      </button>
                    )}
                  </div>
                  {isEditing === section.key ? (
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full p-3 rounded-xl border-2 border-blue-200 focus:border-[#78e08f] focus:outline-none text-gray-800 text-sm resize-none"
                      rows={3}
                      autoFocus
                    />
                  ) : (
                    <p className="text-gray-800 font-medium leading-relaxed">
                      {section.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="flex flex-col h-full animate-fade-in">
            <div className="gradient-mint p-5 mb-4 mx-4 mt-4 rounded-3xl shadow-soft">
              <h1 className="text-2xl font-bold text-gray-800">
                Conversations
              </h1>
              <p className="text-gray-600">
                Chat history with {state.deviceSettings.name}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 scrollbar-thin">
              {state.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-20 h-20 bg-[#e8f5e9] rounded-full flex items-center justify-center mb-4">
                    <ChatIcon active />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">No messages yet</h3>
                  <p className="text-gray-500">
                    Conversations with {state.deviceSettings.name} will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pb-4">
                  {state.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 message-animate ${
                        msg.type === 'user' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.type === 'ai'
                            ? 'gradient-forest'
                            : 'gradient-sunny'
                        }`}
                      >
                        {msg.type === 'ai' ? (
                          <BirdIcon size={18} className="text-white" />
                        ) : (
                          <ProfileIcon active />
                        )}
                      </div>
                      <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                          msg.type === 'ai'
                            ? 'bg-white shadow-soft rounded-bl-md'
                            : 'gradient-forest text-white rounded-br-md'
                        }`}
                      >
                        <p className={msg.type === 'ai' ? 'text-gray-800' : 'text-white'}>
                          {msg.text}
                        </p>
                        {msg.emotion && (
                          <p className="text-xs text-gray-400 mt-1 italic">
                            Feeling {msg.emotion}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="p-4 animate-fade-in">
            {/* Profile Header */}
            <div className="gradient-mint rounded-3xl p-8 text-center mb-4 shadow-card relative overflow-hidden">
              <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-white/15 rounded-full blur-2xl" />

              <div className="relative z-10">
                <div className="w-24 h-24 gradient-sunny rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  {state.kidProfile.profileImage ? (
                    <img
                      src={state.kidProfile.profileImage}
                      alt={state.kidProfile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">👦</span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                  {state.kidProfile.name}
                </h1>
                <p className="text-gray-600 font-medium">
                  {state.kidProfile.age} years old
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Chats', value: state.stats.totalChats },
                { label: 'Days', value: state.stats.daysActive },
                { label: 'Stories', value: state.stats.storiesHeard },
                { label: 'Games', value: state.stats.gamesPlayed },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-4 text-center shadow-soft">
                  <p className="text-xl font-bold text-[#38ada9]">{stat.value}</p>
                  <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Learning Progress */}
            <div className="bg-white rounded-3xl p-5 mb-4 shadow-soft">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Learning Journey
              </h2>

              <div className="space-y-3">
                {state.learningItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                      item.enabled ? 'bg-[#e8f5e9]' : 'bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <span className="text-xs font-medium text-gray-500">
                          {item.progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full progress-bar rounded-full transition-all duration-500"
                          style={{ width: `${item.enabled ? item.progress : 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    </div>
                    <button
                      onClick={() => handleToggleLearning(item.id)}
                      className={`toggle-switch flex-shrink-0 ${item.enabled ? 'active' : ''}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Games - New Pink Style */}
            <div className="bg-[#FDF2F0] rounded-3xl p-5 mb-4 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Mini Games
                </h2>
                <span className="px-3 py-1 bg-white rounded-full text-sm font-semibold text-gray-600 shadow-sm">
                  {state.miniGames.filter(g => g.enabled).length}/{state.miniGames.length}
                </span>
              </div>

              <GameCard
                name="Find"
                difficulty="Easy"
                ageFrom={3}
                illustration={<FindIllustration />}
                enabled={state.miniGames[0]?.enabled ?? true}
                onToggle={() => handleToggleGame(state.miniGames[0]?.id ?? 'color-quest')}
              />
              <GameCard
                name="Count"
                difficulty="Medium"
                ageFrom={4}
                illustration={<CountIllustration />}
                enabled={state.miniGames[1]?.enabled ?? true}
                onToggle={() => handleToggleGame(state.miniGames[1]?.id ?? 'sound-safari')}
              />
              <GameCard
                name="Math"
                difficulty="Hard"
                ageFrom={5}
                illustration={<MathIllustration />}
                enabled={state.miniGames[2]?.enabled ?? true}
                onToggle={() => handleToggleGame(state.miniGames[2]?.id ?? 'counting-fun')}
              />
            </div>

            {/* Practice Sessions */}
            <div className="bg-blue-50 rounded-3xl p-5 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Practice Sessions
                </h2>
                <button
                  onClick={() => setShowAddSession(true)}
                  className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors"
                >
                  <AddIcon />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                The AI will gently guide {state.kidProfile.name} towards these activities during conversations.
              </p>

              <div className="space-y-3">
                {state.practiceSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-start gap-3 p-4 bg-white/70 rounded-2xl"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{session.title}</h3>
                        {session.addedBy === 'parent' && (
                          <span className="text-xs px-2 py-0.5 bg-[#fad390] rounded-full text-gray-700">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{session.description}</p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">{session.frequency}</p>
                    </div>
                    <button
                      onClick={() => handleToggleSession(session.id)}
                      className={`toggle-switch flex-shrink-0 ${session.enabled ? 'active' : ''}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_30px_rgba(0,0,0,0.08)] z-50 nav-safe">
        <div className="flex items-center justify-around py-3 px-4">
          {[
            { id: 'home' as TabType, icon: HomeIcon, label: 'Home' },
            { id: 'messages' as TabType, icon: ChatIcon, label: 'Messages' },
            { id: 'profile' as TabType, icon: ProfileIcon, label: 'Profile' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all relative ${
                activeTab === tab.id
                  ? 'bg-[#e8f5e9]'
                  : 'hover:bg-gray-50'
              }`}
            >
              {activeTab === tab.id && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#38ada9] rounded-full" />
              )}
              <tab.icon active={activeTab === tab.id} />
              <span
                className={`text-xs font-semibold transition-colors ${
                  activeTab === tab.id ? 'text-[#38ada9]' : 'text-gray-400'
                }`}
              >
                {tab.label}
              </span>
              {tab.id === 'messages' && unreadCount > 0 && (
                <span className="absolute -top-1 right-2 w-5 h-5 bg-[#f6b93b] rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Add Session Modal */}
      {showAddSession && (
        <AddSessionModal
          onClose={() => setShowAddSession(false)}
          onAdd={handleAddSession}
        />
      )}
    </div>
  )
}

// Add Session Modal Component
function AddSessionModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (title: string, description: string) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center animate-fade-in">
      <div className="bg-white rounded-t-3xl w-full p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Add Practice Session
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              What should the AI help with?
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Practice saying please and thank you"
              className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-[#78e08f] focus:outline-none text-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional details..."
              className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-[#78e08f] focus:outline-none text-gray-800 resize-none"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onAdd(title, description)}
            disabled={!title.trim()}
            className="flex-1 py-4 rounded-2xl gradient-mint text-gray-800 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Add Session
          </button>
        </div>
      </div>
    </div>
  )
}
