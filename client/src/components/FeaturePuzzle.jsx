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
        if (presignedURL?.length > 0) {
            // Fetch the actual file from S3
            const fileResponse = await fetch(presignedURL);
            const blob = await fileResponse.blob();

            // Create a temp object URL and trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${downloadParams.puzzleId}.gif`; // You can set your preferred filename
            document.body.appendChild(a);
            a.click();

            // Cleanup
            a.remove();
            window.URL.revokeObjectURL(url);
        };
        return;
    }

    return (
        <div className="featured-puzzle">
            <form onSubmit={handleSubmit} className="download-form">
                <label for="download-select">Choose a {downloadParams.name} File to  Download:</label>
                <select name="downloadTarget" id="download-select">
                    <option value="">--Please choose an option--</option>
                    <option value="warehouses">Warehouse Puzzle File</option>
                    <option value="solutions">Solution Moves</option>
                    <option value="gifs">Solution GIF</option>
                </select>
                <div className="submit-container">
                    <button type="submit" id="submit-button">Download</button>
                </div>
            </form>
        </div>
    )
}