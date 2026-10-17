import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FallingBodies } from '../components/widgets/FallingBodies';
import { SecantExplorer } from '../components/widgets/SecantExplorer';
export function TeachingLab() {
  const [subject, setSubject] = useState<'physics' | 'maths'>('physics');
  return <main id="main" className="teaching-lab"><p className="eyebrow">THE PARALLAX TEACHING LAB / DRAFT PREVIEW</p><h1>Try the idea.<br/><em>Then demand the proof.</em></h1><p className="lab-intro">Predict → experiment → explain → derive → challenge → connect. Experiments build intuition; complete theory explains its reach and its limits.</p><div className="lab-subjects" role="group" aria-label="Teaching example"><button aria-pressed={subject === 'physics'} onClick={() => setSubject('physics')}>Physics: falling bodies</button><button aria-pressed={subject === 'maths'} onClick={() => setSubject('maths')}>Maths: slopes and limits</button></div>{subject === 'physics' ? <FallingBodies/> : <SecantExplorer/>}<aside className="dashboard-note"><strong>A teaching-style preview, not a completed course lesson.</strong><p>These authored examples do not record attempts, completion, or mastery. Full theory is available after your prediction; use “Show full argument” to see every step at once.</p></aside><Link className="text-button" to="/dashboard">Back to dashboard</Link></main>;
}
