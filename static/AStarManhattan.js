class MinHeap {
  constructor() {
    this.heap = [];
  }

  getLeftChildIndex(parentIndex) {
    return 2 * parentIndex + 1;
  }

  getRightChildIndex(parentIndex) {
    return 2 * parentIndex + 2;
  }

  getParentIndex(childIndex) {
    return Math.floor((childIndex - 1) / 2);
  }

  hasParent(index) {
    return this.getParentIndex(index) >= 0;
  }

  swap(index1, index2) {
    [this.heap[index1], this.heap[index2]] = [
      this.heap[index2],
      this.heap[index1],
    ];
  }

  insert(value) {
    this.heap.push(value);
    this.heapifyUp();
  }

  heapifyUp() {
    let currentIndex = this.heap.length - 1;
    while (
      this.hasParent(currentIndex) &&
      this.heap[currentIndex][0] < this.heap[this.getParentIndex(currentIndex)][0]
    ) {
      this.swap(currentIndex, this.getParentIndex(currentIndex));
      currentIndex = this.getParentIndex(currentIndex);
    }
  }

  removeMin() {
    if (this.heap.length === 0) {
      throw new Error("Heap is empty");
    }
    const minValue = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown();
    return minValue;
  }

  heapifyDown() {
    let currentIndex = 0;
    while (this.getLeftChildIndex(currentIndex) < this.heap.length) {
      let smallerChildIndex = this.getLeftChildIndex(currentIndex);
      if (
        this.getRightChildIndex(currentIndex) < this.heap.length &&
        this.heap[this.getRightChildIndex(currentIndex)][0] <
          this.heap[smallerChildIndex][0]
      ) {
        smallerChildIndex = this.getRightChildIndex(currentIndex);
      }

      if (this.heap[currentIndex][0] < this.heap[smallerChildIndex][0]) {
        break;
      } else {
        this.swap(currentIndex, smallerChildIndex);
      }

      currentIndex = smallerChildIndex;
    }
  }
}

function calcHeuristic(state) {
    state = state.split(",")
    const size = Math.sqrt(state.length)
    let res = 0
    for (let i=0; i<state.length; i++) {
        const cur_tile = parseInt(state[i])-1
        if (cur_tile == -1) continue
        const cur_row = Math.floor(cur_tile/size)
        const cur_col = cur_tile%size
        const target_row = Math.floor(i/size)
        const target_col = i%size
        res += Math.abs(target_row-cur_row)+Math.abs(target_col-cur_col)
    }
    return res
}

function getNextStates(state) {
    const directions = ["up", "down", "left", "right"];
    const result = [];

    for (const dir of directions) {
        const newState = moveState(state, dir);
        if (newState !== null) {
            result.push([newState, dir]);
        }
    }

    return result;
}

function moveState(state, direction) {
    const arr = state.split(","); // split into array of tiles
    const n = Math.sqrt(arr.length);
    if (!Number.isInteger(n)) throw new Error("State length is not a perfect square!");

    const zeroIndex = arr.indexOf("0");
    const row = Math.floor(zeroIndex / n);
    const col = zeroIndex % n;

    let dr = 0, dc = 0;
    switch (direction) {
        case "down":    dr = -1; break;
        case "up":  dr =  1; break;
        case "right":  dc = -1; break;
        case "left": dc =  1; break;
        default: return null;
    }

    const newRow = row + dr;
    const newCol = col + dc;

    if (newRow < 0 || newRow >= n || newCol < 0 || newCol >= n) {
        return null; // invalid move
    }

    const newIndex = newRow * n + newCol;
    [arr[zeroIndex], arr[newIndex]] = [arr[newIndex], arr[zeroIndex]]; // swap

    return arr.join(",");
}

const reversedDir = new Map([["up", "down"],["down", "up"],["left","right"],["right","left"]])

function AStarManhattan(initialState) {
    const timeStart = new Date()
    const queue = new MinHeap()
    const stateMap = new Map();
    let targetState = ""
    let traversed = 0
    for (let i=1; i<initialState.split(",").length; i++) {
        targetState += `${i},`
    }
    targetState+="0"
    function addNode(h, path_cost, state, dir) {
        traversed++
        queue.insert([h+path_cost, state])
        stateMap.set(state, {
            "cost": path_cost,
            "dir": dir,
            "state": state
        })
    }

    // initial node
    const initial_h = calcHeuristic(initialState)
    addNode(initial_h, 0, initialState, null)

    console.log("Performing Traversal...")
    while (queue.heap.length > 0) {
        const current_node = queue.removeMin()
        const current_state = current_node[1]
        if (current_state == targetState) break
        const neighborStates = getNextStates(current_state)
        const path_cost = stateMap.get(current_state).cost
        for (const [state, dir] of neighborStates) {
            const heuristic = calcHeuristic(state)
            const found_better_path = stateMap.has(state) && stateMap.get(state).cost > path_cost+1
            if (!stateMap.has(state) || found_better_path) {
                addNode(heuristic, path_cost+1, state, dir)
            }
        }
    }
    console.log("Backtracking Path...")
    let path = []
    let cur_node = stateMap.get(targetState)
    while (cur_node.state !== initialState) {
        path.push(cur_node.dir)
        const revDir = reversedDir.get(cur_node.dir)
        const nextState = moveState(cur_node.state, revDir)
        cur_node = stateMap.get(nextState)
    }
    path.reverse()
    const timeFinish = new Date()
    return [path, traversed, (timeFinish-timeStart)]
}

self.onmessage = function(e) {
  const initialState = e.data;

  const res = AStarManhattan(initialState);

  self.postMessage(res);
};