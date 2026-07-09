
export default function ClimateHero() {
    return (
        <div>
            <section className="hero">
                <div className="hero__content">
                    <p className="hero__eyebrow">Open to climate tech roles</p>
                    <h1 className="hero__headline">Senior full-stack software engineer building scalable UIs and APIs for the energy transition.</h1>
                    <div className="hero__actions">
                    <a href="mailto:dale@dalechang.dev" className="btn btn--primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="m22 6-10 7L2 6"/></svg>
                        Email me
                    </a>
                    <a href="/resume.pdf" download className="btn btn--secondary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>
                        Download resume
                    </a>
                    </div>
                </div>

                <div className="hero__signature" aria-hidden="true">
                    <svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg">
                    <path className="signature-path" d="M0,80 C15,30 30,130 45,55 C60,15 75,145 90,65 C105,25 120,115 135,72 C150,45 165,95 180,78 C195,60 205,85 215,80 C230,78 250,80 270,80 L400,80" />
                    <circle className="signature-dot" cx="380" cy="80" r="4.5" />
                    </svg>
                    <span className="hero__signature-label">System load — stabilized</span>
                </div>
            </section>
        </div>
    )
}
