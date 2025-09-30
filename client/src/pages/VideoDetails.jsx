/* import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css"; */

/* import Components */
/* import FeatureVideo from "../components/FeatureVideo";

export default function VideoDetails() {
    const params = useParams();
    const searchURL = `${localStorage.API_URL}/videos/${params.videoID}`;
    const [ title, setTitle ] = useState('Loading...');
    const [ runTime, setRunTime ] = useState();
    const navigate = useNavigate();    

    useEffect(() => {
        fetch(searchURL)
        .then((res) => res.json())
        .then((data) => {
            setTitle(data.title);
            setRunTime(data.runtime);
        })
        .catch(() => console.log(params.videoID));                   
    }, []);

    return (
        <div className="container videos">
            <h2>{title}</h2>
            <div className="video-details">
                <div className="video-production">
                    <p>Name: {title}</p>
                    <p>Length: {runTime}</p>
                </div>
            </div>
            <div className="videos-table-wrapper">
                <FeatureVideo videoID={params.imdbID}/>
            </div>
        </div>
    )
} */