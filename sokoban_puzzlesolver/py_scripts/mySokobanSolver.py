
'''
This module implements a solver for the Sokoban puzzle.
It contains the class SokobanPuzzle, which is a subclass of search.Problem
and implements the interface required by search.py
It contains the functions:
    taboo_cells(warehouse)
    check_elem_action_seq(warehouse, action_seq)
    solve_weighted_sokoban(warehouse)
'''

# You have to make sure that your code works with 
# the files provided (search.py and sokoban.py) as your code will be tested 
# with these files
import search 
import sokoban
from copy import deepcopy

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


def taboo_cells(warehouse):
    '''  
    Identify the taboo cells of a warehouse. A "taboo cell" is by definition
    a cell inside a warehouse such that whenever a box is pushed there 
    the puzzle becomes unsolvable. 
    Cells outside the warehouse are not taboo. 
    
    Taboo cells are defined according to two rules:
     Rule 1: if a cell is a corner and not a target, then it is a taboo cell.
     Rule 2: all the cells between two corners along a wall are taboo
         if none of them are a target.
    
    @param warehouse: 
        a Warehouse object with the worker inside the warehouse

    @return
       A string representing the warehouse with only the wall cells marked with 
       a '#' and the taboo cells marked with a 'X'.  
       The returned string should NOT have marks for the worker, the targets,
       and the boxes.  
    '''
    # convert to nested array of string, elements as chars and lines as sets
    wh = warehouse.copy()  # create a clone of the warehouse
    
    # Convert warehouse to a list of lists of characters
    warehouse_lines = str(wh).split('\n')
    warehouse = [[char for char in line] for line in warehouse_lines]

    #Find corner positions
    corner_positions = set()
    for row in range(1, wh.nrows-1): # first and last rows cannot contain internal warehouse cells
        boundaries = sorted(filter(lambda p: p[1] == row, wh.walls))
        left_boundary = boundaries[0][0]
        right_boundary = boundaries[-1][0]
        for col in range(left_boundary+1, right_boundary):
           if (col, row) not in wh.targets:
               isNotWall = (col, row) not in wh.walls
               isAgainstWall = (col-1, row) in wh.walls or (col+1, row) in wh.walls
               isAgainstCeiling = (col, row-1) in wh.walls
               isAgainstFloor = (col, row+1) in wh.walls
               
               if isNotWall and isAgainstWall and (isAgainstCeiling or isAgainstFloor):
                   corner_positions.add((col, row))
    
    # Mark corner positions with an X
    for corner in corner_positions:
        warehouse[corner[1]][corner[0]] = "X"
                        
    # filter corner_positions for same column values
    for col in range (1, wh.ncols-1):
        # order in ascending [row] value, so can check between consecutive corners
        col_corners = sorted(filter(lambda p: p[0] == col, corner_positions))
        
        # check columns containing at least 1 pair of corners
        if len(col_corners) < 2:
            continue
        
        # iterate between rows from corner1:corner(n); corner(n) == len() - 1 (0 index and check (n) with (n-1))
        for corner in range(len(col_corners)-1):
            this_corner = col_corners[corner]
            next_corner = col_corners[corner+1]
            
            # control var
            isTargetOrWall = False
            counterWallLeft = 0
            counterWallRight = 0
            
            # iterate between rows from this_corner:next_corner
            for row in range(this_corner[1], next_corner[1]+1):
                # check for any walls or targets; if yes continue
                if (col, row) in wh.targets or (col, row) in wh.walls:
                        isTargetOrWall = True
                        break
                # check continuous wall on left
                elif warehouse[row][col-1] == '#':
                        counterWallLeft += 1
                # check continuous wall on right
                elif warehouse[row][col+1] == '#':
                        counterWallRight += 1
                else: continue
                
        
            # if there is a target or wall between corners
            if isTargetOrWall: continue
        
            # check if cells between corners are along continuous wall
            elif len(range(this_corner[1], next_corner[1]+1)) == (counterWallLeft or counterWallRight):
                for row in range(this_corner[1]+1, next_corner[1]):
                    warehouse[row][col] = 'X'
                    
            else: continue # corners do not form a pair along continuous wall
                      
    # filter corner_positions for same row values
    for row in range (1, wh.nrows-1):
        # order in ascending [row] value to check between consecutive corners
        row_corners = sorted(filter(lambda p: p[1] == row, corner_positions))
        
        # check columns containing at least 1 pair of corners
        if len(row_corners) < 2:
            continue
        
        # iterate between rows from corner1:corner(n);
        # corner(n) == len() - 1 (0 index and check (n) with (n-1))
        for corner in range(len(row_corners)-1):
            this_corner = row_corners[corner]
            next_corner = row_corners[corner+1]
            
            # control var
            isTargetOrWall = False
            counterCeiling = 0
            counterFloor = 0
            
            # iterate between columns from this_corner:next_corner
            for col in range(this_corner[0], next_corner[0]+1):
                # check for any walls or targets; if yes continue
                if (col, row) in wh.targets or (col, row) in wh.walls:
                        isTargetOrWall = True
                        break
                # check continuous wall on left
                elif warehouse[row-1][col] == '#':
                        counterCeiling += 1
                # check continuous wall on right
                elif warehouse[row+1][col] == '#':
                        counterFloor += 1
                else: continue
                
        
            # if not walls or targets
            # check which walls are adjacent to corners (col-1 or col+1)
            if isTargetOrWall: continue
            
            # if cells between corners run along continuous floor/ceiling
            elif len(range(this_corner[0], next_corner[0]+1)) == (counterCeiling or counterFloor):
                for col in range(this_corner[0]+1, next_corner[0]):
                    warehouse[row][col] = 'X'
                    
            else: continue # corners do not form a pair along continuous floor/ceiling

  
    # Convert warehouse back to a string
    # Return it with walls and taboo cells marked
    warehouse_str = '\n'.join([''.join(line) for line in warehouse])
    warehouse_str = ''.join([' ' if c not in ('X', '#', '\n') else c for c in warehouse_str])

    return warehouse_str
                                                                               

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class SokobanPuzzle(search.Problem):
    '''
    Implements abstract base class search.Problem, 
    which defines the interface for search.py
    An instance of the class 'SokobanPuzzle' represents a Sokoban puzzle.
    An instance contains information about the walls, targets,
    boxes and weights, worker, and taboo cells.
    
    '''
    
    def copy(self, initial_state, worker = None, boxes = None):
        '''
        Return a clone of this puzzle. 
        Possibly with new positions for the worker and the boxes 
        if the values of these parameters are not 'None'.
        All parameters should be None or tuples
        @param
            worker : a (x,y) tuple, position of the agent
            boxes : dictionary with integers as keys and lists as values.
            Lists contain [weight, (x,y)] pairs, the weight and positions of the boxes.
            
        Used in the base case when a puzzle has been initialised without
        a parent state to inherit from. Set the puzzle.initial attribute, 
        which is not set in puzzle.from_warehouse().
        '''
        clone = SokobanPuzzle()
        clone.goal = initial_state.goal
    
        # dynamic elements in the puzzle
        # base case: generating puzzle.initial in solve_weighted_sokoban()
        clone.worker_pos = worker or initial_state.worker_pos
        # if boxes haven't moved, save memory and ref parent.boxes
        clone.boxes = boxes or initial_state.boxes
        
        # static elements of state
        clone.targets_pos = initial_state.targets_pos
        clone.walls_pos = initial_state.walls_pos
        clone.width = initial_state.width
        clone.height = initial_state.height
        clone.taboo = initial_state.taboo
        clone.initial = initial_state
    
        return clone
    
    def __init__(self, puzzle = None, goal=None):
        '''
        Parameters
        ----------
        puzzle : TYPE, optional
            DESCRIPTION. The default is None. Default only used in base case, 
            when attributes of problem instance are set from a warehouse object.
            
        goal : TYPE, optional
            DESCRIPTION. The default is None.

        Returns
        -------
        None.

        '''
        
        if puzzle != None:
            # static elements of state
            self.initial = puzzle
            self.moves = puzzle.moves
            self.goal = puzzle.goal
            self.targets_pos = puzzle.targets_pos
            self.walls_pos = puzzle.walls_pos
            self.width = puzzle.width
            self.height = puzzle.height
            self.taboo = puzzle.taboo
            
            # dynamic elements of state; assigned new objects in SP.results()
            self.worker_pos = puzzle.worker_pos
            self.boxes = puzzle.boxes
            
        else: 
            # Moves Dictionary
            self.moves = {'Left': (-1, 0), 'Right': (1, 0), 'Up': (0, -1), 'Down': (0, 1)}
            self.goal = goal
        
    def from_warehouse(self, warehouse):
        '''

        Parameters
        ----------
        warehouse : initial state of the puzzle.

        Copies elements of warehouse for state representation.
        Combines warehouse.boxes and warehouse.weights into a dictionary for
        ease of reference and consistency throughout each action and child state.

        '''
        # static state elements
        self.width = warehouse.ncols - 1 
        # Calculate the height of the warehouse
        self.height = warehouse.nrows - 1    
        #Use the walls positions from warehouse object
        self.walls_pos = warehouse.walls 
        #Use the target positions from warehouse object
        self.targets_pos = list(warehouse.targets)
        taboo_warehouse_str = taboo_cells(warehouse)
        lines = taboo_warehouse_str.split(sep='\n')
        self.taboo = list(sokoban.find_2D_iterator(lines, "X"))
        
        # dynamic state elements
        # Use the worker position from warehouse object
        self.worker_pos = deepcopy(warehouse.worker)# Use the box positions from warehouse object
        # get weight and positions of the boxes
        boxes_pos = list(warehouse.boxes)
        box_weights = list(warehouse.weights)
        
        boxes_dict = {}
        for i, box in enumerate(boxes_pos):
            box_num = i + 1
            boxes_dict[box_num] = [box_weights[i], boxes_pos[i]]
        
        # SokobanPuzzle attribute with box positions and weights
        # paired for ease of reference
        self.boxes = boxes_dict
    
    def is_box_pushable(self, new_box_pos):
        '''
        Return: bool
        Checks if box is physically pushable.
        Does not consider legality of push (re: taboo cells)
        '''    
        # Check if the new position is inside the warehouse bounds
        if not ((0 < new_box_pos[0] < self.width) and (0 < new_box_pos[1] < self.height)):
           return False
       
        self_boxes_pos = [v[1] for k, v in self.boxes.items()]
       
        # If the new box position is a wall or another box, it's not pushable
        if new_box_pos not in self.walls_pos and new_box_pos not in self_boxes_pos:
            return True
        
        return False    
    
    def is_valid_action(self, worker_pos, action):
         '''
         Check if the given action is valid, given the current state.
         '''
         # Check if the action is admissable instruction
         if action not in self.moves:
             return False
        
         # Get the new position of the worker after taking the action
         dx, dy = self.moves[action]
         new_worker_pos = (worker_pos[0] + dx, worker_pos[1] + dy)
        
         # Check if the new position is inside the warehouse bounds
         if not (0 <= new_worker_pos[0] < self.width and 0 <= new_worker_pos[1] < self.height):
             return False
        
         # Check if the new position is a wall
         if new_worker_pos in self.walls_pos:
             return False
        
         # obtain box positions from boxes dictionary
         self_boxes_pos = [v[1] for k, v in self.boxes.items()]
         
         # If action pushes a box, check push a valid (not necessarily legal) 
         if new_worker_pos in self_boxes_pos:
             new_box_pos = (new_worker_pos[0] + dx, new_worker_pos[1] + dy)
             # true/valid if pushable, false/invalid if not
             return self.is_box_pushable(new_box_pos)
        
         return True    

    def actions(self, state):
        ''' Set of LEGAL actions in current state; won't make puzzle impossible to solve '''
        actions = []
        
        # Loop through each direction and check if it's a valid move
        for action in self.moves:
            dx, dy = self.moves[action]
            
            # check if action would place worker in a valid cell
            if state.is_valid_action(state.worker_pos, action):
                # if valid action, check potential box push is LEGAL
                state_boxes_pos = [v[1] for k, v in state.boxes.items()]
                
                # obtain new worker position after action
                new_worker_pos = (state.worker_pos[0] + dx, state.worker_pos[1] + dy)
                
                # If pushing a box, check box isn't pushed into taboo cell
                if new_worker_pos in state_boxes_pos:                    
                    # obtain new box position
                    new_box_pos = (new_worker_pos[0] + dx, new_worker_pos[1] + dy)
                    if new_box_pos not in state.taboo:
                        # Not taboo: add the action to the list of actions
                        actions.append(action)
                    else: 
                        continue
                else:
                    # If the worker is not pushing a box
                    # add the move action to the list of actions
                    actions.append(action)       
        return actions
        

    def result(self, state, action):
        '''Return the new state that results from applying the given action to the
        given state.
        '''
        # action and resulting worker position
        dx, dy = self.moves[action]
        new_worker_pos = (state.worker_pos[0] + dx, state.worker_pos[1] + dy)
        
        # initialise new state resulting from action
        new_state = SokobanPuzzle(state)
        
        # obtain box positions from boxes dictionary
        parent_box_pos = [v[1] for k, v in state.boxes.items()]
        
        if new_worker_pos in parent_box_pos:
            new_boxes = deepcopy(state.boxes)
            # get new box position
            new_box_pos = (new_worker_pos[0] + dx, new_worker_pos[1] + dy)
            
            # find box key in parent.boxes
            keys = [k for k, v in state.boxes.items() if v[1] == new_worker_pos]
            box_key = keys[0]
            
            # update box position in deepcopied dictionary
            new_boxes[box_key][1] = new_box_pos
            
            
            # assign updated boxes to new_state
            new_state.boxes = new_boxes
            # assign new worker_pos to new_state
            new_state.worker_pos = new_worker_pos
            
           
        else:
            # assign new worker_pos to new_state
            new_state.worker_pos = new_worker_pos
            
        
        return new_state

    def goal_test(self, state):
        ''' Check if all targets have a box on them'''
        
        state_box_pos = [v[1] for k, v in state.boxes.items()]
        
        for target in state.targets_pos:
            if target not in state_box_pos:
                return False
        
        return True
    
        
    def path_cost(self, parent_path_cost, parent_state, action, child_state):
        """Return the cost of a solution path that arrives at state2 from
        state1 via action, assuming cost c to get up to state1.
        The default method costs 1 for every step in the path.
        If the worker in the child state is in the position of a box in 
        the parent state, the box cost is added to the child state path cost. """        
        child_worker = child_state.worker_pos
        parent_box_pos = [v[1] for k, v in parent_state.boxes.items()]
        
        # default path_cost
        child_path_cost = parent_path_cost + 1
        # check if the child_state.worker_pos is where a box was in the parent_state
        # if not, path_cost is parent_path_cost + 1
        if child_worker not in parent_box_pos:
            return child_path_cost
        # if worker is now where a box was in parent_state,
        # find box_cost and add to child path cost
        else:
            # default box_cost is zero
            box_cost = 0
            keys = [k for k, v in parent_state.boxes.items() if v[1] == child_worker]
            box_key = keys[0]
            box_cost = parent_state.boxes[box_key][0]
            return child_path_cost + box_cost
    
    
    def __lt__(self, other_node):
        '''
        Returns: bool
        DESCRIPTION: states/puzzles are considered equal if their heuristic 
        value is the same.
        '''
        return isinstance(other_node, search.Node) and self.state.h(self) < other_node.state.h(other_node)
        
    def __eq__ (self, other_state):
        '''
        Returns: bool
        DESCRIPTION: states/puzzles are considered equal if the dynamic elements
        are in the same position.
        '''
        if isinstance(other_state, SokobanPuzzle):
            # extract box positions from self and other_state
            self_boxes_pos = [v[1] for k, v in self.boxes.items()]
            other_boxes_pos = [v[1] for k, v in other_state.boxes.items()]
            
            # compare dynamic elements
            dynamic_elements_self = list(self.worker_pos) + self_boxes_pos
            dynamic_elements_other = list(other_state.worker_pos) + other_boxes_pos
            if dynamic_elements_self == dynamic_elements_other:
                return True
        else: return False
    
    def __hash__(self):
        '''
        Returns: hash value of SokobanPuzzle object.
        Hash value defined by dynamic elements: worker and box positions.
        '''
        # extract box posistions from self.boxes dict
        boxes_pos = tuple(tuple(v[1]) for k, v in self.boxes.items())
        return hash((tuple(self.worker_pos), boxes_pos))

    def __str__(self):
        '''
        Return a string representation of the puzzle
        '''

        X,Y = zip(*self.walls_pos) # pythonic version of the above; yeah for sure
        x_size, y_size = 1+max(X), 1+max(Y)
        
        vis = [[" "] * x_size for y in range(y_size)]
        # can't use  vis = [" " * x_size for y ...]
        # because we want to change the characters later
        for (x,y) in self.walls_pos:
            vis[y][x] = "#"
        for (x,y) in self.targets_pos:
            vis[y][x] = "."
        # if worker is on a target display a "!", otherwise a "@"
        # exploit the fact that Targets has been already processed
        if vis[self.worker_pos[1]][self.worker_pos[0]] == ".": # Note y is worker[1], x is worker[0]
            vis[self.worker_pos[1]][self.worker_pos[0]] = "!"
        else:
            vis[self.worker_pos[1]][self.worker_pos[0]] = "@"
        # if a box is on a target display a "*"
        # exploit the fact that Targets has been already processed
        boxes_pos = [v[1] for k, v in self.boxes.items()]
        for (x,y) in boxes_pos:
            if vis[y][x] == ".": # if on target
                vis[y][x] = "*"
            else:
                vis[y][x] = "$"
        return "\n".join(["".join(line) for line in vis])
    
    def h(self, n):
        '''
        Parameters
        ----------
        n : Node
            Node being evaluated in the A* search.

        Returns
        -------
        Integer
            The sum of the weighted manhattan distances of each box to it's 
            nearest target.

        '''
        # empty list to hold the minimum weighted distance for each box
        boxes_to_targets = []
        
        # iterate through boxes in node state.boxes dict
        for k, box in n.state.boxes.items():
            box_pos = box[1]
            box_weight = box[0]
            if box_pos not in n.state.targets_pos:
                box_min_dist = min([abs(box_pos[0] - target[0]) + abs(box_pos[1] - target[1]) for target in n.state.targets_pos])
                boxes_to_targets.append(box_min_dist + box_min_dist * box_weight)
        # calculate the heuristic as the sum of the manhattan distances between each box and its nearest target
        return sum(boxes_to_targets)
    



# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

def check_elem_action_seq(warehouse, action_seq):
    '''
    
    Determine if the sequence of actions listed in 'action_seq' is legal or not.
    
    Important notes:
      - a legal sequence of actions does not necessarily solve the puzzle.
      - an action is legal even if it pushes a box onto a taboo cell.
        
    @param warehouse: a valid Warehouse object

    @param action_seq: a sequence of legal actions.
            For example, ['Left', 'Down', Down','Right', 'Up', 'Down']
           
    @return
        The string 'Impossible', if one of the action was not valid.
            For example, if the agent tries to push two boxes at the same time,
                        or push a box into a wall.
        Otherwise, if all actions were successful, return                 
                A string representing the state of the puzzle after applying
                the sequence of actions.  This must be the same string as the
                string returned by the method  Warehouse.__str__()
    '''
    # initialise puzzle
    puzzle = SokobanPuzzle()
    
    # set problem instance from warehouse attributes
    puzzle.from_warehouse(warehouse)
    
    # assign initial 'state' of puzzle to puzzle.initial attribute using the
    # custom copy method
    puzzle.initial = puzzle.copy(puzzle)
    
    for action in action_seq:
        # if the action is valid, apply it to the puzzle state
        if puzzle.is_valid_action(puzzle.worker_pos, action):
            puzzle = puzzle.result(puzzle, action)  # update state
        else:
            return 'Impossible'
    
    return str(puzzle)


# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

def solve_weighted_sokoban(warehouse):
    '''
    This function analyses the given warehouse.
    It returns the two items. The first item is an action sequence solution. 
    The second item is the total cost of this action sequence.
    
    @param 
     warehouse: a valid Warehouse object

    @return
    
        If puzzle cannot be solved 
            return 'Impossible', None
        
        If a solution was found, 
            return S, C 
            where S is a list of actions that solves
            the given puzzle coded with 'Left', 'Right', 'Up', 'Down'
            For example, ['Left', 'Down', Down','Right', 'Up', 'Down']
            If the puzzle is already in a goal state, simply return []
            C is the total cost of the action sequence C
    '''


    # initialise puzzle
    puzzle = SokobanPuzzle()
   
    # set problem instance from warehouse attributes
    puzzle.from_warehouse(warehouse)
    
    # assign initial 'state' of puzzle to puzzle.initial attribute using the
    # custom copy method
    puzzle.initial = puzzle.copy(puzzle)
    
    solution_node = search.astar_graph_search(puzzle)
    if solution_node is None:
        return 'Impossible', None
    else:
        return solution_node.solution(), solution_node.path_cost
    

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

