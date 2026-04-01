import React, { useState, useEffect, useRef } from 'react'
import apiClient from '../api/client'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page: { fontFamily: "'Inter', sans-serif" },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 },
  statCard: (bg, color) => ({ background: `linear-gradient(135deg, ${bg} 0%, ${color} 100%)`, borderRadius: 16, padding: '22px 24px', color: '#fff', position: 'relative', overflow: 'hidden' }),
  statLabel: { fontSize: 12, fontWeight: 500, opacity: 0.85, marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: 800, lineHeight: 1.1 },
  statSub: { fontSize: 11, opacity: 0.7, marginTop: 4 },
  tabRow: { display: 'flex', gap: 2, background: '#e8edf5', borderRadius: 10, padding: 4, marginBottom: 20, flexWrap: 'wrap' },
  tab: (active) => ({ padding: '8px 18px', borderRadius: 7, fontSize: 13, fontWeight: active ? 600 : 500, cursor: 'pointer', color: active ? '#2563eb' : '#475569', background: active ? '#fff' : 'transparent', boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s', whiteSpace: 'nowrap' }),
  searchRow: { display: 'flex', gap: 10, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' },
  searchInput: { flex: 1, minWidth: 200, padding: '9px 14px 9px 36px', border: '1px solid #e2e8f0', borderRadius: 99, background: '#f0f4f9', fontSize: 13, outline: 'none', fontFamily: "'Inter',sans-serif", position: 'relative' },
  searchWrap: { flex: 1, minWidth: 200, position: 'relative' },
  chip: (active) => ({ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${active ? '#2563eb' : '#e2e8f0'}`, background: active ? '#eff6ff' : '#fff', color: active ? '#2563eb' : '#475569', transition: 'all 0.15s', whiteSpace: 'nowrap' }),
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  courseCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  courseThumb: (color) => ({ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, background: color || '#dbeafe' }),
  courseBody: { padding: 14 },
  courseTitle: { fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 4, lineHeight: 1.3 },
  courseMeta: { fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 },
  progressBar: { height: 5, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: (pct) => ({ height: '100%', width: `${pct}%`, borderRadius: 3, background: '#2563eb', transition: 'width 0.6s' }),
  badge: (level) => {
    const map = { beginner: { bg: '#ecfdf5', color: '#065f46' }, intermediate: { bg: '#eff6ff', color: '#1d4ed8' }, advanced: { bg: '#fef2f2', color: '#991b1b' } }
    const c = map[level] || map.beginner
    return { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: c.bg, color: c.color }
  },
  empty: { textAlign: 'center', padding: '48px 20px', color: '#94a3b8' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, fontWeight: 500 },
  // Modal
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' },
  modal: (maxW) => ({ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, width: '100%', maxWidth: maxW || 560, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }),
  modalHeader: { padding: '18px 22px 14px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, position: 'sticky', top: 0, background: '#fff', zIndex: 2 },
  modalTitle: { fontSize: 17, fontWeight: 700, fontFamily: "'Inter',sans-serif" },
  modalClose: { background: '#f0f4f9', border: '1px solid #e2e8f0', width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#475569', cursor: 'pointer', flexShrink: 0 },
  modalBody: { padding: '18px 22px' },
  modalFooter: { padding: '12px 22px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' },
  // Table
  tableWrap: { overflowX: 'auto' },
  // Lesson
  lessonItem: (active) => ({ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #e2e8f0', cursor: 'pointer', transition: 'background 0.12s', background: active ? '#eff6ff' : 'transparent' }),
  lessonIcon: (type) => {
    const map = { video: '#fef2f2', pdf: '#fff7ed', quiz: '#eff6ff', text: '#ecfdf5' }
    return { width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, background: map[type] || '#f1f5f9' }
  },
  lessonDone: (done) => ({ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0, marginLeft: 'auto', background: done ? '#ecfdf5' : '#f1f5f9', color: done ? '#059669' : '#94a3b8' }),
  // Player
  playerWrap: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 },
  playerContent: { background: '#000', borderRadius: 14, minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' },
  playerSidebar: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  playerNav: { padding: 16, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8 },
  // Quiz
  quizWrap: { maxWidth: 640, margin: '0 auto' },
  quizOption: (selected) => ({ padding: '14px 18px', borderRadius: 12, border: `2px solid ${selected ? '#2563eb' : '#e2e8f0'}`, background: selected ? '#eff6ff' : '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'all 0.15s', marginBottom: 10 }),
  // Cert
  certCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  certBadge: { width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #d97706, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 12px', color: '#fff' },
}

const ICON_MAP = { video: '🎬', pdf: '📄', quiz: '🧠', text: '📝' }
const CATEGORIES = [
  { id: 'all', label: 'All Topics' },
  { id: 'loans', label: 'Loans' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'sales', label: 'Sales' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'franchise', label: 'Franchise' },
]

export default function LMS() {
  const toast = useToast()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('courses')
  const [courses, setCourses] = useState([])
  const [materials, setMaterials] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [certificates, setCertificates] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

  // Sub-views
  const [selectedCourse, setSelectedCourse] = useState(null) // syllabus modal
  const [playerCourse, setPlayerCourse] = useState(null) // course player
  const [activeQuiz, setActiveQuiz] = useState(null) // quiz player

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [cRes, mRes, qRes, certRes, lbRes] = await Promise.all([
        apiClient.get('/lms/courses'),
        apiClient.get('/lms/materials'),
        apiClient.get('/lms/quizzes'),
        apiClient.get('/lms/certificates'),
        apiClient.get('/lms/leaderboard'),
      ])
      setCourses(cRes.data || [])
      setMaterials(mRes.data || [])
      setQuizzes(qRes.data || [])
      setCertificates(certRes.data || [])
      setLeaderboard(lbRes.data || [])
    } catch (e) {
      toast.error('Failed to load LMS content')
    } finally {
      setLoading(false)
    }
  }

  // Stats
  const totalCourses = courses.length
  const completedCourses = courses.filter(c => c.progress >= 100).length
  const enrolledCourses = courses.filter(c => c.enrolled).length
  const totalPoints = leaderboard.find(l => l.user_id === user?.id)?.points || 0

  // Filtered courses
  const filtered = courses.filter(c => {
    if (filterCategory !== 'all' && c.category !== filterCategory) return false
    if (filterStatus === 'enrolled' && !c.enrolled) return false
    if (filterStatus === 'completed' && c.progress < 100) return false
    if (filterStatus === 'in-progress' && (c.progress <= 0 || c.progress >= 100)) return false
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // ── Handlers ──────
  const handleEnrollAndPlay = async (course) => {
    try {
      await apiClient.post(`/lms/courses/${course.id}/enroll`)
      const detail = await apiClient.get(`/lms/courses/${course.id}`)
      setSelectedCourse(null)
      setPlayerCourse(detail.data)
      fetchAll()
    } catch (e) {
      toast.error('Failed to enroll')
    }
  }

  // ── Sub-view: Quiz Player ──
  if (activeQuiz) {
    return <QuizPlayer quiz={activeQuiz} onBack={() => { setActiveQuiz(null); fetchAll() }} />
  }

  // ── Sub-view: Course Player ──
  if (playerCourse) {
    return <CoursePlayer
      course={playerCourse}
      onBack={() => { setPlayerCourse(null); fetchAll() }}
      onStartQuiz={(quiz) => { setPlayerCourse(null); setActiveQuiz(quiz) }}
    />
  }

  const tabs = [
    { id: 'courses', label: '📚 My Courses' },
    { id: 'materials', label: '📄 Study Materials' },
    { id: 'quizzes', label: '🧠 Quizzes & Tests' },
    { id: 'certificates', label: '🏆 Certificates' },
  ]

  return (
    <div id="page-lms" style={s.page}>
      {/* ── Header ── */}
      <div className="card-header">
        <div>
          <h2 className="card-title">🎓 Training & LMS</h2>
          <p className="card-sub">Enhance your skills with our curated learning paths.</p>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={s.statsGrid}>
        <div style={s.statCard('#2563eb', '#3b82f6')}>
          <div style={s.statLabel}>Courses Completed</div>
          <div style={s.statValue}>{completedCourses} <span style={{ fontSize: 14, fontWeight: 500, opacity: 0.7 }}>/ {totalCourses}</span></div>
          <div style={s.statSub}>{totalCourses > 0 ? Math.round(completedCourses / totalCourses * 100) : 0}% completion rate</div>
        </div>
        <div style={s.statCard('#7c3aed', '#8b5cf6')}>
          <div style={s.statLabel}>Total Points</div>
          <div style={s.statValue}>{totalPoints} <span style={{ fontSize: 14 }}>pts</span></div>
          <div style={s.statSub}>From quizzes & lessons</div>
        </div>
        <div style={s.statCard('#059669', '#10b981')}>
          <div style={s.statLabel}>Enrolled Courses</div>
          <div style={s.statValue}>{enrolledCourses}</div>
          <div style={s.statSub}>{enrolledCourses - completedCourses} in progress</div>
        </div>
        <div style={s.statCard('#d97706', '#f59e0b')}>
          <div style={s.statLabel}>Certificates Earned</div>
          <div style={s.statValue}>{certificates.length}</div>
          <div style={s.statSub}>Keep learning!</div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={s.tabRow}>
        {tabs.map(t => (
          <div key={t.id} style={s.tab(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>{t.label}</div>
        ))}
      </div>

      {/* ── TAB: Courses ── */}
      {activeTab === 'courses' && (
        <>
          <div style={s.searchRow}>
            <div style={s.searchWrap}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, pointerEvents: 'none', opacity: 0.6 }}>🔍</span>
              <input style={s.searchInput} placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {CATEGORIES.map(cat => (
              <div key={cat.id} style={s.chip(filterCategory === cat.id)} onClick={() => setFilterCategory(cat.id)}>{cat.label}</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {[{ id: 'all', label: 'All' }, { id: 'enrolled', label: 'Enrolled' }, { id: 'in-progress', label: 'In Progress' }, { id: 'completed', label: 'Completed' }].map(st => (
              <div key={st.id} style={s.chip(filterStatus === st.id)} onClick={() => setFilterStatus(st.id)}>{st.label}</div>
            ))}
          </div>
          {loading ? (
            <div style={s.empty}><div className="empty-icon">⏳</div><div className="empty-text">Loading courses...</div></div>
          ) : filtered.length === 0 ? (
            <div style={s.empty}><div style={s.emptyIcon}>📂</div><div style={s.emptyText}>No courses found.</div></div>
          ) : (
            <div style={s.grid}>
              {filtered.map(course => (
                <div key={course.id} style={s.courseCard} onClick={() => setSelectedCourse(course)}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none' }}
                >
                  <div style={s.courseThumb(course.color_bg || '#dbeafe')}>{course.thumbnail || '🎓'}</div>
                  <div style={s.courseBody}>
                    <div style={s.courseTitle}>{course.title}</div>
                    <div style={s.courseMeta}>
                      <span>⏱ {course.duration_minutes || 0}m</span>
                      <span>📚 {course.lesson_count || 0} Lessons</span>
                    </div>
                    {course.progress > 0 && (
                      <div style={s.progressBar}><div style={s.progressFill(course.progress)} /></div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={s.badge(course.level || 'beginner')}>{(course.level || 'beginner').toUpperCase()}</span>
                      {course.progress >= 100
                        ? <span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>✅ Done</span>
                        : <span style={{ fontSize: 10, color: '#94a3b8' }}>{course.progress || 0}% done</span>
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── TAB: Materials ── */}
      {activeTab === 'materials' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={s.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Resource Name</th>
                  <th>Category</th>
                  <th>Format</th>
                  <th>Size</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {materials.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 32 }}><div style={s.empty}><div style={s.emptyText}>No materials available yet.</div></div></td></tr>
                ) : materials.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.title}</strong></td>
                    <td><span className="badge">{m.category}</span></td>
                    <td><span style={{ fontSize: 11, fontWeight: 700 }}>{m.type}</span></td>
                    <td>{m.file_size || 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {m.file_path && (
                          <a href={`${apiClient.defaults.baseURL?.replace('/api','')}/storage/${m.file_path}`} target="_blank" rel="noreferrer"
                            className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>👁 View</a>
                        )}
                        {m.file_path && (
                          <a href={`${apiClient.defaults.baseURL?.replace('/api','')}/storage/${m.file_path}`} download
                            className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>⬇ Download</a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: Quizzes ── */}
      {activeTab === 'quizzes' && (
        <div>
          <div style={s.grid}>
            {quizzes.length === 0 ? (
              <div style={{ ...s.empty, gridColumn: '1 / -1' }}><div style={s.emptyIcon}>🧠</div><div style={s.emptyText}>No quizzes available yet.</div></div>
            ) : quizzes.map(q => (
              <div key={q.id} className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{q.title}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                  {q.questions_count || 0} Questions · {q.time_limit_minutes || 10} min · Pass: {q.passing_score || 70}%
                </div>
                {q.attempted && (
                  <div style={{ fontSize: 12, marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, color: q.best_score >= (q.passing_score || 70) ? '#059669' : '#dc2626' }}>Best: {q.best_score}%</span>
                    {q.best_score >= (q.passing_score || 70) && <span style={{ marginLeft: 8, color: '#059669' }}>✅ Passed</span>}
                  </div>
                )}
                <button className="btn btn-primary btn-sm" style={{ width: '100%' }}
                  onClick={() => setActiveQuiz(q)}>{q.attempted ? 'Retake Quiz' : 'Start Quiz'}</button>
              </div>
            ))}
          </div>

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div className="card" style={{ marginTop: 24 }}>
              <div className="card-header"><h3 className="card-title">🏆 Quiz Leaderboard</h3></div>
              <div>
                {leaderboard.map((entry, i) => (
                  <div key={entry.user_id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ width: 28, textAlign: 'center', fontSize: 16 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{entry.user?.name || 'User'}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{entry.quizzes_taken} quizzes · Avg {Math.round(entry.avg_score || 0)}%</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#2563eb' }}>{entry.points || 0} pts</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Certificates ── */}
      {activeTab === 'certificates' && (
        <div>
          {certificates.length === 0 ? (
            <div style={s.empty}>
              <div style={s.emptyIcon}>🏆</div>
              <div style={s.emptyText}>No certificates earned yet.</div>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>Complete courses and pass quizzes to earn certificates!</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setActiveTab('courses')}>Browse Courses</button>
            </div>
          ) : (
            <div style={s.grid}>
              {certificates.map(cert => (
                <div key={cert.id} style={s.certCard}>
                  <div style={s.certBadge}>🏆</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{cert.course?.title || 'Course'}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Score: {cert.score}% · {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : ''}</div>
                  <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}
                    onClick={() => {
                      const win = window.open('', '_blank')
                      win.document.write(`<html><head><title>Certificate</title><style>body{font-family:'Inter',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc}
                        .cert{border:3px solid #d97706;border-radius:20px;padding:60px;max-width:700px;text-align:center;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,0.1)}</style></head>
                        <body><div class="cert"><div style="font-size:48px;margin-bottom:20px">🏆</div>
                        <h1 style="font-size:28px;color:#1e293b;margin-bottom:8px">Certificate of Completion</h1>
                        <p style="color:#64748b;margin-bottom:24px">This certifies that</p>
                        <h2 style="font-size:24px;color:#2563eb;margin-bottom:8px">${user?.name || 'Student'}</h2>
                        <p style="color:#64748b;margin-bottom:24px">has successfully completed</p>
                        <h3 style="font-size:20px;color:#1e293b;margin-bottom:16px">${cert.course?.title || 'Course'}</h3>
                        <p style="color:#059669;font-weight:700;font-size:18px;margin-bottom:24px">Score: ${cert.score}%</p>
                        <p style="color:#94a3b8;font-size:12px">${cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : ''}</p>
                        <button onclick="window.print()" style="margin-top:24px;padding:10px 24px;border-radius:8px;border:none;background:#2563eb;color:#fff;font-weight:700;cursor:pointer">🖨 Print / Save PDF</button>
                        </div></body></html>`)
                    }}
                  >📜 View & Download</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Syllabus Modal ── */}
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onStart={() => handleEnrollAndPlay(selectedCourse)}
        />
      )}
    </div>
  )
}


// ══════════════════════════════════════════════════════════════════════════════
//  CourseDetailModal — Syllabus preview before entering player
// ══════════════════════════════════════════════════════════════════════════════
function CourseDetailModal({ course, onClose, onStart }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get(`/lms/courses/${course.id}`).then(r => { setDetail(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [course.id])

  const lessons = detail?.lessons || []

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal(600)} onClick={e => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <div style={s.modalTitle}>{course.thumbnail || '🎓'} {course.title}</div>
          <button style={s.modalClose} onClick={onClose}>✕</button>
        </div>
        <div style={s.modalBody}>
          {/* Meta */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 12, color: '#64748b' }}>
            <span>📚 {lessons.length} Lessons</span>
            <span>⏱ {course.duration_minutes || 0}m</span>
            <span style={s.badge(course.level)}>{(course.level || 'beginner').toUpperCase()}</span>
          </div>
          {/* Progress */}
          {course.progress > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>Progress</span>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>{course.progress}%</span>
              </div>
              <div style={s.progressBar}><div style={s.progressFill(course.progress)} /></div>
            </div>
          )}
          {/* Lessons */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 32 }}>Loading syllabus...</div>
          ) : (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
              {lessons.map((l, i) => (
                <div key={l.id} style={s.lessonItem(false)}>
                  <div style={s.lessonIcon(l.type)}>{ICON_MAP[l.type] || '📝'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{l.title}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{l.duration_minutes || 0}m · {l.type}</div>
                  </div>
                  <div style={s.lessonDone(i < Math.floor((course.progress || 0) / 100 * lessons.length))}>{i < Math.floor((course.progress || 0) / 100 * lessons.length) ? '✓' : '○'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={s.modalFooter}>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={onStart}>
            {course.progress > 0 ? '▶ Continue Course' : '▶ Start Course'}
          </button>
        </div>
      </div>
    </div>
  )
}


// ══════════════════════════════════════════════════════════════════════════════
//  CoursePlayer — Dual-pane lesson viewer
// ══════════════════════════════════════════════════════════════════════════════
function CoursePlayer({ course, onBack, onStartQuiz }) {
  const toast = useToast()
  const lessons = course.lessons || []
  const [activeLessonIdx, setActiveLessonIdx] = useState(0)
  const [completedLessons, setCompletedLessons] = useState(new Set())
  const [saving, setSaving] = useState(false)

  const lesson = lessons[activeLessonIdx]

  const markComplete = async () => {
    setSaving(true)
    const newCompleted = new Set(completedLessons)
    newCompleted.add(lesson.id)
    setCompletedLessons(newCompleted)

    const progressPct = Math.round(newCompleted.size / lessons.length * 100)
    try {
      await apiClient.post(`/lms/courses/${course.id}/progress`, {
        progress: progressPct,
        last_lesson_id: lesson.id,
      })
      toast.success(`Lesson completed! (${progressPct}%)`)
      // Auto-advance
      if (activeLessonIdx < lessons.length - 1) {
        setActiveLessonIdx(activeLessonIdx + 1)
      }
    } catch (e) {
      toast.error('Failed to save progress')
    } finally {
      setSaving(false)
    }
  }

  if (!lesson) {
    return (
      <div style={{ padding: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back to Library</button>
        <div style={s.empty}><div style={s.emptyIcon}>📭</div><div style={s.emptyText}>This course has no lessons yet.</div></div>
      </div>
    )
  }

  const renderContent = () => {
    if (lesson.type === 'video') {
      if (lesson.video_url) {
        // YouTube / Vimeo embed
        const embedUrl = lesson.video_url.includes('youtube')
          ? lesson.video_url.replace('watch?v=', 'embed/')
          : lesson.video_url.includes('vimeo')
            ? lesson.video_url.replace('vimeo.com/', 'player.vimeo.com/video/')
            : lesson.video_url
        return <iframe src={embedUrl} style={{ width: '100%', height: '100%', border: 'none', minHeight: 400, borderRadius: 14 }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={lesson.title} />
      }
      return (
        <div style={{ color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🎬</div>
          <p style={{ fontSize: 14, opacity: 0.7 }}>Video: {lesson.title}</p>
          <p style={{ fontSize: 12, opacity: 0.5 }}>Content will be displayed here once uploaded.</p>
        </div>
      )
    }
    if (lesson.type === 'pdf') {
      if (lesson.file_path) {
        return <iframe src={`${apiClient.defaults.baseURL?.replace('/api','')}/storage/${lesson.file_path}`} style={{ width: '100%', height: '100%', border: 'none', minHeight: 400, borderRadius: 14 }} title={lesson.title} />
      }
      return (
        <div style={{ color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>📄</div>
          <p style={{ fontSize: 14, opacity: 0.7 }}>PDF: {lesson.title}</p>
        </div>
      )
    }
    if (lesson.type === 'quiz') {
      return (
        <div style={{ color: '#fff', textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🧠</div>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Final Assessment</p>
          <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 24 }}>Test your knowledge from this course.</p>
          <button className="btn btn-primary" onClick={() => {
            // Find quiz for this course
            onStartQuiz({ course_id: course.id, title: `${course.title} Quiz` })
          }}>Start Quiz →</button>
        </div>
      )
    }
    // text
    return (
      <div style={{ background: '#fff', padding: 32, borderRadius: 14, width: '100%', height: '100%', overflowY: 'auto', minHeight: 400 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{lesson.title}</h3>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: '#475569' }}>{lesson.content || 'Lesson content will appear here.'}</div>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div className="card-header" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
          <div>
            <h2 className="card-title">{course.title}</h2>
            <p className="card-sub">Lesson {activeLessonIdx + 1} of {lessons.length}</p>
          </div>
        </div>
      </div>

      {/* Player Layout */}
      <div style={s.playerWrap}>
        {/* Content Area */}
        <div style={s.playerContent}>{renderContent()}</div>

        {/* Sidebar */}
        <div style={s.playerSidebar}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700 }}>Course Lessons</h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {lessons.map((l, i) => (
              <div key={l.id} style={s.lessonItem(activeLessonIdx === i)} onClick={() => setActiveLessonIdx(i)}>
                <div style={s.lessonIcon(l.type)}>{ICON_MAP[l.type] || '📝'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{l.title}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{l.duration_minutes || 0}m</div>
                </div>
                <div style={s.lessonDone(completedLessons.has(l.id))}>{completedLessons.has(l.id) ? '✓' : '○'}</div>
              </div>
            ))}
          </div>
          <div style={s.playerNav}>
            <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} disabled={activeLessonIdx === 0}
              onClick={() => setActiveLessonIdx(activeLessonIdx - 1)}>← Prev</button>
            {!completedLessons.has(lesson?.id) && lesson?.type !== 'quiz' && (
              <button className="btn btn-success btn-sm" style={{ flex: 2 }} disabled={saving}
                onClick={markComplete}>{saving ? 'Saving...' : '✓ Mark Complete'}</button>
            )}
            <button className="btn btn-primary btn-sm" style={{ flex: 1 }} disabled={activeLessonIdx === lessons.length - 1}
              onClick={() => setActiveLessonIdx(activeLessonIdx + 1)}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  )
}


// ══════════════════════════════════════════════════════════════════════════════
//  QuizPlayer — Interactive assessment engine
// ══════════════════════════════════════════════════════════════════════════════
function QuizPlayer({ quiz, onBack }) {
  const toast = useToast()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [timeLeft, setTimeLeft] = useState((quiz.time_limit_minutes || 10) * 60)
  const timerRef = useRef(null)

  // Fetch quiz detail with questions
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // If quiz has an ID, get its questions via the quizzes list
        const res = await apiClient.get('/lms/quizzes')
        const found = (res.data || []).find(q => q.id === quiz.id)
        if (found) {
          // Fetch the course detail to get quiz questions
          const qRes = await apiClient.get(`/lms/courses/${found.course_id || quiz.course_id}`)
          // For now, construct questions from the quiz data
        }
        // Use questions from the quiz object if available, otherwise set sample
        setQuestions(quiz.questions || [])
        setLoading(false)
      } catch (e) {
        setLoading(false)
      }
    }
    fetchQuiz()
  }, [quiz])

  // Timer
  useEffect(() => {
    if (result) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [result]) // eslint-disable-line

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const handleSubmit = async () => {
    clearInterval(timerRef.current)
    setSubmitting(true)
    try {
      const res = await apiClient.post(`/lms/quizzes/${quiz.id}/submit`, {
        answers,
        time_taken: (quiz.time_limit_minutes || 10) * 60 - timeLeft,
      })
      setResult(res.data)
      toast.success(`Quiz submitted! Score: ${res.data.score}%`)
    } catch (e) {
      toast.error('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  // Result screen
  if (result) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ ...s.quizWrap, textAlign: 'center', paddingTop: 40 }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>{result.passed ? '🎉' : '😔'}</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            {result.passed ? 'Congratulations!' : 'Better luck next time!'}
          </h2>
          <div style={{ fontSize: 48, fontWeight: 800, color: result.passed ? '#059669' : '#dc2626', marginBottom: 8 }}>{result.score}%</div>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
            {result.correct} of {result.total} correct
            {result.passed ? ' · Certificate earned! 🏆' : ` · Need ${quiz.passing_score || 70}% to pass`}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={onBack}>← Back to LMS</button>
            {!result.passed && <button className="btn btn-primary" onClick={() => { setResult(null); setAnswers({}); setCurrentQ(0); setTimeLeft((quiz.time_limit_minutes || 10) * 60) }}>Retry Quiz</button>}
          </div>
        </div>
      </div>
    )
  }

  if (loading || questions.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
        <div style={{ ...s.empty, paddingTop: 60 }}>
          <div style={s.emptyIcon}>🧠</div>
          <div style={s.emptyText}>{loading ? 'Loading quiz...' : 'No questions available for this quiz.'}</div>
          {!loading && <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={onBack}>Go Back</button>}
        </div>
      </div>
    )
  }

  const q = questions[currentQ]
  const options = q?.options || {}

  return (
    <div style={{ padding: 24 }}>
      {/* Quiz Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>{quiz.title}</h2>
          <p style={{ fontSize: 12, color: '#64748b' }}>Question {currentQ + 1} of {questions.length}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: timeLeft < 60 ? '#dc2626' : '#2563eb', fontVariantNumeric: 'tabular-nums' }}>⏱ {formatTime(timeLeft)}</div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ ...s.progressBar, marginBottom: 24 }}><div style={s.progressFill((currentQ + 1) / questions.length * 100)} /></div>

      {/* Question */}
      <div style={s.quizWrap}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, lineHeight: 1.5 }}>{q.question}</div>
        {Object.entries(options).map(([key, value]) => (
          <div key={key} style={s.quizOption(answers[q.id] === key)} onClick={() => setAnswers({ ...answers, [q.id]: key })}>
            <span style={{ fontWeight: 700, marginRight: 12 }}>{key}.</span> {value}
          </div>
        ))}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button className="btn btn-ghost" disabled={currentQ === 0} onClick={() => setCurrentQ(currentQ - 1)}>← Previous</button>
          {currentQ === questions.length - 1 ? (
            <button className="btn btn-primary" disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Submitting...' : '✓ Submit Quiz'}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setCurrentQ(currentQ + 1)}>Next →</button>
          )}
        </div>
      </div>
    </div>
  )
}
