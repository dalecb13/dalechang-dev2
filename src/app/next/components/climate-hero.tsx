import Image from 'next/image'
import profilePic from '../../../images/dale-chang-photo.jpeg';

const profileImageStyle = {
    borderRadius: '50%',
    border: '1px solid #F1F5F9',
}

export default function ClimateHero() {
    return (
        <section className="flex flex-col max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-28">
            <div className="flex flex-col-reverse md:flex md:gap-4">
                <Image
                    src={profilePic}
                    width={200}
                    height={200}
                    alt="Picture of Dale Chang"
                    style={profileImageStyle}
                    className="mb-8 mt-4 place-self-center"
                />
                <div className="flex flex-col gap-2 md:max-w-96">
                    <h1 className="text-[1.75rem] font-medium">Dale Chang</h1>
                    <h2 className="text-[1.3rem] font-normal">
                        Senior full-stack software engineer building scalable UIs and APIs for the energy transition.
                    </h2>
                </div>
            </div>
                
            <div className="flex flex-wrap gap-3.5 md:justify-center">
                <a href="mailto:dale@dalechang.dev"
                    className="inline-flex items-center gap-2 font-semibold text-[0.95rem] px-4 py-2 rounded-md bg-teal text-cream border border-teal hover:bg-tealHover hover:border-tealHover transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="w-4 h-4 shrink-0">
                    <path d="M4 4h16v16H4z"/><path d="m22 6-10 7L2 6"/>
                    </svg>
                    Email me
                </a>
                <a href="/resume.pdf" download
                    className="inline-flex items-center gap-2 font-semibold text-[0.95rem] px-4 py-2 rounded-md bg-transparent text-ash border border-ash/40 hover:bg-creamAlt hover:border-ash transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" className="w-4 h-4 shrink-0">
                    <path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>
                    </svg>
                    Download resume
                </a>
            </div>
        </section>
    )
}
