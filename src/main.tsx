import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom';
import { Orbit } from 'lucide-react';
import { ThemeSelect } from './components/ThemeSelect';
import { Home } from './pages/Home';
import { Learn } from './pages/Learn';
import './index.css';
function App() { return <><a className="skip-link" href="#main">Skip to content</a><header className="header"><Link to="/" className="brand" aria-label="Parallax home"><Orbit aria-hidden="true" size={29}/>parallax<span className="brand-dot">.</span></Link><nav aria-label="Main navigation"><NavLink to="/" end>Overview</NavLink><NavLink to="/learn">The course</NavLink></nav><ThemeSelect/></header><Routes><Route path="/" element={<Home/>}/><Route path="/learn" element={<Learn/>}/><Route path="*" element={<main id="main" className="placeholder"><p className="eyebrow">404 / OFF THE MAP</p><h1>Uncharted territory.</h1><p>This page doesn’t exist.</p><Link to="/">Return home</Link></main>}/></Routes><footer><Link to="/" className="footer-brand">parallax.</Link><span>A different perspective changes everything.</span><span>Built for curiosity.</span></footer></>; }
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><App/></BrowserRouter></React.StrictMode>);
