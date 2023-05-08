class Counter{
	constructor(){
		this.dict=new Map();
	}

	set(k,v){
		this.dict.set(k,v);
	}

	get(k){
		if(this.dict.get(k)==undefined)
			this.dict.set(k,0);
		return this.dict.get(k);
	}

}







class QLearningAgent {
    
    
    constructor(tetris){
    	this.tetris=tetris;
    	this.epsilon=1
    	this.alpha=0.5
    	this.gamma=1;
        this.values=new Counter();

    }

    getLegalActions(){
    	return isLegal?this.tetris.getLegalActions():this.tetris.getDecentActions();
    }
    
    getQValue( state, action){
        
		return this.values.get({state: state,action: action});
    }
    computeValueFromQValues( state){
        

        let maxV = Number.MAX_VALUE;
        this.getLegalActions(state).forEach(a => {
            if(maxV<this.getQValue(state, a)){
                maxV=this.getQValue(state, a)
            }
        });

        if(maxV == Number.MAX_VALUE){
            return 0
        }
        return maxV


    }
    computeActionFromQValues( state){
        

    
        let best=[]

        let maxV=this.computeValueFromQValues(state)
        this.getLegalActions(state).forEach(a => {
            if(maxV == this.getQValue(state, a)){
                best.push(a)
            }
        })

        if(best.length==0){
            return null
        }

        return best[Math.floor(Math.random()*best.length)];

    }
    getAction( state){
        
        // Pick Action
        let legalActions = this.getLegalActions(state)
        let action = null


        if(legalActions.length == 0){
            return null
        }

        action = this.computeActionFromQValues(state)

        if(Math.random()<this.epsilon){
            action = legalActions[Math.floor(Math.random()*legalActions.length)];
        }

        this.update(state,action);

        //console.log(`The action for ${state} is ${action}`);
        return action

    }
    update( state, action){

    	let newtetris=this.tetris.copy();
    	let nextState=newtetris.getState();
    	let reward=newtetris.getReward();
    	let v=((1-this.alpha)*this.getQValue(state, action)) + (this.alpha*(reward + (this.discount*this.computeValueFromQValues(nextState))));
    	let k=JSON.stringify({state: state,action: action});

        this.values.set(k,v);

    }
    getPolicy( state){
        return this.computeActionFromQValues(state)

    }
    getValue( state){
        return this.computeValueFromQValues(state)
    }
}





class BFSAgent{
	constructor(tetris){
		this.tetris=tetris;
		this.seq=[];
		this.maxdepth=2;
	}

	getAction(){
		if(this.seq.length==0){
			this.determineBestSequence();
			if(this.seq.length == 0)
				return "";
		}

		return this.seq.shift();
	}

	determineBestSequence(){
		let visited = new Set();
	    let queue = [];

	    let startState = this.tetris.getState();

	    let linesCleared=this.tetris.linesCleared;
	    queue.push(this.tetris)
	    visited.add(startState)

	    let stateToDirHistory = new Map();
	    stateToDirHistory.set(startState,[]);

	    while(queue.length!=0){
	        let tetris = queue.shift();
	        let state=tetris.getState();
	        let dirHistory = stateToDirHistory.get(state);

	        //console.log(`Checking ${state} of descent ${dirHistory.length}`)

	        if(linesCleared<tetris.linesCleared){
	        	this.seq=dirHistory;
	            return;
	        }

	        if(dirHistory.length>this.maxdepth)
	        	continue;

	        let children = tetris.getSuccessors(isLegal);
	        for(const child of children){

	        	let action=child.action;
	        	let newTet=child.tetris;
	        	let newState=newTet.getState();

	            if(!visited.has(newState)){

	                visited.add(newState)
	                queue.push(newTet)
	                stateToDirHistory.set(newState,dirHistory.concat([action]));
	            }
	        }
	    }

	    let actions=isLegal?this.tetris.getLegalActions():this.tetris.getDecentActions();
	    this.seq=[actions[Math.floor(Math.random()*actions.length)]];
	}
}









class GreedyAgent{
	constructor(tetris){
		this.tetris=tetris;
	}

	getAction(){
		let children=this.tetris.getSuccessors(isLegal);
		let minHeight=BOARD_HEIGHT+1;
		for(const child of children){
			let height=child.tetris.getHeight();
			if(height<minHeight)
				minHeight=height;
		}

		let goodActions=[];
		for(const child of children){
			let height=child.tetris.getHeight();
			if(height==minHeight)
				goodActions.push(child.action);
		}

		return goodActions[Math.floor(Math.random()*goodActions.length)]
	}
}


class RandomAgent{
	constructor(tetris){
		this.tetris=tetris;
	}

	getAction(){
		let actions=isLegal?this.tetris.getLegalActions():this.tetris.getDecentActions();
		return actions[Math.floor(Math.random()*actions.length)];
	}
}