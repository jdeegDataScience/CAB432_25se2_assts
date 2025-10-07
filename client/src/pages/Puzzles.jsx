/* Components */
import SolvePuzzleBar from '../components/SolvePuzzleBar';
import PuzzlesTable from "../components/PuzzlesTable";

export default function Puzzles() {
    return (
        <div className="container puzzles">
            <SolvePuzzleBar />
            <PuzzlesTable />
        </div>
    )
}