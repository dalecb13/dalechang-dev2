import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "../globals.css";
import ExternalLink from "@/components/external-link";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: "Dale Chang | Software Engineer",
  description: "Software Engineer excelling JavaScript/TypeScript stacks",
};

export default function NextLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} font-sans`}>
        <main className="flex flex-col min-h-screen justify-between lg:w-full lg:grid lg:grid-cols-2">

          <div className="flex flex-col items-center md:pt-12 md:px-12 lg:px-0 lg:grid lg:grid-cols-2 lg:col-span-2">
            {children}
          </div>

          <footer className="footer footer-center p-6 bg-base-200 text-base-content lg:p-10 lg:bg-transparent lg:grid-cols-1 lg:col-span-2 lg:flex lg:flex-row lg:justify-center lg:bg-base-200">
            <div className="w-80 flex flex-col gap-8 lg:col-start-2">
              <aside>
                <p className="">Scaffolded with <ExternalLink externalLink="https://nextjs.org" displayText="Next.js" />, styled with <ExternalLink externalLink="https://tailwindcss.com" displayText="Tailwind CSS" />, written in <ExternalLink externalLink="https://www.typescriptlang.org" displayText="TypeScript" /> and <ExternalLink externalLink="https://code.visualstudio.com" displayText="VSCode" /></p>
              </aside>
              <aside>
                <div className="flex flex-row items-center gap-4">
                  <a className="external-link text-slate-700 dark:text-slate-100 hover:underline hover:text-slate-400" href="https://github.com/eloquia" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36.75 36" fill="currentColor" className="h-6 w-6" aria-hidden="true">
                    <path
                      d="M33.2 8.9a17.7 17.7 0 0 0-6.5-6.5 17.4 17.4 0 0 0-9-2.4A17.4 17.4 0 0 0 9 2.4a17.7 17.7 0 0 0-6.5 6.5A17.4 17.4 0 0 0 0 17.8a17.3 17.3 0 0 0 3.4 10.4 17.4 17.4 0 0 0 8.8 6.4 1 1 0 0 0 .9-.1 1 1 0 0 0 .3-.7v-1.3-2h-.6a6.8 6.8 0 0 1-1.3.2 9.8 9.8 0 0 1-1.6-.2 3.6 3.6 0 0 1-1.5-.7 3 3 0 0 1-1-1.4l-.3-.6a5.8 5.8 0 0 0-.7-1.1 2.8 2.8 0 0 0-1-1h-.2a1.7 1.7 0 0 1-.3-.3 1.3 1.3 0 0 1-.2-.3l.1-.3a1.5 1.5 0 0 1 .7-.1H6a3.4 3.4 0 0 1 1.1.6 3.7 3.7 0 0 1 1.1 1.2A4 4 0 0 0 9.5 28a2.7 2.7 0 0 0 1.5.5 6.6 6.6 0 0 0 1.4-.1 4.6 4.6 0 0 0 1-.4 3.8 3.8 0 0 1 1.1-2.4 15.8 15.8 0 0 1-2.3-.4 9.4 9.4 0 0 1-2.2-.9A6.2 6.2 0 0 1 8 22.8 7.5 7.5 0 0 1 7 20.3a11.6 11.6 0 0 1-.5-3.4A6.8 6.8 0 0 1 8.3 12a6.2 6.2 0 0 1 .1-4.7 3.2 3.2 0 0 1 2 .3 14 14 0 0 1 2 .9l1 .6a16.7 16.7 0 0 1 8.8 0l.9-.6a12.5 12.5 0 0 1 2.1-1 3 3 0 0 1 1.9-.2 6.2 6.2 0 0 1 .2 4.7 6.8 6.8 0 0 1 1.8 4.8 11.7 11.7 0 0 1-.5 3.4 7.2 7.2 0 0 1-1.2 2.5 6.5 6.5 0 0 1-1.9 1.5 9.5 9.5 0 0 1-2.1.9 15.8 15.8 0 0 1-2.4.4 4.1 4.1 0 0 1 1.2 3.3v4.9a1 1 0 0 0 .3.7 1 1 0 0 0 .9.1 17.4 17.4 0 0 0 8.8-6.4 17.3 17.3 0 0 0 3.3-10.4 17.4 17.4 0 0 0-2.3-9z"
                      data-name="Path 291"
                    />
                  </svg>
                  </a>
                  <a className="external-link text-slate-700 dark:text-slate-100 hover:underline hover:text-slate-400" href="https://www.linkedin.com/in/dale-chang-112827157" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
                      <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                    </svg>
                  </a>
                  <a className="external-link text-slate-700 dark:text-slate-100 hover:underline hover:text-slate-400" href="https://twitter.com/EloquiaTech" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1227" fill="none" className="h-5 w-5" aria-hidden="true">
                      <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="currentColor"></path>
                    </svg>
                  </a>

                  <a className="external-link text-slate-700 dark:text-slate-100 hover:underline hover:text-slate-400" href="https://www.xing.com/profile/Dale_Chang" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 31 31" data-xds="LogoXINGLogoDuo" className="h-5 w-5">
                      <path fill="currentColor" d="m1.805 5.984 3.635 6.479L0 22.018h6.491l5.4-9.555-3.634-6.48z"></path>
                      <path fill="currentColor" d="m21.122 0-10.49 18.642L17.396 31h6.582l-6.88-12.358L27.6 0z"></path>
                    </svg>
                  </a>

                  <a className="external-link text-slate-700 dark:text-slate-100 hover:underline hover:text-slate-400" href="https://notes.dalechang.dev" target="_blank" rel="noopener noreferrer">
                    <svg fill="none" height="100%" width="100%" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
                      <radialGradient id="logo-bottom-left" cx="0" cy="0" gradientTransform="matrix(-59 -225 150 -39 161.4 470)" gradientUnits="userSpaceOnUse" r="1">
                        <stop offset="0" stopColor="#fff" stopOpacity=".4"/>
                        <stop offset="1" stopOpacity=".1"/>
                      </radialGradient>
                      <radialGradient id="logo-top-right" cx="0" cy="0" gradientTransform="matrix(50 -379 280 37 360 374.2)" gradientUnits="userSpaceOnUse" r="1">
                        <stop offset="0" stopColor="#fff" stopOpacity=".6"/>
                        <stop offset="1" stopColor="#fff" stopOpacity=".1"/>
                      </radialGradient>
                      <radialGradient id="logo-top-left" cx="0" cy="0" gradientTransform="matrix(69 -319 218 47 175.4 307)" gradientUnits="userSpaceOnUse" r="1">
                        <stop offset="0" stopColor="#fff" stopOpacity=".8"/>
                        <stop offset="1" stopColor="#fff" stopOpacity=".4"/>
                      </radialGradient>
                      <radialGradient id="logo-bottom-right" cx="0" cy="0" gradientTransform="matrix(-96 -163 187 -111 335.3 512.2)" gradientUnits="userSpaceOnUse" r="1">
                        <stop offset="0" stopColor="#fff" stopOpacity=".3"/>
                        <stop offset="1" stopOpacity=".3"/>
                      </radialGradient>
                      <radialGradient id="logo-top-edge" cx="0" cy="0" gradientTransform="matrix(-36 166 -112 -24 310 128.2)" gradientUnits="userSpaceOnUse" r="1">
                        <stop offset="0" stopColor="#fff" stopOpacity="0"/>
                        <stop offset="1" stopColor="#fff" stopOpacity=".2"/>
                      </radialGradient>
                      <radialGradient id="logo-left-edge" cx="0" cy="0" gradientTransform="matrix(88 89 -190 187 111 220.2)" gradientUnits="userSpaceOnUse" r="1">
                        <stop offset="0" stopColor="#fff" stopOpacity=".2"/>
                        <stop offset="1" stopColor="#fff" stopOpacity=".4"/>
                      </radialGradient>
                      <radialGradient id="logo-bottom-edge" cx="0" cy="0" gradientTransform="matrix(9 130 -276 20 215 284)" gradientUnits="userSpaceOnUse" r="1">
                        <stop offset="0" stopColor="#fff" stopOpacity=".2"/>
                        <stop offset="1" stopColor="#fff" stopOpacity=".3"/>
                      </radialGradient>
                      <radialGradient id="logo-middle-edge" cx="0" cy="0" gradientTransform="matrix(-198 -104 327 -623 400 399.2)" gradientUnits="userSpaceOnUse" r="1">
                        <stop offset="0" stopColor="#fff" stopOpacity=".2"/>
                        <stop offset=".5" stopColor="#fff" stopOpacity=".2"/>
                        <stop offset="1" stopColor="#fff" stopOpacity=".3"/>
                      </radialGradient>
                      <clipPath id="clip">
                        <path d="M.2.2h512v512H.2z"/>
                      </clipPath>
                      <g clipPath="url(#clip)">
                        <path d="M382.3 475.6c-3.1 23.4-26 41.6-48.7 35.3-32.4-8.9-69.9-22.8-103.6-25.4l-51.7-4a34 34 0 0 1-22-10.2l-89-91.7a34 34 0 0 1-6.7-37.7s55-121 57.1-127.3c2-6.3 9.6-61.2 14-90.6 1.2-7.9 5-15 11-20.3L248 8.9a34.1 34.1 0 0 1 49.6 4.3L386 125.6a37 37 0 0 1 7.6 22.4c0 21.3 1.8 65 13.6 93.2 11.5 27.3 32.5 57 43.5 71.5a17.3 17.3 0 0 1 1.3 19.2 1494 1494 0 0 1-44.8 70.6c-15 22.3-21.9 49.9-25 73.1z" fill="#6c31e3"/>
                        <path d="M165.9 478.3c41.4-84 40.2-144.2 22.6-187-16.2-39.6-46.3-64.5-70-80-.6 2.3-1.3 4.4-2.2 6.5L60.6 342a34 34 0 0 0 6.6 37.7l89.1 91.7a34 34 0 0 0 9.6 7z" fill="url(#logo-bottom-left)"/>
                        <path d="M278.4 307.8c11.2 1.2 22.2 3.6 32.8 7.6 34 12.7 65 41.2 90.5 96.3 1.8-3.1 3.6-6.2 5.6-9.2a1536 1536 0 0 0 44.8-70.6 17 17 0 0 0-1.3-19.2c-11-14.6-32-44.2-43.5-71.5-11.8-28.2-13.5-72-13.6-93.2 0-8.1-2.6-16-7.6-22.4L297.6 13.2a34 34 0 0 0-1.5-1.7 96 96 0 0 1 2 54 198.3 198.3 0 0 1-17.6 41.3l-7.2 14.2a171 171 0 0 0-19.4 71c-1.2 29.4 4.8 66.4 24.5 115.8z" fill="url(#logo-top-right)"/>
                        <path d="M278.4 307.8c-19.7-49.4-25.8-86.4-24.5-115.9a171 171 0 0 1 19.4-71c2.3-4.8 4.8-9.5 7.2-14.1 7.1-13.9 14-27 17.6-41.4a96 96 0 0 0-2-54A34.1 34.1 0 0 0 248 9l-105.4 94.8a34.1 34.1 0 0 0-10.9 20.3l-12.8 85-.5 2.3c23.8 15.5 54 40.4 70.1 80a147 147 0 0 1 7.8 24.8c28-6.8 55.7-11 82.1-8.3z" fill="url(#logo-top-left)"/>
                        <path d="M333.6 511c22.7 6.2 45.6-12 48.7-35.4a187 187 0 0 1 19.4-63.9c-25.6-55-56.5-83.6-90.4-96.3-36-13.4-75.2-9-115 .7 8.9 40.4 3.6 93.3-30.4 162.2 4 1.8 8.1 3 12.5 3.3 0 0 24.4 2 53.6 4.1 29 2 72.4 17.1 101.6 25.2z" fill="url(#logo-bottom-right)"/>
                        <g clipRule="evenodd" fillRule="evenodd">
                          <path d="M254.1 190c-1.3 29.2 2.4 62.8 22.1 112.1l-6.2-.5c-17.7-51.5-21.5-78-20.2-107.6a174.7 174.7 0 0 1 20.4-72c2.4-4.9 8-14.1 10.5-18.8 7.1-13.7 11.9-21 16-33.6 5.7-17.5 4.5-25.9 3.8-34.1 4.6 29.9-12.7 56-25.7 82.4a177.1 177.1 0 0 0-20.7 72z" fill="url(#logo-top-edge)"/>
                          <path d="M194.3 293.4c2.4 5.4 4.6 9.8 6 16.5L195 311c-2.1-7.8-3.8-13.4-6.8-20-17.8-42-46.3-63.6-69.7-79.5 28.2 15.2 57.2 39 75.7 81.9z" fill="url(#logo-left-edge)"/>
                          <path d="M200.6 315.1c9.8 46-1.2 104.2-33.6 160.9 27.1-56.2 40.2-110.1 29.3-160z" fill="url(#logo-bottom-edge)"/>
                          <path d="M312.5 311c53.1 19.9 73.6 63.6 88.9 100-19-38.1-45.2-80.3-90.8-96-34.8-11.8-64.1-10.4-114.3 1l-1.1-5c53.2-12.1 81-13.5 117.3 0z" fill="url(#logo-middle-edge)"/>
                        </g>
                      </g>
                    </svg>

                  </a>
                </div>
              </aside> 
              <aside>
                <p>Copyright © 2024 - Dale Chang</p>
              </aside>
              <aside>
                Looking for the <a className="external-link text-violet-700 dark:text-slate-100 hover:underline hover:text-slate-400" href="https://github.com/eloquia/dalechang-me" target="_blank" rel="noopener noreferrer">first version</a> of this website?
              </aside>
            </div>
          </footer>
        </main>
      </body>
    </html>
  );
}
