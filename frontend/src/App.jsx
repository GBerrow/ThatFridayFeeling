import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SubmitArtifactPage } from './pages/SubmitArtifactPage'
import { ApprovalDecisionPage } from './pages/ApprovalDecisionPage'

export function HomePage () {
  return (
    <div>
      <h1>ThatFridayFeeling Apporval System</h1>
      <p>Choose an action</p>
      <ul>
        <li><a href="/submit">Submit Artifact Version</a></li>
        <li><a href="/approve/1">Approve Artifact Version (example)</a></li>
      </ul>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/submit" element={<SubmitArtifactPage />} />
        <Route path="/approve/:versionId" element={<ApprovalDecisionPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
