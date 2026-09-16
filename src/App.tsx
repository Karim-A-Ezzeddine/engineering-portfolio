import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { projects, projectById, type Project, type ProjectId, type VisualId } from './data/projects';
import { site } from './data/site';

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const StoryVisual = lazy(() => import('./components/Visuals'));
function CaseVisual({ id }: { id: VisualId }) { return <Suspense fallback={<div className="visual-loading">Preparing project visual…</div>}><StoryVisual id={id} /></Suspense>; }

function useRoute() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || '/');
  useEffect(() => {
    const update = () => setRoute(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  return route;
}

function useMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 900px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 900px)');
    const update = () => setMobile(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return mobile;
}

function Header({ onHome }: { onHome: (target?: string) => void }) {
  return <header className="site-header">
    <a className="brand" href="#/" onClick={() => onHome('top')} aria-label="Karim Ezzeddine, homepage"><span className="brand-mark">K<span>.</span></span><span className="brand-name">KARIM EZZEDDINE</span></a>
    <nav className="main-nav" aria-label="Main navigation"><a href="#/" onClick={() => onHome('top')}>Home</a><a href="#/work" onClick={() => onHome('work')}>Work</a><a href="#/about" onClick={() => onHome('about')}>About</a><a href="#/contact" onClick={() => onHome('contact')}>Contact <span aria-hidden="true">↗</span></a></nav>
  </header>;
}

function Hero() {
  return <section className="hero" id="top" aria-labelledby="hero-title">
    <div className="hero-grid" aria-hidden="true" />
    <div className="hero-copy"><p className="eyebrow"><span className="eyebrow-line" /> MUNICH, GERMANY <span className="eyebrow-sep">/</span> ENGINEERING PORTFOLIO</p><h1 id="hero-title">Karim<br /><em>Ezzeddine<span>.</span></em></h1><div className="hero-bottom"><p className="hero-lead">Electrical Engineering · Automation & Robotics · Intelligent Automotive Systems</p><p className="hero-intro">I am a TUM Electrical Engineering Master’s student working where physical systems meet intelligent, data-driven methods—across vehicles, batteries, controls, and energy.</p></div><div className="hero-actions"><a className="button button-primary" href="#/work">Explore my work <span aria-hidden="true">↗</span></a><a className="button button-text" href={site.github} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a><a className="button button-text" href="#/contact">Contact <span aria-hidden="true">↗</span></a>{site.cv && <a className="button button-text" href={site.cv} target="_blank" rel="noreferrer">CV <span aria-hidden="true">↗</span></a>}</div></div>
    <div className="hero-instrument" aria-label="Abstract engineering signal visual"><div className="instrument-top"><span>PHYSICAL SIGNALS</span><span>01 / 03</span></div><svg viewBox="0 0 640 470" role="img" aria-labelledby="signal-title"><title id="signal-title">Three monitored signals converge toward an estimated state</title><defs><pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M 34 0 L 0 0 0 34" fill="none" stroke="#2e383a" strokeWidth="1" /></pattern></defs><rect x="0" y="0" width="640" height="470" fill="url(#grid" /><path d="M0 88 H640 M0 232 H640 M0 376 H640" stroke="#425051" strokeWidth="1" strokeDasharray="4 8" /><path className="signal-path signal-a" d="M0 139 C45 139 55 91 93 91 S139 166 178 168 S226 113 263 111 S318 164 358 161 S408 112 450 111 S496 165 537 163 S598 102 640 106" /><path className="signal-path signal-b" d="M0 277 C48 271 71 303 112 298 S159 241 204 248 S253 301 294 295 S341 246 388 248 S434 295 475 290 S537 251 572 254 S610 290 640 282" /><path className="signal-path signal-c" d="M0 378 C45 377 79 361 108 364 S162 396 204 391 S248 359 291 360 S338 392 381 388 S426 362 467 360 S518 393 560 388 S607 361 640 365" /><circle cx="450" cy="111" r="5" fill="#b8dbd2" /><circle cx="475" cy="290" r="5" fill="#d6a881" /><circle cx="467" cy="360" r="5" fill="#95b2c7" /></svg><div className="instrument-bottom"><span>MEASURE → MODEL → VALIDATE</span><span className="live-line"><i /> SIGNAL ACTIVE</span></div></div><div className="scroll-cue">SCROLL TO EXPLORE <span>↓</span></div>
  </section>;
}

function Work() {
  return <><section className="work-intro" id="work" aria-labelledby="work-title"><div className="section-heading"><p className="eyebrow">01 / SELECTED ENGINEERING WORK</p><h2 id="work-title">Engineering,<br />measured.</h2></div><p>Three investigations. Different systems. The same discipline: define the physical problem, build a defensible method, and report where the evidence holds—and where it does not.</p></section><section className="project-list" aria-label="Selected engineering work">{projects.map((project) => <a key={project.id} href={`#/work/${project.id}`} className={`project-row project-${project.id}`}><div className="project-index">{project.number}<span> / 03</span></div><div className="project-body"><p className="eyebrow">{project.discipline}</p><h3>{project.title}</h3><p className="project-question">{project.question}</p><p className="project-description">{project.summary}</p><div className="method-tags">{project.methods.slice(0, 4).map((method) => <span key={method}>{method}</span>)}</div><span className="project-open">Explore case study <span aria-hidden="true">↗</span></span></div><div className="project-visual"><span className="project-visual-label">SELECTED RESULT / {project.number}</span><strong>{project.heroMetric.value}</strong><span className="project-unit">{project.heroMetric.label}</span><span className="project-note">{project.heroMetric.note}</span><span className="project-glyph" aria-hidden="true">{project.id === 'bms' ? '⌁' : project.id === 'driver' ? '↗' : '∿'}</span></div></a>)}</section></>;
}

function About() {
  return <section className="about-section" id="about" aria-labelledby="about-title"><div><p className="eyebrow">02 / ABOUT</p><h2 id="about-title">Engineering first.<br /><span>Methods that hold up.</span></h2></div><div className="about-copy"><p>I am pursuing an M.Sc. in Electrical Engineering at the Technical University of Munich, focusing on Automation & Robotics. My interests connect automotive and energy systems with estimation, controls, data analysis, and machine learning.</p><p>This portfolio focuses on independently documented work: what the system measured, how a method was evaluated, and what the results do—and do not—support.</p><div className="about-strip"><span>BASED IN</span><strong>Munich, Germany</strong><span>FOCUS</span><strong>Physical systems × intelligent methods</strong></div></div></section>;
}

function Contact() {
  return <section className="contact-section" id="contact" aria-labelledby="contact-title"><div><p className="eyebrow">03 / CONTACT</p><h2 id="contact-title">Let’s discuss<br /><em>the engineering.</em></h2><p>Open to technical conversations around intelligent vehicles, battery systems, automation, and applied research.</p></div><div className="contact-links"><a href={site.github} target="_blank" rel="noreferrer">GitHub <span>↗</span></a>{site.email ? <a href={`mailto:${site.email}`}>Email <span>↗</span></a> : <span className="contact-pending">Email <small>add address</small></span>}{site.linkedin ? <a href={site.linkedin} target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a> : <span className="contact-pending">LinkedIn <small>add URL</small></span>}{site.cv ? <a href={site.cv} target="_blank" rel="noreferrer">CV <span>↗</span></a> : <span className="contact-pending">CV <small>add PDF</small></span>}</div></section>;
}

function Footer() { return <footer className="site-footer"><span>KARIM EZZEDDINE</span><span>MUNICH, GERMANY</span><span>© {new Date().getFullYear()} · ENGINEERED WITH EVIDENCE</span><a href="#/">BACK TO TOP ↑</a></footer>; }
function Home() { return <main><Hero /><Work /><About /><Contact /></main>; }

function CaseStudy({ project }: { project: Project }) {
  const [active, setActive] = useState(0);
  const mobile = useMobile();
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const next = projects[(projects.findIndex((item) => item.id === project.id) + 1) % projects.length];
  useEffect(() => { setActive(0); window.scrollTo({ top: 0, behavior: 'instant' }); document.title = `${project.title} — Karim Ezzeddine`; document.querySelector('meta[name="description"]')?.setAttribute('content', `${project.question} ${project.summary}`); }, [project.id, project.title, project.question, project.summary]);
  useEffect(() => { const observer = new IntersectionObserver((entries) => { const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio); if (visible[0]) setActive(Number((visible[0].target as HTMLElement).dataset.index)); }, { rootMargin: '-20% 0px -40% 0px', threshold: [0, .1, .25, .5, .75] }); stepRefs.current.forEach((element) => element && observer.observe(element)); return () => observer.disconnect(); }, [project.id, mobile]);
  return <main className={`case-study theme-${project.id}`}><div className="case-topline"><a href="#/work">← ALL WORK</a><span>CASE STUDY {project.number} / 03</span></div><nav className="case-project-nav" aria-label="Case study selector">{projects.map((item) => <a key={item.id} href={`#/work/${item.id}`} aria-current={item.id === project.id ? 'page' : undefined}><span>{item.number}</span>{item.short}</a>)}</nav><section className="case-hero"><div><p className="eyebrow">{project.discipline}</p><h1>{project.title}</h1><p className="case-question">{project.question}</p><p className="case-summary">{project.summary}</p><div className="method-tags">{project.methods.map((method) => <span key={method}>{method}</span>)}</div></div><div className="case-hero-result"><span>AT A GLANCE</span><strong>{project.heroMetric.value}</strong><b>{project.heroMetric.label}</b><small>{project.heroMetric.note}</small></div></section><div className="case-source-note"><span>EVIDENCE NOTE</span><p>{project.sourceNote}</p></div><div className="story-section" aria-label={`${project.title} engineering story`}><div className="story-progress"><span>SCROLL THROUGH THE ENGINEERING STORY</span><div><i style={{ width: `${(active + 1) / project.steps.length * 100}%` }} /></div><strong>{String(active + 1).padStart(2, '0')} / {String(project.steps.length).padStart(2, '0')}</strong></div><div className="story-layout"><div className="story-steps">{project.steps.map((step, index) => <section className={`story-step${index === active ? ' is-active' : ''}`} data-index={index} ref={(element) => { stepRefs.current[index] = element; }} key={step.kicker} aria-labelledby={`step-${project.id}-${index}`}><p className="eyebrow">{step.kicker}</p><h2 id={`step-${project.id}-${index}`}>{step.title}</h2>{step.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{step.insight && <div className="story-insight"><span>ENGINEERING INSIGHT</span><strong>{step.insight}</strong></div>}{step.detail && <details className="technical-detail"><summary>{step.detail.title} <span>+</span></summary>{step.detail.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</details>}<small className="story-source">SOURCE · {step.source}</small>{mobile && <div className="mobile-story-visual"><CaseVisual id={step.visual} /></div>}</section>)}</div>{!mobile && <aside className="sticky-visual" aria-label="Case study visual"><div key={project.steps[active].visual} className="visual-enter"><CaseVisual id={project.steps[active].visual} /></div><div className="sticky-caption"><span>{String(active + 1).padStart(2, '0')} / {String(project.steps.length).padStart(2, '0')}</span><span>{project.steps[active].kicker}</span></div></aside>}</div></div><section className="case-evidence" aria-label="Key results"><div className="case-section-intro"><p className="eyebrow">EVIDENCE / IN CONTEXT</p><h2>Results, with boundaries.</h2></div><div className="case-metrics">{project.metrics.map((metric) => <div key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span><small>{metric.note}</small></div>)}</div>{project.figure && <figure className="source-figure"><img src={asset(project.figure.src)} alt={project.figure.alt} loading="lazy" /><figcaption>{project.figure.caption}</figcaption></figure>}</section><a className={`next-project next-${next.id}`} href={`#/work/${next.id}`}><span>NEXT CASE STUDY →</span><strong>{next.title}</strong><small>{next.question}</small></a></main>;
}

function App() {
  const route = useRoute();
  const projectId = route.match(/^\/work\/(bms|driver|eon)$/)?.[1] as ProjectId | undefined;
  const project = projectId ? projectById[projectId] : undefined;
  useEffect(() => { if (!project) { document.title = 'Karim Ezzeddine — Electrical Engineering Portfolio'; document.querySelector('meta[name="description"]')?.setAttribute('content', 'Karim Ezzeddine is a TUM Electrical Engineering Master’s student working across intelligent vehicles, battery state estimation, automation, and energy data.'); const target = route === '/work' ? 'work' : route === '/about' ? 'about' : route === '/contact' ? 'contact' : 'top'; window.setTimeout(() => target === 'top' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' }), 30); } }, [project, route]);
  const onHome = (target = 'top') => { if (!project) window.setTimeout(() => target === 'top' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' }), 0); };
  return <div className="site-shell"><a className="skip-link" href="#main-content">Skip to content</a><Header onHome={onHome} /><div id="main-content">{project ? <CaseStudy key={project.id} project={project} /> : <Home />}</div><Footer /></div>;
}

export default App;
