import { useState, useEffect} from "react";

export default function VideoTranscriber() {
    const convert_api = `${localStorage.API_URL}/videos/convert/`;

    const [youtubeUrl, setYoutubeUrl] = useState('');

    const handleChange = (event) => {
        const value = event.target.value;
        setYoutubeUrl(value);
    };

    const handleClick = (event) => {
        event.preventDefault();
        
        if (youtubeUrl.length > 0) {
            fetch(convert_api, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify({ video: {url: youtubeUrl} }),
            })
            .then((res) => res.json())
            .then((data) => {
                setVideoData({
                    title: data.title,
                    imgURL: data.thumbnail,
                    length: secondsToTimeString(data.length)
                });
            });
        }
        else {
            updateSearchURL(base_url);
            setSearchParams();
        }
    }


    return (
    <div className="search-bar">
        <form className="search-form" id="search-form">
            <label htmlFor="url">YouTube Video URL</label>
            <input
                id="url"
                name="url"
                type="text"
                value={youtubeUrl}
                onChange={handleChange}
            />
            <div className="submit-container">
            {
                youtubeUrl.length > 0 ? <button  type="button" onClick={handleClick}>
                Download Videos</button> : 
                <button id="search-button" type="button" disabled="true">
                    Download Videos</button>
            }            
            </div>            
        </form>
    </div>
    );
}
  