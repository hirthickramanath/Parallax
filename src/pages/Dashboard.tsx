import { ArrowRight, Orbit, BookOpen, FlaskConical, Sigma } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
export function Dashboard() {
  const { user } = useAuth();
  const name = user?.displayName?.trim().split(/\s+/)[0];
  return <main id="main" className="dashboard">
    <section className="dashboard-heading"><p className="eyebrow">YOUR OBSERVATORY</p><h1>{name ? `Welcome back, ${name}.` : 'Welcome to your observatory.'}</h1><p>A universe to understand. A foundation to build it on.</p></section>
    <section className="dashboard-continue" aria-labelledby="continue-heading"><div><p className="eyebrow">CONTINUE LEARNING</p><h2 id="continue-heading">Your first chapter<br/>is ahead.</h2><p>The lesson library is being prepared. Once you begin, this is where you’ll find your last lesson, a short recap, and the next step.</p><Button asChild><Link to="/learn">View course preview <ArrowRight size={17}/></Link></Button></div><div className="recap-empty"><BookOpen size={25} aria-hidden="true"/><h3>A moment to reconnect.</h3><p>No previous lesson yet. Your recap will use the lesson’s stored key ideas, so you can pick up the thread before moving on.</p><span className="availability-label">Available when lessons launch</span></div></section>
    <section className="dashboard-focus" aria-labelledby="focus-heading"><p className="eyebrow">ONE CONNECTED JOURNEY</p><h2 id="focus-heading">Astrophysics at the centre.</h2><p className="focus-intro">A fixed course built around understanding the universe—without choosing or dropping the foundations it needs.</p><div className="focus-grid">{[
      { Icon: Orbit, title: 'Astrophysics', description: 'From orbital motion and starlight to galaxies, cosmology, and research.' },
      { Icon: Sigma, title: 'Mathematics & physics', description: 'The full foundation: rigorous proofs, derivations, and the laws behind the observations.' },
      { Icon: FlaskConical, title: 'Chemistry & scientific tools', description: 'Physical chemistry, chemical bonding, selected inorganic and organic chemistry, and the computing needed to investigate.' },
    ].map(({ Icon, title, description }) => <article key={title}><Icon size={24} aria-hidden="true"/><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    <aside className="dashboard-note"><strong>Build status</strong><p>Sign-in is live. The curriculum map, lesson player, progress synchronization, and recap/resume are next. This dashboard does not record lesson completion or invent study history.</p></aside>
  </main>;
}
