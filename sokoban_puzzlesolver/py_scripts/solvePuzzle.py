import sys
import json
# with these files
from sokoban import Warehouse
from mySokobanSolver import solve_weighted_sokoban

def main():
    if len(sys.argv) < 2:
        print("Missing puzzle filename", file=sys.stderr)
        sys.exit(1)

    filename = sys.argv[1]
    warehouse = Warehouse()
    warehouse.load_warehouse(filename)

    answer, cost = solve_weighted_sokoban(warehouse)

     # Emit clean JSON for Node
    result = {
        "cost": cost,
        "solution": answer  # assuming `answer` is already a list of moves
    }
    print(json.dumps(result))

if __name__ == "__main__":
    main()