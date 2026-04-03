/**
 * pages/TeamChat.jsx
 *
 * Internal team discussion module — chat-style UI.
 * Channels on the left, message feed on the right.
 * Polling every 5 seconds for near-real-time feel.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/client'

// Toast hook (same pattern used across the app)
function useToast() {
  return {
    success: (msg) => { /* piggyback on existing toast system or console */ },
    error: (msg) => { console.error(msg) },
  }
}

export default function TeamChat() {
  const { user } = useAuth()
  const role = user?.role ?? 'staff'
  const isAdmin = role === 'admin'

  const [channels, setChannels] = useState([])
  const [activeChannel, setActiveChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [sending, setSending] = useState(false)
  const [loadingChannels, setLoadingChannels] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState(false)

  // Admin channel management
  const [showChannelModal, setShowChannelModal] = useState(false)
  const [editingChannel, setEditingChannel] = useState(null)
  const [channelForm, setChannelForm] = useState({ label: '', icon: '💬', description: '' })

  const messagesEndRef = useRef(null)
  const lastMsgIdRef = useRef(0)
  const pollRef = useRef(null)

  // ── Fetch channels ──
  const fetchChannels = useCallback(async () => {
    try {
      const res = await apiClient.get('/team-chat/channels')
      const data = Array.isArray(res.data) ? res.data : []
      setChannels(data)
      if (!activeChannel && data.length > 0) {
        setActiveChannel(data[0])
      }
    } catch (e) {
      console.error('Failed to load channels', e)
      setError(true)
    } finally {
      setLoadingChannels(false)
    }
  }, [activeChannel])

  useEffect(() => { fetchChannels() }, [])

  // ── Fetch messages for active channel ──
  const fetchMessages = useCallback(async (polling = false) => {
    if (!activeChannel) return
    if (!polling) setLoadingMessages(true)

    try {
      const url = `/team-chat/${activeChannel.id}/messages` + (polling && lastMsgIdRef.current ? `?after=${lastMsgIdRef.current}` : '')
      const res = await apiClient.get(url)
      const data = Array.isArray(res.data) ? res.data : []

      if (polling && lastMsgIdRef.current > 0) {
        if (data.length > 0) {
          setMessages(prev => [...prev, ...data])
          lastMsgIdRef.current = data[data.length - 1].id
          scrollToBottom()
        }
      } else {
        setMessages(data)
        if (data.length > 0) {
          lastMsgIdRef.current = data[data.length - 1].id
        } else {
          lastMsgIdRef.current = 0
        }
        scrollToBottom()
      }
    } catch (e) {
      console.error('Failed to load messages', e)
    } finally {
      if (!polling) setLoadingMessages(false)
    }
  }, [activeChannel])

  useEffect(() => {
    if (activeChannel) {
      lastMsgIdRef.current = 0
      fetchMessages(false)
    }
  }, [activeChannel])

  // ── Polling every 5 seconds ──
  useEffect(() => {
    if (!activeChannel) return
    pollRef.current = setInterval(() => fetchMessages(true), 5000)
    return () => clearInterval(pollRef.current)
  }, [activeChannel, fetchMessages])

  function scrollToBottom() {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  // ── Send message ──
  async function handleSend(e) {
    e?.preventDefault()
    if (!newMsg.trim() || !activeChannel || sending) return
    setSending(true)
    try {
      const res = await apiClient.post(`/team-chat/${activeChannel.id}/messages`, {
        message: newMsg.trim(),
        reply_to_id: replyTo?.id || null,
      })
      if (res.data?.data) {
        setMessages(prev => [...prev, res.data.data])
        lastMsgIdRef.current = res.data.data.id
      }
      setNewMsg('')
      setReplyTo(null)
      scrollToBottom()
    } catch (e) {
      console.error('Send failed', e)
    } finally {
      setSending(false)
    }
  }

  // ── Channel CRUD (Admin) ──
  async function handleSaveChannel(e) {
    e.preventDefault()
    if (!channelForm.label.trim()) return
    try {
      if (editingChannel) {
        await apiClient.patch(`/team-chat/channels/${editingChannel.id}`, channelForm)
      } else {
        await apiClient.post('/team-chat/channels', channelForm)
      }
      setShowChannelModal(false)
      setEditingChannel(null)
      setChannelForm({ label: '', icon: '💬', description: '' })
      fetchChannels()
    } catch (e) {
      console.error('Channel save failed', e)
    }
  }

  async function handleDeleteChannel(ch) {
    if (!window.confirm(`Delete channel "${ch.label}"? All messages will be lost.`)) return
    try {
      await apiClient.delete(`/team-chat/channels/${ch.id}`)
      if (activeChannel?.id === ch.id) setActiveChannel(null)
      fetchChannels()
    } catch (e) {
      console.error('Channel delete failed', e)
    }
  }

  function openEditChannel(ch) {
    setEditingChannel(ch)
    setChannelForm({ label: ch.label, icon: ch.icon, description: ch.description || '' })
    setShowChannelModal(true)
  }

  function openNewChannel() {
    setEditingChannel(null)
    setChannelForm({ label: '', icon: '💬', description: '' })
    setShowChannelModal(true)
  }

  // ── Styles ──
  const containerStyle = {
    display: 'flex', height: 'calc(100vh - 80px)', gap: 0,
    background: '#f1f5f9', borderRadius: 16, overflow: 'hidden',
    border: '1px solid #e2e8f0',
  }

  const channelBarStyle = {
    width: 280, minWidth: 280, background: '#ffffff',
    borderRight: '1px solid #e2e8f0', display: 'flex',
    flexDirection: 'column', overflow: 'hidden',
  }

  const chatPanelStyle = {
    flex: 1, display: 'flex', flexDirection: 'column',
    background: '#f8fafc',
  }

  return (
    <div id="page-team-chat" className="page active">
      <div style={containerStyle}>

        {/* ── Left: Channel List ── */}
        <div style={channelBarStyle}>
          <div style={{
            padding: '20px 16px 12px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>💬 Team Chat</div>
            {isAdmin && (
              <button
                onClick={openNewChannel}
                style={{
                  background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe',
                  borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700,
                  cursor: 'pointer',
                }}
              >+ Channel</button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {loadingChannels ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8', fontSize: 12 }}>Loading...</div>
            ) : channels.map(ch => (
              <div
                key={ch.id}
                onClick={() => setActiveChannel(ch)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', cursor: 'pointer',
                  background: activeChannel?.id === ch.id ? '#eff6ff' : 'transparent',
                  borderLeft: activeChannel?.id === ch.id ? '3px solid #2563eb' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 18 }}>{ch.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ch.label}</div>
                  {ch.last_message && (
                    <div style={{ fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ch.last_message.message?.substring(0, 40)}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{ch.messages_count || ''}</span>
                {isAdmin && !ch.is_default && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={(e) => { e.stopPropagation(); openEditChannel(ch) }}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 10, color: '#2563eb' }}>✏️</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteChannel(ch) }}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 10, color: '#dc2626' }}>🗑</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Chat Panel ── */}
        <div style={chatPanelStyle}>
          {error ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 48 }}>⚠️</span>
              <div style={{ color: '#ef4444', fontWeight: 600 }}>Connection Failed</div>
              <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', maxWidth: 200 }}>
                Could not connect to the chat server. This might be due to missing database tables or server downtime.
              </p>
              <button onClick={() => { setError(false); setLoadingChannels(true); fetchChannels(); }}
                className="btn btn-xs btn-ghost" style={{ marginTop: 8 }}>Try Again</button>
            </div>
          ) : !activeChannel ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 48 }}>💬</span>
              <p style={{ color: '#94a3b8', fontSize: 14 }}>Select a channel to start chatting</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '14px 20px', borderBottom: '1px solid #e2e8f0',
                background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{activeChannel.icon} {activeChannel.label}</div>
                  {activeChannel.description && (
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{activeChannel.description}</div>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{messages.length} messages</div>
              </div>

              {/* Messages Feed */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {loadingMessages ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <span style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>🫧</span>
                    <p style={{ color: '#94a3b8', fontSize: 13 }}>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.user.id === user?.id
                    const prevMsg = idx > 0 ? messages[idx - 1] : null
                    const showAvatar = !prevMsg || prevMsg.user.id !== msg.user.id

                    return (
                      <div key={msg.id} style={{
                        display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row',
                        gap: 8, alignItems: 'flex-end',
                        marginTop: showAvatar ? 12 : 2,
                      }}>
                        {/* Avatar */}
                        {showAvatar ? (
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: isMe ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
                            color: isMe ? '#fff' : '#475569',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 800, flexShrink: 0,
                          }}>
                            {msg.user.initials}
                          </div>
                        ) : (
                          <div style={{ width: 32, flexShrink: 0 }} />
                        )}

                        {/* Bubble */}
                        <div
                          onClick={() => setReplyTo(msg)}
                          style={{
                            maxWidth: '65%', padding: '8px 14px',
                            background: isMe ? '#2563eb' : '#ffffff',
                            color: isMe ? '#ffffff' : '#1e293b',
                            borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            fontSize: 13, lineHeight: 1.5, cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            border: isMe ? 'none' : '1px solid #f1f5f9',
                            position: 'relative',
                          }}
                        >
                          {/* Reply preview */}
                          {msg.reply_to && (
                            <div style={{
                              background: isMe ? 'rgba(255,255,255,0.15)' : '#f8fafc',
                              borderLeft: `3px solid ${isMe ? 'rgba(255,255,255,0.5)' : '#2563eb'}`,
                              padding: '4px 8px', borderRadius: 6, marginBottom: 6, fontSize: 11,
                              color: isMe ? 'rgba(255,255,255,0.8)' : '#64748b',
                            }}>
                              <span style={{ fontWeight: 700 }}>{msg.reply_to.user}</span>
                              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.reply_to.message}</div>
                            </div>
                          )}

                          {/* Sender name */}
                          {showAvatar && !isMe && (
                            <div style={{ fontWeight: 700, fontSize: 11, color: '#2563eb', marginBottom: 2 }}>{msg.user.name}
                              <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: 6, fontSize: 10 }}>{msg.user.role}</span>
                            </div>
                          )}

                          {msg.message}

                          {/* Time */}
                          <div style={{
                            fontSize: 9, marginTop: 4, textAlign: 'right',
                            color: isMe ? 'rgba(255,255,255,0.6)' : '#94a3b8',
                          }}>
                            {msg.time_ago}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply bar */}
              {replyTo && (
                <div style={{
                  padding: '8px 20px', background: '#eff6ff', borderTop: '1px solid #dbeafe',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ fontSize: 12, color: '#2563eb' }}>
                    <span style={{ fontWeight: 700 }}>↩ Replying to {replyTo.user.name}:</span>{' '}
                    <span style={{ color: '#475569' }}>{replyTo.message.substring(0, 60)}</span>
                  </div>
                  <button onClick={() => setReplyTo(null)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#64748b' }}>✕</button>
                </div>
              )}

              {/* Input bar */}
              <form onSubmit={handleSend} style={{
                padding: '12px 20px', borderTop: '1px solid #e2e8f0', background: '#ffffff',
                display: 'flex', gap: 10, alignItems: 'center',
              }}>
                <input
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: 24,
                    border: '1.5px solid #e2e8f0', fontSize: 13,
                    outline: 'none', background: '#f8fafc',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={sending || !newMsg.trim()}
                  style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: newMsg.trim() ? '#2563eb' : '#e2e8f0',
                    color: '#fff', border: 'none', cursor: newMsg.trim() ? 'pointer' : 'default',
                    fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  ➤
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ── Channel Create/Edit Modal ── */}
      {showChannelModal && (
        <div className="modal-overlay open" onClick={() => setShowChannelModal(false)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editingChannel ? '✏️ Edit Channel' : '➕ Create Channel'}</div>
              <button className="modal-close" onClick={() => setShowChannelModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveChannel}>
                <div className="form-group">
                  <div className="form-label">Channel Name <span className="req">*</span></div>
                  <input className="form-input" value={channelForm.label}
                    onChange={e => setChannelForm({ ...channelForm, label: e.target.value })}
                    placeholder="e.g. Sales Strategy" />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <div className="form-label">Icon Emoji</div>
                    <input className="form-input" value={channelForm.icon}
                      onChange={e => setChannelForm({ ...channelForm, icon: e.target.value })}
                      placeholder="💬" style={{ textAlign: 'center', fontSize: 20 }} />
                  </div>
                  <div className="form-group">
                    <div className="form-label">Description</div>
                    <input className="form-input" value={channelForm.description}
                      onChange={e => setChannelForm({ ...channelForm, description: e.target.value })}
                      placeholder="What's this channel about?" />
                  </div>
                </div>
                <div className="modal-footer" style={{ padding: 0, paddingTop: 16, border: 'none' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowChannelModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingChannel ? 'Update Channel' : 'Create Channel'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
