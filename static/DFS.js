const GOAL_STATE = ["1", "2", "3", "4", "5", "6", "7", "8", "0"]

let solved = false;
let used = new Map();
let traversed = 0;
let ans = [];

function valid(i) {
  return i >= 0 && i < 9;
}

function solve(currState, maxDepth, currDepth, path) {
  used.set(currState, true);
  traversed++;

  let currStateArr = currState.split(",");
  if (currStateArr.every((val, idx) => val === GOAL_STATE[idx])) {
    solved = true;
    finalPath = path.slice();
    ans = [currDepth, finalPath, traversed];
    return ans;
  }

  if (currDepth === maxDepth) {
    return;
  }

  let zeroIdx = currStateArr.indexOf("0"); 

  nextStates = []
  for (let i = 0; i < 4; i++) {
    if (i === 0) {
      if (valid(zeroIdx-3)) {
        nextState = currStateArr.slice();
        nextState[zeroIdx] = nextState[zeroIdx-3];
        nextState[zeroIdx-3] = "0";
        nextStates.push(nextState)
      }
    } else if (i === 1) {
      if (zeroIdx%3 !== 2) {
        nextState = currStateArr.slice();
        nextState[zeroIdx] = nextState[zeroIdx+1];
        nextState[zeroIdx+1] = "0";
        nextStates.push(nextState);
      }
    } else if (i === 2) {
      if (valid(zeroIdx+3)) {
        nextState = currStateArr.slice();
        nextState[zeroIdx] = nextState[zeroIdx+3];
        nextState[zeroIdx+3] = "0";
        nextStates.push(nextState)
      }
    } else {
      if (zeroIdx%3 !== 0) {
        nextState = currStateArr.slice();
        nextState[zeroIdx] = nextState[zeroIdx-1];
        nextState[zeroIdx-1] = "0";
        nextStates.push(nextState);
      }
    }
  }

  for (let state of nextStates) {
    if (used.get(state.toString()) === undefined) {
      path.push(state);
      let nextDepth = currDepth+1;
      solve(state.toString(), maxDepth, nextDepth, path);
      path.pop(); 

      if (solved) return ans;
    }
  }
}

function DFS(initialState) {
  const timeStart = new Date();

  console.log("Performing Traversal...");
  let depth = -1;
  let res = null;
  while (!solved) {
    used.clear();
    traversed = 0;
    depth++;
    res = solve(initialState, depth, 0, []);
  }

  console.log(res[1]);

  console.log("Backtracking Path...");
  let moves = [];
  let currentMoveIdx = -1;
  let nextMoveIdx = 0;
  while (nextMoveIdx < res[1].length) {
    let curr = null;
    if (currentMoveIdx === -1) {
      curr = initialState.split(",");
    } else {
      curr = res[1][currentMoveIdx];
    }

    let next = res[1][nextMoveIdx];
    let currZeroIdx = curr.indexOf("0");
    let nextZeroIdx = next.indexOf("0");
    if (nextZeroIdx > currZeroIdx) {
      if (nextZeroIdx-currZeroIdx === 3) {
        moves.push("up");
      } else {
        moves.push("left");
      }
    } else {
      if (currZeroIdx-nextZeroIdx === 3) {
        moves.push("down");
      } else {
        moves.push("right");
      }
    }

    currentMoveIdx++;
    nextMoveIdx++;
  }

  const timeFinish = new Date();
  return [moves, res[2], (timeFinish-timeStart)];
}

self.onmessage = function(e) {
  const initialState = e.data;

  const res = DFS(initialState);

  self.postMessage(res);
};