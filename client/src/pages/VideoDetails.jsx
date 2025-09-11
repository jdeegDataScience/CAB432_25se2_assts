import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";

/* import Components */
import FeatureVideo from "../components/FeatureVideo";

export default function VideoDetails() {
    const params = useParams();
    const searchURL = `${localStorage.API_URL}/videos/${params.videoID}`;
    const [ title, setTitle ] = useState('Loading...');
    const [ year, setYear ] = useState();
    const [ runTime, setRunTime ] = useState();
    const navigate = useNavigate();    

    useEffect(() => {
        fetch(searchURL)
        .then((res) => res.json())
        .then((data) => {
            setTitle(data.title);
            setYear(data.year);
            setRunTime(data.runtime);
        })
        .catch(() => console.log(params.videoID));                   
    }, []);

    /* const columns = [
    {field: "id", hide: true}, // width: "110px"},
    {field: "name", filter: true, flex: 1 },
    {field: "length", filter: true, width: 120 }
    ];

    const rowSelection =  {
        mode: 'singleRow',
        checkboxes: false,
        enableClickSelection: false
    }; */

    return (
        <div className="container videos">
            <h2>{title} ({year})</h2>
            <div className="video-details">
                <div className="video-production">
                    <p>Name: {title}</p>
                    <p>Length: {runTime}</p>
                    <p>Year: {year}</p>
                </div>
            </div>
            <div className="videos-table-wrapper">
                <FeatureVideo videoID={params.imdbID}/>
                {/* <div className="ag-theme-material">
                <AgGridReact
                    columnDefs={columns}
                    rowData={principals}
                    pagination={true}
                    paginationPageSize={20}
                    rowSelection={rowSelection}
                    onRowSelected={onRowSelected}
                />
                </div> */}
            </div>
        </div>
    )
}