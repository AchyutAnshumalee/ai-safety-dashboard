import { useState } from 'react'
import './AISafetyDashboard.css'

type Severity = 'Low' | 'Medium' | 'High'
type SortOrder = 'newest' | 'oldest'

interface Incident {
  id: number
  title: string
  description: string
  severity: Severity
  reported_at: string
}

export default function AISafetyDashboard() {
  const initialIncidents: Incident[] = [
    {
      id: 1,
      title: 'Biased Recommendation Algorithm',
      description: 'Algorithm consistently favored certain demographics in job recommendations, leading to unfair outcomes for applicants from underrepresented groups.',
      severity: 'Medium',
      reported_at: '2025-03-15T10:00:00Z'
    },
    {
      id: 2,
      title: 'LLM Hallucination in Critical Info',
      description: 'LLM provided incorrect safety procedure information to healthcare workers, potentially endangering patient care in emergency situations.',
      severity: 'High',
      reported_at: '2025-04-01T14:30:00Z'
    },
    {
      id: 3,
      title: 'Minor Data Leak via Chatbot',
      description: 'Chatbot inadvertently exposed non-sensitive user metadata through API responses that weren\'t properly sanitized.',
      severity: 'Low',
      reported_at: '2025-03-20T09:15:00Z'
    }
  ]

  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents)
  const [severityFilter, setSeverityFilter] = useState<Severity | 'All'>('All')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [expandedIncident, setExpandedIncident] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    severity: 'Medium' as Severity
  })
  const [formErrors, setFormErrors] = useState({
    title: false,
    description: false
  })

  const filteredIncidents = incidents
    .filter(incident => severityFilter === 'All' || incident.severity === severityFilter)
    .sort((a, b) => {
      const dateA = new Date(a.reported_at).getTime()
      const dateB = new Date(b.reported_at).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewIncident(prev => ({
      ...prev,
      [name]: value
    }))
    if (name === 'title' || name === 'description') {
      setFormErrors(prev => ({
        ...prev,
        [name]: false
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = {
      title: newIncident.title.trim() === '',
      description: newIncident.description.trim() === ''
    }
    
    setFormErrors(errors)
    
    if (errors.title || errors.description) {
      return
    }
    
    const incident: Incident = {
      id: incidents.length + 1,
      title: newIncident.title,
      description: newIncident.description,
      severity: newIncident.severity,
      reported_at: new Date().toISOString()
    }
    
    setIncidents(prev => [...prev, incident])
    setNewIncident({
      title: '',
      description: '',
      severity: 'Medium'
    })
    setShowForm(false)
  }

  const toggleIncidentDetails = (id: number) => {
    setExpandedIncident(prev => prev === id ? null : id)
  }

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'High': return 'severity-high'
      case 'Medium': return 'severity-medium'
      case 'Low': return 'severity-low'
      default: return ''
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="dashboard-container">
      <h1>AI Safety Incident Dashboard</h1>
      
      <div className="controls">
        <div className="filter-controls">
          <label htmlFor="severity-filter">Filter by Severity:</label>
          <select 
            id="severity-filter"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as Severity | 'All')}
          >
            <option value="All">All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        
        <div className="sort-controls">
          <label htmlFor="sort-order">Sort by Date:</label>
          <select 
            id="sort-order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
        
        <button 
          className="toggle-form-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Report New Incident'}
        </button>
      </div>
      
      {showForm && (
        <div className="incident-form">
          <h2>Report New Incident</h2>
          <form onSubmit={handleSubmit}>
            <div className={`form-group ${formErrors.title ? 'error' : ''}`}>
              <label htmlFor="title">Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newIncident.title}
                onChange={handleInputChange}
                placeholder="Brief title of the incident"
              />
              {formErrors.title && <span className="error-message">Title is required</span>}
            </div>
            
            <div className={`form-group ${formErrors.description ? 'error' : ''}`}>
              <label htmlFor="description">Description*</label>
              <textarea
                id="description"
                name="description"
                value={newIncident.description}
                onChange={handleInputChange}
                placeholder="Detailed description of the incident"
                rows={4}
              />
              {formErrors.description && <span className="error-message">Description is required</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="severity">Severity</label>
              <select
                id="severity"
                name="severity"
                value={newIncident.severity}
                onChange={handleInputChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            
            <button type="submit" className="submit-button">Submit Incident</button>
          </form>
        </div>
      )}
      
      <div className="incidents-list">
        <h2>Incidents ({filteredIncidents.length})</h2>
        
        {filteredIncidents.length === 0 ? (
          <p className="no-results">No incidents match your filters.</p>
        ) : (
          <ul>
            {filteredIncidents.map(incident => (
              <li key={incident.id} className="incident-item">
                <div className="incident-header">
                  <div className="incident-meta">
                    <span className={`severity-badge ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                    <span className="incident-date">{formatDate(incident.reported_at)}</span>
                  </div>
                  <h3>{incident.title}</h3>
                  <button 
                    className="details-button"
                    onClick={() => toggleIncidentDetails(incident.id)}
                  >
                    {expandedIncident === incident.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
                
                {expandedIncident === incident.id && (
                  <div className="incident-details">
                    <p>{incident.description}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}