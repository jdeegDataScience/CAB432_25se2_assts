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
            <h1 className="hero_title">The Movie Site</h1>
            <br />  
            <a href="/movies">Find all the movie and cast info you could ever need (up to 2024)</a>
        </div>
    </section>
);