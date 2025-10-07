import { useState } from "react";

export default function SearchBar() {
    const base_url = `${localStorage.API_URL}/puzzles/solve`;
    const [file, setFile] = useState<File | null>(null);
    const [isFileUploaded, setIsFileUploaded] = useState(false);

    const handleFileInput = (e) => {
        const files = e.currentTarget.files
        if(files) {
            setFile(files[0])
            // show success message on file upload
            setIsFileUploaded(true)
        }
    };
    const handleClick = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (file) {
             try {
                formData.append('file', file);
                const response = await fetch(base_url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${localStorage.bearerToken}`
                    },
                    body: formData
                });
                console.log(response);
                setFile(null);
                document.getElementById("puzzle-form").reset();
                // show success message on file upload
                setIsFileUploaded(false);
                alert("Puzzle solved and saved successfully!");
            } catch (error) {
                console.error(error);
            };
        };
    };

    return (
        <div className="puzzle-bar">
            <form className="puzzle-form" id="puzzle-form">
                <h2>Upload a Puzzle File to Solve</h2>
                {isFileUploaded ? null : <p>Please upload a valid warehouse puzzle file (.txt)</p>}
                <label htmlFor="dropzone-file" className={`upload-label ${isFileUploaded ? 'file-uploaded' : ''}`}>
                    {isFileUploaded ? 'File Uploaded Successfully!' : 'Click to upload a file'}
                </label>
                <input id="dropzone-file" type="file" className="hidden" accept='.txt' required onChange={handleFileInput}/>

                <div className="submit-container">
                {
                    isFileUploaded ? <button  type="button" onClick={handleClick}>
                    Solve & Save</button> : 
                    <button id="puzzle-button" type="button" disabled="true">
                        Waiting for upload!</button>
                }            
                </div>            
            </form>
        </div>
    );
}
  