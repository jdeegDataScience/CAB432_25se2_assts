import { useState, useEffect, useContext } from "react";

// import context provider
import { PuzzlesSearchContext } from '../pages/Puzzles';

export default function SearchBar() {
    const base_url = `${localStorage.API_URL}/puzzles/solve
    `;
    const [ searchURL, setSearchURL ] = useContext(PuzzlesSearchContext);
    const [ searchParams, setSearchParams ] = useSearchParams();

    const [inputs, setInputs] = useState({title:'', year:''});
    const yearPattern = new RegExp("^[0-9]{4,4}$");
    const [ yearValid, setYearValid ] = useState(true);

    const updateSearchURL = (new_url) => {
        setSearchURL(new_url);
    }

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}));
    };

    const handleClick = (event) => {
        event.preventDefault();
        setSearchParams(inputs);
        
        if (inputs.title.length > 0 || inputs.year.length > 0) {
            updateSearchURL(`${base_url}title=${inputs.title.replaceAll(' ', "%20")}&year=${inputs.year}`);}
        else {
            updateSearchURL(base_url);
            setSearchParams();
        }
    }

    useEffect(() => {
        if (yearPattern.test(inputs.year) ) {
            setYearValid(true)
        }
        else { 
            switch (inputs.year) {
                case null :
                case undefined :
                case '' : 
                    setYearValid(true);
                    break;
                default :
                setYearValid(false);
            }
        }
    }, [inputs.year])

    return (
    <div className="search-bar">
        <form className="search-form" id="search-form">
            <label htmlFor="title">Puzzle Title</label>
            <input
                id="title"
                name="title"
                type="text"
                value={inputs.title}
                onChange={handleChange}
            />
            <label htmlFor="year">Release Year (YYYY)</label>
            <input
                id="year"
                name="year"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{4}"
                value={inputs.year}
                onChange={handleChange}
            />
            <div className="submit-container">
            {
                yearValid ? <button  type="button" onClick={handleClick}>
                Search Puzzles</button> : 
                <button id="search-button" type="button" disabled="true">
                    Search Puzzles</button>
            }            
            </div>            
        </form>
    </div>
    );
}
  