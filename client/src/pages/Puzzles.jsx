import { useState, useContext, useEffect } from "react";
// import context provider
import { AuthContext } from '../App';

/* Components */
import SolvePuzzleBar from '../components/SolvePuzzleBar';
import PuzzlesTable from "../components/PuzzlesTable";
import ErrorAlert from "../components/ErrorAlert";

export default function Puzzles() {
    const [authenticated, setAuthenticated] = useContext(AuthContext);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!authenticated) {
            const err = new Error("Please login to solve puzzles and view you solutions!");
            setError(err);
        }
    }, [authenticated]);

    return (
        <div className="container puzzles">
            <ErrorAlert errorState={error} dismissError={() => {setError(null);}} />
            <SolvePuzzleBar />
            <PuzzlesTable />
        </div>
    )
}