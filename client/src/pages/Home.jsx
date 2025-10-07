import { useContext } from "react";

// import context provider
import { AuthContext } from '../App';

export default function Home() {
    const [authenticated, setAuthenticated] = useContext(AuthContext);

    // hero content
    const Hero = () => (
        <section className="hero">
            {/* content for the hero */}
            <div className="hero_content">
                <h1 className="hero_title">Sokoban Puzzle Solver</h1>
                <br />
                {
                    authenticated ? <a href="/puzzles">Upload any sokoban warehouse puzzle to get the solution - and see it in action!</a> : 
                    <a href="/login">Upload any sokoban warehouse puzzle to get the solution - and see it in action!</a> 
                }                
            </div>
        </section>
    );
    return (
        <main>
            <Hero />
        </main>
    );
}