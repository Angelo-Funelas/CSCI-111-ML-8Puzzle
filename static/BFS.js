class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class Queue {
  constructor() {
    this.front = null;
    this.rear = null;
    this.size = 0;
  }

  push(value) {
    const newNode = new Node(value);
    
    if (this.rear === null) {
      this.front = this.rear = newNode;
    } else {
      this.rear.next = newNode;
      this.rear = newNode;
    }
    this.size++;
  }

  pop() {
    if (this.empty()) {
      return "Queue is empty";
    }
    
    const value = this.front.value;
    this.front = this.front.next;
    
    if (this.front === null) {
      this.rear = null;
    }
    
    this.size--;
    return value;
  }

  peek() {
    if (this.empty()) {
      return "Queue is empty";
    }
    return this.front.value;
  }

  empty() {
    return this.front === null;
  }

  size() {
    return this.size;
  }

  print() {
    let current = this.front;
    const elements = [];
    while (current) {
      elements.push(current.value);
      current = current.next;
    }
    console.log(elements);
  }
}

const GOAL_STATE = ["1", "2", "3", "4", "5", "6", "7", "8", "0"]

let adj = Array.from({ length: 9 }, () => []);

function valid(i) {
  return i >= 0 && i < 9;
}

function solve(initialState) {
  q = new Queue();
  used = new Map();
  d = new Map();
  p = new Map();

  q.push(initialState);
  used.set(initialState, true);
  d.set(initialState, 0);
  p.set(initialState, -1);
  let traversed = 0;
  while (!q.empty()) {
    traversed++;
    currentState = q.front.value.split(",");

    if (currentState.every((val, idx) => val === GOAL_STATE[idx])) {
      break;
    }
    q.pop();

    let zeroIdx = -1;
    for (let i = 0; i < 9; i++) {
      if (currentState[i] === "0") {
        zeroIdx = i;
        break;
      }
    }

    nextStates = []
    for (let i = 0; i < 4; i++) {
      if (i === 0) {
        if (valid(zeroIdx-3)) {
          nextState = currentState.slice();
          nextState[zeroIdx] = nextState[zeroIdx-3];
          nextState[zeroIdx-3] = "0";
          nextStates.push(nextState)
        }
      } else if (i === 1) {
        if (zeroIdx%3 !== 2) {
          nextState = currentState.slice();
          nextState[zeroIdx] = nextState[zeroIdx+1];
          nextState[zeroIdx+1] = "0";
          nextStates.push(nextState);
        }
      } else if (i === 2) {
        if (valid(zeroIdx+3)) {
          nextState = currentState.slice();
          nextState[zeroIdx] = nextState[zeroIdx+3];
          nextState[zeroIdx+3] = "0";
          nextStates.push(nextState)
        }
      } else {
        if (zeroIdx%3 !== 0) {
          nextState = currentState.slice();
          nextState[zeroIdx] = nextState[zeroIdx-1];
          nextState[zeroIdx-1] = "0";
          nextStates.push(nextState);
        }
      }
    }

    for (let state of nextStates) {
      if (used.get(state.toString()) === undefined) {
        used.set(state.toString(), true);
        q.push(state.toString());
        d.set(state.toString(), d.get(currentState.toString())+1);
        p.set(state.toString(), currentState.toString()); 
      }
    }
  }

  return [d, p, traversed];
}

function BFS(initialState) {
  const timeStart = new Date();

  console.log("Performing Traversal...");
  const res = solve(initialState);

  console.log("Backtracking Path...");
  let path = [GOAL_STATE.toString()];
  let currState = res[1].get(GOAL_STATE.toString());
  while (currState !== initialState) {
    path.push(currState);
    currState = res[1].get(currState);
  }
  path.reverse();
  const timeFinish = new Date();
  return [path, res[2], (timeFinish-timeStart)];
}

self.onmessage = function(e) {
  const initialState = e.data;

  const res = BFS(initialState);

  self.postMessage(res);
}