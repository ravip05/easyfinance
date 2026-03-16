import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '../context/ToastContext'

export default function LMS() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('library') // 'library', 'materials', 'mycourses'
  const [courses, setCourses] = useState([])
  const [materials, setMaterials] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('all')

  useEffect(() => {
    fetchLMSData()
  }, [])

  const fetchLMSData = async () => {
    setLoading(true)
    try {
      // Mock data if migration failed
      const courseRes = await axios.get('/api/lms/courses').catch(() => ({
        data: { data: [
          { id: 1, title: 'Personal Loan Mastery', category: 'loans', level: 'beginner', duration_minutes: 45, lesson_count: 5, thumbnail: '💰', progress: 0 },
          { id: 2, title: 'Compliance & Ethics 2024', category: 'compliance', level: 'intermediate', duration_minutes: 30, lesson_count: 3, thumbnail: '⚖️', progress: 100 },
          { id: 3, title: 'Elite Sales Techniques', category: 'sales', level: 'advanced', duration_minutes: 60, lesson_count: 8, thumbnail: '🪜', progress: 45 },
          { id: 4, title: 'Insurance Fundamentals', category: 'insurance', level: 'beginner', duration_minutes: 90, lesson_count: 12, thumbnail: '🏥', progress: 0 }
        ]}
      }))
      const materialRes = await axios.get('/api/lms/materials').catch(() => ({
        data: { data: [
          { id: 1, title: 'Loan Product Guide.pdf', category: 'Product', type: 'PDF', size: '2.4MB' },
          { id: 2, title: 'Commission Structure Q2.xlsx', category: 'Finance', type: 'XLSX', size: '1.2MB' },
          { id: 3, title: 'Sales Presentation Prep.pptx', category: 'Sales', type: 'PPTX', size: '5.8MB' }
        ]}
      }))
      setCourses(courseRes.data.data)
      setMaterials(materialRes.data.data)
    } catch (err) {
      toast('error', 'Failed to load LMS content')
    } finally {
      setLoading(false)
    }
  }

  const categoryOptions = [
    { id: 'all', label: 'All Topics' },
    { id: 'loans', label: 'Loans' },
    { id: 'insurance', label: 'Insurance' },
    { id: 'sales', label: 'Sales' },
    { id: 'compliance', label: 'Compliance' }
  ]

  const filteredCourses = courses.filter(c => filterCategory === 'all' || c.category === filterCategory)

  if (selectedCourse) {
    return <CoursePlayer course={selectedCourse} onBack={() => setSelectedCourse(null)} />
  }

  return (
    <div id="page-lms" className="page active">
      <div className="card-header">
        <div>
          <h2 className="card-title">🎓 Training & LMS</h2>
          <p className="card-sub">Enhance your skills with our curated learning paths.</p>
        </div>
        <div className="tabs" style={{ marginBottom: 0 }}>
          <div className={`tab ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>Library</div>
          <div className={`tab ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>Materials</div>
          <div className={`tab ${activeTab === 'mycourses' ? 'active' : ''}`} onClick={() => setActiveTab('mycourses')}>My Learning</div>
        </div>
      </div>

      {activeTab === 'library' && (
        <>
          <div className="section-gap" style={{ marginTop: 16 }}>
            <div className="filter-bar">
              {categoryOptions.map(cat => (
                <div 
                  key={cat.id} 
                  className={`chip ${filterCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setFilterCategory(cat.id)}
                >
                  {cat.label}
                </div>
              ))}
            </div>
          </div>

          <div className="lms-grid">
            {filteredCourses.map(course => (
              <div key={course.id} className="course-card" onClick={() => setSelectedCourse(course)}>
                <div className="course-thumb" style={{ backgroundColor: 'var(--bg2)', color: 'var(--accent)' }}>
                  {course.thumbnail}
                </div>
                <div className="course-body">
                  <div className="course-title">{course.title}</div>
                  <div className="course-meta">
                    <span>⏱ {course.duration_minutes}m</span>
                    <span>📚 {course.lesson_count} Lessons</span>
                  </div>
                  {course.progress > 0 && (
                    <div className="course-progress">
                      <div className="course-progress-fill" style={{ width: `${course.progress}%`, backgroundColor: 'var(--accent)' }} />
                    </div>
                  )}
                  <div className="course-footer">
                    <span className={`course-badge cb-${course.level}`}>{course.level.toUpperCase()}</span>
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>{course.progress}% done</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'materials' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
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
                {materials.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.title}</strong></td>
                    <td><span className="badge">{m.category}</span></td>
                    <td><span style={{ fontSize: 11, fontWeight: 700 }}>{m.type}</span></td>
                    <td>{m.size}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm">⬇ Download</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'mycourses' && (
        <div className="empty">
          <div className="empty-icon">📂</div>
          <div className="empty-text">Courses you've started will appear here.</div>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setActiveTab('library')}>Browse Library</button>
        </div>
      )}
    </div>
  )
}

function CoursePlayer({ course, onBack }) {
  const [activeLesson, setActiveLesson] = useState(1)
  const lessons = [
    { id: 1, title: 'Introduction to ' + course.category, type: 'video', duration: '5m' },
    { id: 2, title: 'Key Product Features', type: 'pdf', duration: '12m' },
    { id: 3, title: 'Assessment Quiz', type: 'quiz', duration: '10m' }
  ]

  return (
    <div className="page active">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
          <div>
            <h2 className="card-title">{course.title}</h2>
            <p className="card-sub">Lesson {activeLesson} of {lessons.length}</p>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1fr 300px' }}>
        <div className="card" style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
          <div style={{ color: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>▶️</div>
            <p>Video Player Placeholder</p>
          </div>
        </div>
        
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header" style={{ padding: '12px 16px' }}>
            <h3 className="card-title" style={{ fontSize: 13 }}>Course Lessons</h3>
          </div>
          <div className="lesson-list">
            {lessons.map(l => (
              <div 
                key={l.id} 
                className={`lesson-item ${activeLesson === l.id ? 'active' : ''}`}
                onClick={() => setActiveLesson(l.id)}
                style={{ backgroundColor: activeLesson === l.id ? 'var(--accent-light)' : 'transparent' }}
              >
                <div className={`lesson-icon li-${l.type}`}>{l.type === 'video' ? '🎬' : l.type === 'pdf' ? '📄' : '❓'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{l.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>{l.duration}</div>
                </div>
                <div className="lesson-done ld-pending">○</div>
              </div>
            ))}
          </div>
          <div style={{ padding: 16 }}>
            <button className="btn btn-primary" style={{ width: '100%' }}>Next Lesson</button>
          </div>
        </div>
      </div>
    </div>
  )
}
