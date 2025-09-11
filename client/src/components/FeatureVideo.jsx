import { useState, useEffect } from "react";

export default function FeatureVideo(props) {
    const videoID = props.videoID;
    const [ videoData, setVideoData ] = useState({title:'', imgURL:null, length:''});

    const addDefaultImg = ev => {
        ev.target.src = "../public/default_image.jpg";
    }

    const secondsToTimeString = (lengthSeconds) => {
        const date = new Date(null); // init null Date object
        date.setSeconds(lengthSeconds); // Set seconds to vid.length
        return date.toISOString().substr(11, 8); // Extract the "hh:mm:ss" string
    }
    
    useEffect(() => {
        if (videoID.length > 0) {
            let video_data_url = `${localStorage.API_URL}/videos/data/${videoID}`;
            fetch(video_data_url)
            .then((res) => res.json())
            .then((data) => {
                setVideoData({
                    title: data.title,
                    imgURL: data.thumbnail,
                    length: secondsToTimeString(data.length)
                });
            });
        }
        else {setVideoData({
            title: "Loading search results...",
            imgURL: "../public/loading_image.avif",
            length: "Please wait for result to load."
            })
    }}, [videoID])

    return (
        <div className="featured-video">
            <img src={videoData.imgURL} onError={addDefaultImg}
            alt={ videoData.title + " thumbnail"} />
            <p className="length">{"Length: " + videoData.length}</p>
        </div>
    )
}