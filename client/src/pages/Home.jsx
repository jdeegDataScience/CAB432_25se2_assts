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
            <h1 className="hero_title">Sokoban Puzzle Solver</h1>
            <br />  
            <a href="/puzzles">Upload any sokoban warehouse puzzle to get the solution - and see it in action!</a>
        </div>
    </section>
);