import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', padding: '2rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          🌱 eFlora
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.9 }}>
          Nursery Marketplace
        </p>
        <p style={{ fontSize: '1rem', marginBottom: '2rem', opacity: 0.8 }}>
          Verified B2B-B2C platform connecting plant nurseries with customers
        </p>

        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          backdropFilter: 'blur(10px)'
        }}>
          <button
            onClick={() => setCount((count) => count + 1)}
            style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              padding: '1rem 2rem',
              fontSize: '1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginBottom: '1rem',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Count: {count}
          </button>
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            Frontend is running successfully!
          </p>
        </div>

        <div style={{
          textAlign: 'left',
          background: 'rgba(0,0,0,0.2)',
          padding: '1.5rem',
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>🚀 Quick Start:</h3>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
            <li>✅ Frontend: Running on port 3000</li>
            <li>🔄 Backend: Start with <code style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px'
            }}>npm run dev</code></li>
            <li>🗄️ Database: PostgreSQL on port 5432</li>
            <li>📚 Check README.md for full setup</li>
          </ul>
        </div>

        <p style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.6 }}>
          Built with React + TypeScript + Vite
        </p>
      </div>
    </div>
  )
}

export default App
