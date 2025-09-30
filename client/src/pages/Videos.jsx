import React, {createContext, useState } from "react";

/* Components */
// import SearchBar from '../components/SearchBar';
// import VideosTable from "../components/VideosTable";

// context for movie search params
export const VideosSearchContext = createContext();

export default function Videos() {
    const [ searchURL, setSearchURL ] = useState(`${localStorage.API_URL}/videos/search?`);

    return (
    <VideosSearchContext.Provider value={[searchURL, setSearchURL]}>
        <div className="container videos">
            {/* <SearchBar /> */}
            {/* <VideosTable /> */}
        </div>
    </VideosSearchContext.Provider>
    )
}