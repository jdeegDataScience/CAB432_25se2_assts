import React from "react";

export default function Home() {
    return (
        <main>
            <Hero />
        </main>
    );
}

// hero content
const Hero = () => (
    <section className="hero">
        {/* content for the hero */}
        <div className="hero_content">
            <h1 className="hero_title">YouTube Video Downloader</h1>
            <br />  
            <a href="/videos">Download and store any youTube Video - all you need is the URL!</a>
        </div>
    </section>
);