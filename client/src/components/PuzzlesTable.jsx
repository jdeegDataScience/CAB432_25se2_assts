import { useState, createContext } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([ AllCommunityModule ]);
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";

// context for movie search params
export const PuzzlesDownloadContext = createContext();

/* Components */
import FeaturePuzzle from "../components/FeaturePuzzle";
const API_URL = `${localStorage.API_URL}/puzzles?page=`; // default page 1
import ErrorAlert from "./ErrorAlert";

export default function PuzzlesTable() {
    const [ downloadParams, setDownloadParams ] = useState({});
    const userEmail = localStorage.userEmail;
    const [ selectedRow, setSelectedRow ] = useState('');
    const [ error, setError ] = useState(null);
    const columns= [
        {field: "id",  hide: true}, // valueGetter: "node.data.id",
        {field: "userId",  hide: true}, // width: "110px"},valueGetter: "node.data.userId",
        {field: "name", flex: 2} ,
        {field: "cost", flex: 1},
        {field: "status", flex: 1},
        {field: "uploaded", flex: 1}
    ];
    const blockSize = 10;

    const onRowSelected = (e) => {
        if (e.node.isSelected() && e.node.data.status == "solved") {
            setSelectedRow(e.node.data.id);
            setDownloadParams({
                "puzzleId": e.node.data.id,
                "userId": e.node.data.userId,
                "name": e.node.data.name
            });
        }
    };

    const rowSelection =  {
        mode: 'singleRow',
        checkboxes: false,
        enableClickSelection: true
    };

    const getRowId = (params) => params.data.id;
    
    const gridOptions = {
        columnDefs: columns,
        getRowId: getRowId,
        rowBuffer: 2,
        rowModelType: "infinite",
        cacheBlockSize: blockSize,
        cacheOverflowSize: 2,
        maxConcurrentDatasourceRequests: 1,
        infiniteInitialRowCount: 12,
        maxBlocksInCache: 10,
        rowSelection: rowSelection,
        onRowSelected: onRowSelected
    };

    const onGridReady = (params) => {
        let thisTotalPuzzles = 0;
        const dataSource = {
            rowCount: undefined,
            getRows: (params) => {
                let currPage = Math.floor(params.endRow / blockSize);
                                
                fetch(`${API_URL}${currPage}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.bearerToken}`
                    }
                })
                .then((res) => res.json())
                .then((results) => {
                    thisTotalPuzzles = results.pagination.total;
                    
                    return (results.data.map((puzzle) => ({
                        id: puzzle.id,
                        userId: puzzle.user,
                        name: puzzle.name,
                        cost: puzzle.cost,
                        status: puzzle.status,
                        uploaded: puzzle.ts
                        })
                    ));
                })
                .then(newPuzzles => {
                    if (newPuzzles?.length) {                        
                        params.successCallback(newPuzzles, thisTotalPuzzles);
                        if (params.startRow == 0) {
                            setSelectedRow([newPuzzles[0].id]);                       
                        }
                    }
                    else params.failCallback();
                })
                .catch((e) => {
                    console.log(e);
                    setError(e.message);
                });
            },
        };
        params.api.setGridOption("datasource", dataSource);
    };

    if (error) { return <ErrorAlert errorState={error} dismissError={() => {setError(null);}} />}
    return (
        <PuzzlesDownloadContext.Provider value={[downloadParams, setDownloadParams]}>   
            <div className="puzzles-table-wrapper">
                <div className="puzzle-panel">
                    <FeaturePuzzle />
                </div>
                <div className="ag-theme-material" style={{ height: "100%", width: "100%"}}>
                    <AgGridReact key={userEmail} gridOptions={gridOptions} onGridReady={onGridReady}/>
                </div>
            </div>
        </PuzzlesDownloadContext.Provider>
        
    )
}