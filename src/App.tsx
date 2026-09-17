import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { projects, projectById, type Project, type ProjectId, type VisualId } from './data/projects';
import { site } from './data/site';
import { activeStepAtLine } from './story/activeStep';

const StoryVisual = lazy(() => import('./components/Visuals'));
const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const projectPreviewVisual: Record<ProjectId, VisualId> = {
  bms: 'bms-circuit',
  driver: 'driver-timeline',
  eon: 'eon-system',
};

const projectNavLabel: Record<ProjectId, string> = {
  bms: 'BMS',
  driver: 'Driver Behavior',
  eon: 'E.ON',
};

function CaseVisual({ id }: { id: VisualId }) {
  return (
    <Suspense fallback={<div className="visual-loading">Loading visualization…</div>}>
      <StoryVisual id={id} />
    </Suspense>
  );
}

function useRoute() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || '/');

  useEffect(() => {
    const update = () => setRoute(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  return route;
}

function Header({ onSection }: { onSection: (section: string) => void }) {
  return (
    <header className="site-header">
      <a className="brand" href="#/" onClick={() => onSection('top')}>Karim Ezzeddine</a>
      <nav className="main-nav" aria-label="Main navigation">
        <a href="#/" onClick={() => onSection('top')}>Home</a>
        <a href="#/work" onClick={() => onSection('work')}>Projects</a>
        {site.cv && <a href={site.cv} target="_blank" rel="noreferrer">CV</a>}
        <a href={site.github} target="_blank" rel="noreferrer">GitHub</a>
        <a href="#/contact" onClick={() => onSection('contact')}>Contact</a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <h1 id="hero-title">Karim Ezzeddine</h1>
      <p className="hero-lead">Electrical Engineering M.Sc. · Automation &amp; Robotics</p>
      <p className="hero-intro">
        Electrical Engineering Master&apos;s student at TUM working on automotive systems,
        controls, battery systems, data analytics, and machine learning.
      </p>
    </section>
  );
}

function Mission() {
  return (
    <section className="mission-section" aria-labelledby="mission-title">
      <h2 id="mission-title">Mission</h2>
      <p>
        I am interested in using data-driven methods, control, and machine learning to
        understand and improve physical engineering systems, particularly in automotive and
        mobility applications.
      </p>
    </section>
  );
}

function Work() {
  return (
    <section className="work-section" id="work" aria-labelledby="work-title">
      <h2 id="work-title">Selected Projects</h2>
      <div className="project-list">
        {projects.map((project) => (
          <a key={project.id} href={`#/work/${project.id}`} className={`project-row project-${project.id}`}>
            <span className="project-index">{project.number}</span>
            <div className="project-body">
              <h3>{project.title}</h3>
              <p className="project-question">{project.question}</p>
              <p className="method-line">{project.methods.slice(0, 4).join(' · ')}</p>
              <span className="project-open">Open case study <span aria-hidden="true">↗</span></span>
            </div>
            <div className="project-preview" aria-hidden="true">
              <CaseVisual id={projectPreviewVisual[project.id]} />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <h2 id="contact-title">Contact</h2>
      <div className="contact-links">
        <a className="contact-email" href={`mailto:${site.email}`}>{site.email}</a>
        <a href={site.github} target="_blank" rel="noreferrer">GitHub ↗</a>
        {site.linkedin && <a href={site.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
        {site.cv && <a href={site.cv} target="_blank" rel="noreferrer">CV ↗</a>}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <span>Karim Ezzeddine · Munich, Germany</span>
      <a href={`mailto:${site.email}`}>{site.email}</a>
    </footer>
  );
}

function Home() {
  return <main><Hero /><Mission /><Work /><Contact /></main>;
}

function CaseStudy({ project }: { project: Project }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const activeStep = project.steps[activeStepIndex];
  const next = projects[(projects.findIndex((item) => item.id === project.id) + 1) % projects.length];

  useEffect(() => {
    setActiveStepIndex(0);
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.title = `${project.title} — Karim Ezzeddine`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', `${project.question} ${project.summary}`);
  }, [project.id, project.title, project.question, project.summary]);

  useEffect(() => {
    let frame: number | undefined;

    const measure = () => {
      frame = undefined;
      const elements = stepRefs.current;
      if (elements.length !== project.steps.length || elements.some((element) => !element)) return;

      const bounds = elements.map((element) => element!.getBoundingClientRect());
      const mobile = window.matchMedia('(max-width: 900px)').matches;
      const triggerY = window.innerHeight * (mobile ? 0.72 : 0.46);

      setActiveStepIndex((current) => {
        const nextIndex = activeStepAtLine(bounds, triggerY, current, 10);
        return current === nextIndex ? current : nextIndex;
      });
    };

    const schedule = () => {
      if (frame === undefined) frame = window.requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('toggle', schedule, true);
    schedule();

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('toggle', schedule, true);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [project.id, project.steps]);

  return (
    <main className={`case-study theme-${project.id}`}>
      <nav className="case-project-nav" aria-label="Case studies">
        <a href="#/work">← Projects</a>
        {projects.map((item) => (
          <a key={item.id} href={`#/work/${item.id}`} aria-current={item.id === project.id ? 'page' : undefined}>
            {projectNavLabel[item.id]}
          </a>
        ))}
      </nav>

      <section className="case-hero">
        <div>
          <p className="eyebrow">{project.discipline}</p>
          <h1>{project.title}</h1>
          <p className="case-question">{project.question}</p>
          <p className="case-summary">{project.summary}</p>
          <p className="method-line">{project.methods.join(' · ')}</p>
        </div>
        <div className="case-hero-result">
          <span>Selected result</span>
          <strong>{project.heroMetric.value}</strong>
          <b>{project.heroMetric.label}</b>
          <small>{project.heroMetric.note}</small>
        </div>
      </section>

      <div className="case-source-note"><span>Evidence note</span><p>{project.sourceNote}</p></div>

      <div className="story-section" aria-label={`${project.title} engineering story`}>
        <div className="story-progress">
          <span>{activeStep.kicker}</span>
          <div><i style={{ width: `${(activeStepIndex + 1) / project.steps.length * 100}%` }} /></div>
          <strong>{String(activeStepIndex + 1).padStart(2, '0')} / {String(project.steps.length).padStart(2, '0')}</strong>
        </div>

        <div className="story-layout">
          <aside className="sticky-visual" aria-label={`Visualization for ${activeStep.title}`}>
            <div key={`${project.id}-${activeStep.visual}`} className="active-visual" data-visual-id={activeStep.visual}>
              <CaseVisual id={activeStep.visual} />
            </div>
            <div className="sticky-caption">
              <span>{String(activeStepIndex + 1).padStart(2, '0')}</span>
              <span>{activeStep.kicker}</span>
            </div>
          </aside>

          <div className="story-steps">
            {project.steps.map((step, index) => (
              <section
                className={`story-step${index === activeStepIndex ? ' is-active' : ''}`}
                data-index={index}
                data-visual-id={step.visual}
                ref={(element) => { stepRefs.current[index] = element; }}
                key={step.kicker}
                aria-current={index === activeStepIndex ? 'step' : undefined}
                aria-labelledby={`step-${project.id}-${index}`}
              >
                <p className="step-kicker">{step.kicker}</p>
                <h2 id={`step-${project.id}-${index}`}>{step.title}</h2>
                {step.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {step.insight && <div className="story-insight"><span>Engineering interpretation</span><strong>{step.insight}</strong></div>}
                {step.detail && (
                  <details className="technical-detail">
                    <summary>{step.detail.title} <span aria-hidden="true">+</span></summary>
                    {step.detail.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </details>
                )}
                <small className="story-source">Source · {step.source}</small>
              </section>
            ))}
          </div>
        </div>
      </div>

      <section className="case-evidence" aria-labelledby="case-results-title">
        <div className="case-section-intro">
          <p className="eyebrow">Results</p>
          <h2 id="case-results-title">Results in context</h2>
        </div>
        <div className="case-metrics">
          {project.metrics.map((metric) => (
            <div key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
              <small>{metric.note}</small>
            </div>
          ))}
        </div>
        {project.figure && (
          <figure className="source-figure">
            <img src={asset(project.figure.src)} alt={project.figure.alt} loading="lazy" />
            <figcaption>{project.figure.caption}</figcaption>
          </figure>
        )}
      </section>

      <a className="next-project" href={`#/work/${next.id}`}>
        <span>Next case study →</span>
        <strong>{next.title}</strong>
      </a>
    </main>
  );
}

function App() {
  const route = useRoute();
  const projectId = route.match(/^\/work\/(bms|driver|eon)$/)?.[1] as ProjectId | undefined;
  const project = projectId ? projectById[projectId] : undefined;

  useEffect(() => {
    if (project) return;

    document.title = 'Karim Ezzeddine — Electrical Engineering Portfolio';
    document.querySelector('meta[name="description"]')?.setAttribute(
      'content',
      'Karim Ezzeddine is an Electrical Engineering M.Sc. student at TUM. Projects in automotive systems, battery estimation, controls, and machine learning.',
    );

    const target = route === '/work' ? 'work' : route === '/contact' ? 'contact' : 'top';
    const frame = window.requestAnimationFrame(() => {
      if (target === 'top') window.scrollTo({ top: 0, behavior: 'auto' });
      else document.getElementById(target)?.scrollIntoView({ behavior: 'auto' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [project, route]);

  const onSection = (section: string) => {
    if (project) return;
    window.requestAnimationFrame(() => {
      if (section === 'top') window.scrollTo({ top: 0, behavior: 'auto' });
      else document.getElementById(section)?.scrollIntoView({ behavior: 'auto' });
    });
  };

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content" onClick={(event) => {
        event.preventDefault();
        document.getElementById('main-content')?.focus();
      }}>Skip to content</a>
      {!project && <Header onSection={onSection} />}
      <div id="main-content" tabIndex={-1}>{project ? <CaseStudy key={project.id} project={project} /> : <Home />}</div>
      <Footer />
    </div>
  );
}

export default App;
