import { useContext } from "react";

// import context provider
import { PuzzlesDownloadContext } from './PuzzlesTable';

export default function FeaturePuzzle() {
    const [ downloadParams, setDownloadParams ] = useContext(PuzzlesDownloadContext);

    const handleSubmit = async (e) => {
        // Prevent the browser from reloading the page
        e.preventDefault();

        // Read the form data
        const form = e.target;
        const formData = new FormData(form);

        // Or you can work with it as a plain object:
        const formJson = Object.fromEntries(formData.entries());
        
        if (!formJson.downloadTarget) {
            alert("Please select a file type to download.");
            return;
        }
        const searchParams = new URLSearchParams(downloadParams);
        searchParams.append('target', formJson.downloadTarget);
        const presignedURL = await fetch(`${localStorage.API_URL}/puzzles/download?${searchParams.toString()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.bearerToken}`
                }
            }
        ).then(res => {return res.json();})
        .then(json => {return json.downloadURL})
        .catch((err) => {
            console.error(err.message);
            return null;
        });
        if (presignedURL?.length) {
            fetch(presignedURL);
        };
        return;
    }

    return (
        <div className="featured-puzzle">
            <form onSubmit={handleSubmit} className="download-form">
                <h3>Available Download Files For Puzzle {downloadParams.name}</h3>
                <label>
                    <input type="radio" name="downloadTarget" value="warehouses" />
                    Warehouse Puzzle File
                </label>
                <label>
                    <input type="radio" name="downloadTarget" value="solutions" />
                    Solution Moves
                </label>
                <label>
                    <input type="radio" name="downloadTarget" value="gifs" />
                    Solution GIF
                </label>
                <div className="submit-container">
                    <button type="submit" id="submit-button">Download</button>
                </div>
            </form>
        </div>
    )
}