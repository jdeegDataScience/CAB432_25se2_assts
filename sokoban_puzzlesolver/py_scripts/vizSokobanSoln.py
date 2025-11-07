#!/usr/bin/env python    
import sys, os, json
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)
from PIL import Image
from sokoban import Warehouse
# move actions 
direction_offset = {'Left' :(-1,0), 'Right':(1,0) , 'Up':(0,-1), 'Down':(0,1)} # (x,y) = (column,row)

# dictionary of images for the display of the warehouse
# Directory of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))
image_dict={
    'wall':Image.open(os.path.join(script_dir, '..', 'public', 'images', 'wall.gif')),
    'target':Image.open(os.path.join(script_dir, '..', 'public', 'images', 'hole.gif')),
    'box_on_target':Image.open(os.path.join(script_dir, '..', 'public', 'images', 'crate-in-hole.gif')),
    'box':Image.open(os.path.join(script_dir, '..', 'public', 'images', 'crate.gif')),
    'worker':Image.open(os.path.join(script_dir, '..', 'public', 'images', 'player.gif')),
    'smiley':Image.open(os.path.join(script_dir, '..', 'public', 'images', 'smiley.gif')),
    'worker_on_target':Image.open(os.path.join(script_dir, '..', 'public', 'images', 'player-in-hole.gif'))
}

#----------------------------------------------------------------------------

#  Global variables
TILE_SIZE = 50  # or whatever your gifs are

#----------------------------------------------------------------------------

def render_frame_pil(warehouse):
    width = warehouse.ncols * TILE_SIZE
    height = warehouse.nrows * TILE_SIZE
    frame = Image.new("RGB", (width, height), (255, 255, 255)) # background color

    # walls
    for x,y in warehouse.walls:
        frame.paste(image_dict['wall'], (x*TILE_SIZE, y*TILE_SIZE))

    # targets
    for x,y in warehouse.targets:
        frame.paste(image_dict['target'], (x*TILE_SIZE, y*TILE_SIZE))

    # boxes
    for x,y in warehouse.boxes:
        if (x, y) != warehouse.worker:
            tile = 'box_on_target' if (x,y) in warehouse.targets else 'box'
            frame.paste(image_dict[tile], (x*TILE_SIZE, y*TILE_SIZE))

    # worker
    wx, wy = warehouse.worker
    if (wx,wy) in warehouse.targets:
        frame.paste(image_dict['worker_on_target'], (wx*TILE_SIZE, wy*TILE_SIZE))
    else:
        frame.paste(image_dict['worker'], (wx*TILE_SIZE, wy*TILE_SIZE))

    return frame

#----------------------------------------------------------------------------

def move_worker(warehouse, direction):
    x,y = warehouse.worker
    dx,dy = direction_offset[direction]
    nx,ny = x+dx,y+dy
    if (nx,ny) in warehouse.walls: return
    if (nx,ny) in warehouse.boxes:
        nnx,nny = nx+dx,ny+dy
        if (nnx,nny) in warehouse.walls or (nnx,nny) in warehouse.boxes: return
        i = warehouse.boxes.index((nx,ny))
        warehouse.boxes[i] = (nnx,nny)
    warehouse.worker = (nx,ny)

# ----------------------------------------------------------------------------

def main():
    if len(sys.argv) < 4:
        print(json.dumps({"error":"Usage: viz_sokoban_refactored.py PUZZLE_FILE SOLUTION_JSON"}), file=sys.stderr)
        sys.exit(1)

    puzzle_path = sys.argv[1]
    # print("DEBUG sys.argv[2]:", sys.argv[2], file=sys.stderr)
    solution = json.loads(sys.argv[2])
    outpath = sys.argv[3]

    warehouse = Warehouse()
    warehouse.load_warehouse(puzzle_path)
    frames = []

    # initial state
    frames.append(render_frame_pil(warehouse))

    # apply solution step by step
    for move in solution:
        move_worker(warehouse, move)     # reuse your move_worker() logic
        frames.append(render_frame_pil(warehouse))
    
    frames[0].save(
        outpath,
        save_all=True,
        append_images=frames[1:],
        duration=350,  # ms per frame
        loop=0
    )
    print(outpath)

if __name__ == "__main__":
    main()
# + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
#                              CODE CEMETARY
# + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 