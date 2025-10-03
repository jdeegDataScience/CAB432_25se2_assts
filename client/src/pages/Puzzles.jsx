import React, {createContext, useState } from "react";

/* Components */
// import SearchBar from '../components/SearchBar';
// import PuzzlesTable from "../components/PuzzlesTable";

// context for movie search params
export const PuzzlesSearchContext = createContext();

export default function Puzzles() {
    const [ searchURL, setSearchURL ] = useState(`${localStorage.API_URL}/puzzles/`);

    return (
    <PuzzlesSearchContext.Provider value={[searchURL, setSearchURL]}>
        <div className="container puzzles">
            {/* <SearchBar /> */}
            {/* <PuzzlesTable /> */}
        </div>
    </PuzzlesSearchContext.Provider>
    )
}