import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom';
import { Orbit } from 'lucide-react';
import { ThemeSelect } from './components/ThemeSelect';
import { Entry } from './pages/Entry';
import { Dashboard } from './pages/Dashboard';
import { lazy, Suspense } from 'react';
const TeachingLab = lazy(() => import('./pages/TeachingLab').then(module => ({ default: module.TeachingLab })));
import { useAuth } from './hooks/useAuth';
import { Learn } from './pages/Learn';
import { AuthProvider } from './hooks/useAuth';
import { AccountMenu } from './components/AccountMenu';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import './index.css';
function App() { const { user } = useAuth(); return <><a className="skip-link" href="#main">Skip to content</a><header className="header"><Link to="/" className="brand" aria-label="Parallax home"><Orbit aria-hidden="true" size={29}/>parallax<span className="brand-dot">.</span></Link><nav aria-label="Main navigation">{user ? <NavLink to="/dashboard">Dashboard</NavLink> : <NavLink to="/" end>Overview</NavLink>}<NavLink to="/learn">The course</NavLink></nav><div className="header-controls"><ThemeSelect/><AccountMenu/></div></header><Routes><Route path="/" element={<Entry/>}/><Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/><Route path="/teaching-lab" element={<ProtectedRoute><Suspense fallback={<main id="main" className="placeholder" role="status">Opening the teaching lab…</main>}><TeachingLab/></Suspense></ProtectedRoute>}/><Route path="/login" element={<Login/>}/><Route path="/learn" element={<ProtectedRoute><Learn/></ProtectedRoute>}/><Route path="*" element={<main id="main" className="placeholder"><p className="eyebrow">404 / OFF THE MAP</p><h1>Uncharted territory.</h1><p>This page doesn’t exist.</p><Link to="/">Return home</Link></main>}/></Routes><footer><Link to="/" className="footer-brand">parallax.</Link><span>A different perspective changes everything.</span><span>Built for curiosity.</span></footer></>; }
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><AuthProvider><App/></AuthProvider></BrowserRouter></React.StrictMode>);
