import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { SubmitArtifactPage } from './pages/SubmitArtifactPage'
import { ApprovalDecisionPage } from './pages/ApprovalDecisionPage'
import { ApprovalListPage } from './pages/ApprovalListPage'

export function HomePage () {
  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h2>Welcome</h2>
          <p className="subtle">Create an artifact version, then approve or reject it.</p>
        </div>
      </div>

      <div className="card stack">
        <div className="kpi">
          <span className="pill pillPending">⏳ Submit a version</span>
          <span className="pill pillApproved">✅ Approve</span>
          <span className="pill pillRejected">❌ Reject</span>
        </div>
        <div className="row">
          <NavLink to="/submit" className="btn btnPrimary">📤 Submit</NavLink>
          <NavLink to="/approvals" className="btn">👀 Approvals dashboard</NavLink>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="appShell">
        <header className="topBar">
          <div className="brand">
            <h1>ThatFridayFeeling</h1>
            <p>MVP approval flow</p>
          </div>
          <nav className="nav">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/submit">Submit</NavLink>
            <NavLink to="/approvals">Approvals</NavLink>
          </nav>
        </header>

        <Routes>
          <Route path="/submit" element={<SubmitArtifactPage />} />
          <Route path="/approvals" element={<ApprovalListPage />} />
          <Route path="/approve/:versionId" element={<ApprovalDecisionPage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
