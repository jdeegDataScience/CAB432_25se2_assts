import React, {createContext, useState } from "react";

/* Components */
import SearchBar from '../components/SearchBar';
import MoviesTable from "../components/MoviesTable";

// context for movie search params
export const MoviesSearchContext = createContext();

export default function Movies() {
    const [ searchURL, setSearchURL ] = useState(`${localStorage.API_URL}/movies/search?`);

    return (
    <MoviesSearchContext.Provider value={[searchURL, setSearchURL]}>
        <div className="container movies">
            <SearchBar />
            <MoviesTable />
        </div>
    </MoviesSearchContext.Provider>
    )
}