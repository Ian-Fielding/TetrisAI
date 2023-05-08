const PIECES = [
	{ color: 0xffff00, blocks: [[0, 0], [1, 0], [0, 1], [1, 1]], id: 1 }, // O
	{ color: 0x00ffff, blocks: [[0, 0], [1, 0], [2, 0], [3, 0]], id: 2 }, // I
	{ color: 0xff8000, blocks: [[0, 0], [1, 0], [2, 0], [2, 1]], id: 3 }, // L
	{ color: 0x0000ff, blocks: [[0, 0], [0, 1], [1, 1], [2, 1]], id: 4 }, // J
	{ color: 0xa000a0, blocks: [[0, 0], [1, 0], [2, 0], [1, 1]], id: 5 }, // T
	{ color: 0x00ff00, blocks: [[0, 0], [1, 0], [1, 1], [2, 1]], id: 6 }, // S
	{ color: 0xff0000, blocks: [[0, 0], [0, 1], [1, 1], [1, 2]], id: 7 }, // Z
];

for(let i=0;i<7;i++){
	for(let j=0;j<4;j++){
		PIECES[i].blocks[j][0]--;
		PIECES[i].blocks[j][1]--;
	}
}


const PIECESARR=new Array(1000);
function resetPieces(){
	for(let i=0;i<1000;i++)
		PIECESARR[i]=PIECES[Math.floor(Math.random() * PIECES.length)];
}
resetPieces();

class Tetris {
	constructor() {

		// Initialize the current piece

		this.rotation = 0;
		this.numPiecesOnBoard=0;
		this.currentPiece = this.generateRandomPiece();
		this.currentPieceY = 0;
		this.currentPieceX = Math.floor(BOARD_WIDTH / 2);
		this.isGameOver = false;
		this.linesCleared = 0;
		this.board = [];


		for (let i = 0; i < BOARD_HEIGHT; i++) {
			this.board[i] = [];
			for (let j = 0; j < BOARD_WIDTH; j++) {
				this.board[i][j] = 0;
			}
		}
	}

	copy(){
		let newTet=new Tetris();
		newTet.rotation=this.rotation;
		newTet.currentPiece = this.currentPiece
		newTet.currentPieceY = this.currentPieceY;
		newTet.currentPieceX = this.currentPieceX
		newTet.isGameOver = this.isGameOver;
		newTet.linesCleared = this.linesCleared;
		newTet.numPiecesOnBoard=this.numPiecesOnBoard;


		for (let i = 0; i < BOARD_HEIGHT; i++) {
			for (let j = 0; j < BOARD_WIDTH; j++) {
				newTet.board[i][j] = this.board[i][j];
			}
		}

		return newTet;
	}

	generateRandomPiece() {
		return PIECESARR[this.numPiecesOnBoard%PIECESARR.length];
	}

	// Reset the environment
	reset() {
		resetPieces();
		this.rotation = 0;
		this.numPiecesOnBoard=0;
		this.currentPiece = this.generateRandomPiece();
		this.currentPieceY = 0;
		this.currentPieceX = Math.floor(BOARD_WIDTH / 2);
		this.linesCleared = 0;
		this.isGameOver = false;

		for (let i = 0; i < BOARD_HEIGHT; i++) {
			for (let j = 0; j < BOARD_WIDTH; j++) {
				this.board[i][j] = 0;
			}
		}
	}

	inBounds(x,y){
		return 0<=x && x<BOARD_WIDTH && y<BOARD_HEIGHT;
	}

	getRot(block) {


		switch (this.rotation) {
			case 0:
				return [block[0], block[1]];
			case 1:
				return [-block[1], block[0]];
			case 2:
				return [-block[0], -block[1]];
			case 3:
				return [block[1], -block[0]];
		}

	}

	getHeight(){
		let minHeight=BOARD_HEIGHT+1;
		for(let j=0;j<BOARD_WIDTH;j++){
			for(let i=0;i<BOARD_HEIGHT;i++){
				if(this.board[i][j]!=0 && i<minHeight){
					minHeight=i;
					break;
				}
			}
		}

		return BOARD_HEIGHT-minHeight;
	}


	getNumHoles(){
		let count=0;
		for(let j=0;j<BOARD_WIDTH;j++){
			let topCol=false;
			for(let i=0;i<BOARD_HEIGHT;i++){
				if(this.board[i][j]!=0 && !topCol)
					topCol=true;
				if(this.board[i][j]==0 && topCol)
					count++;
			}
		}

		return count;
	}


	// Get the state of the environment
	getState() {
		let newboard=new Array(BOARD_WIDTH+2);

		for(let j=0;j<BOARD_WIDTH;j++){
			for(let i=0;i<BOARD_HEIGHT;i++){
				if(this.board[i][j]!=0){
					newboard[j]=BOARD_HEIGHT-i;
					break;
				}
			}

			if(newboard[j]==null)
				newboard[j]=0;
		}

		let min=newboard.reduce((a,b)=>Math.min(a,b), Infinity);
		for(let j=0;j<BOARD_WIDTH;j++)
			newboard[j]-=min;
		newboard[BOARD_WIDTH]=this.currentPiece.id;
		newboard[BOARD_WIDTH+1]=this.linesCleared;
		return newboard+"";
	}

	getBoard() {
		let newboard = [];


		for (let i = 0; i < BOARD_HEIGHT; i++) {
			newboard[i] = [];
			for (let j = 0; j < BOARD_WIDTH; j++) {
				newboard[i][j] = this.board[i][j];
			}
		}

		let count=0;
		while(this.canPlacePiece()){
			this.currentPieceY++;
			count++;
		}

		this.currentPieceY-=count;

		for (let i = 0; i < 4; i++) {
			let block = this.currentPiece.blocks[i];
			let newBlock = this.getRot(block);


			let blockX = newBlock[0] + this.currentPieceX;
			let blockY = newBlock[1] + this.currentPieceY;

			if(blockY+count-1>-0)
				newboard[blockY+count-1][blockX] = 0xc0c0c0;
			if(blockY>=0){
				newboard[blockY][blockX] = this.currentPiece.color;
			}
		}



		return newboard;
	}

	getActions(){
		let actions=[]
		for(let numRots=0;numRots<=3;numRots++){
			for(let numLefts=0;numLefts<=5;numLefts++){
				for(let numRights=0;numRights<=(numLefts==0?4:0);numRights++){
					actions.push("t".repeat(numRots)+"l".repeat(numLefts)+"r".repeat(numRights));
				}
			}
		}

		return actions;
	}

	getLegalActions(){
		let legal=[];

		let actions=this.getActions();
		z:for(let a=0;a<actions.length;a++){
			let action=actions[a];
			let test=this.copy();

			for(let i=0;i<action.length;i++){
				let char=action[i];
				let shouldBreak=false;
				switch(char){
				case "t":
					test.rotation = (test.rotation + 1) % 4;
					if (!test.canPlacePiece())
						shouldBreak=true;

					break;
				case "l":
					test.currentPieceX--;
					if (!test.canPlacePiece())
						shouldBreak=true;
					break;
				case "r":
					test.currentPieceX++;
					if (!test.canPlacePiece())
						shouldBreak=true;
					break;
				}

				if(shouldBreak)
					continue z;
			}

			legal.push(action);
		}

		return legal;
		
	}


	getDecentActions(){
		let legal=this.getLegalActions();
		let good=[];

		if(legal.length==0)
			return legal;

		for(let badness=0;;badness++){


			for(const action of legal){
				let test=this.copy();
				test.takeAction(action);
				if(test.getNumHoles() <= this.getNumHoles() + badness)
					good.push(action);
			}

			if(good.length!=0){
				return good;
			}
		}
		 
	}


	getSuccessors(isLegal=false){
		let actions=isLegal?this.getLegalActions():this.getDecentActions();
		let children=[];
		for(let i=0;i<actions.length;i++){
			let child=this.copy();
			child.takeAction(actions[i]);
			children[i]={action: actions[i], tetris: child};
		}

		return children;
	}


	// Take an action
	takeAction(action) {
		for(let i=0;i<action.length;i++){
			switch(action[i]){
			case "l":
				this.takeActionAndUpdate("left");
				break;
			case "r":
				this.takeActionAndUpdate("right");
				break;
			case "t":
				this.takeActionAndUpdate("rotate");
				break;
			}
		}

		this.takeActionAndUpdate("drop");
	}

	takeActionNoUpdate(action){
		switch (action) {
			case "left": 
				this.currentPieceX--;
				if (!this.canPlacePiece())
					this.currentPieceX++;
				break;
			case "right": 
				this.currentPieceX++;
				if (!this.canPlacePiece())
					this.currentPieceX--;
				break;
			case "rotate":
				this.rotation = (this.rotation + 1) % 4;
				if (!this.canPlacePiece()) {
					if (this.rotation == 0)
						this.rotation = 3;
					else
						this.rotation--;
				}
				break;
			case "drop": 
				while(this.canPlacePiece())
					this.currentPieceY++;
				this.currentPieceY--;
				break;
			case "hold":
				break;
		}
	}

	takeActionAndUpdate(action) {
		this.takeActionNoUpdate(action);
		this.update();
	}

	// Get the reward for the current state
	getReward() {
		let state=this.getState();
		let max=0;
		for(let i=0;i<BOARD_WIDTH;i++)
			if(max<state[i])
				max=state[i];

		return BOARD_HEIGHT-max + 1000*this.linesCleared;
	}


	canPlacePiece() {
		for (let i = 0; i < 4; i++) {
			let newBlock = this.getRot(this.currentPiece.blocks[i]);
			let blockX = newBlock[0] + this.currentPieceX;
			let blockY = newBlock[1] + this.currentPieceY;

			if (!this.inBounds(blockX, blockY) || (blockY>=0 && this.board[blockY][blockX] != 0) ) {
				return false;

			}
		}

		return true;
	}

	// create a function to place a Tetris game piece at a given position
	placePiece() {
		this.numPiecesOnBoard++;

		for(let i=0;i<4;i++){
			let block=this.currentPiece.blocks[i];
			let newBlock = this.getRot(block);
			let blockX = newBlock[0] + this.currentPieceX;
			let blockY = newBlock[1] + this.currentPieceY;
			if(blockY<0)
				continue;

			this.board[blockY][blockX] = this.currentPiece.color;
		}
	}

	removeCompletedRows() {

		for (let i = 0; i < BOARD_HEIGHT; i++) {
			let rowIsEmpty = false;
			for (let j = 0; j < BOARD_WIDTH; j++) {
				if (this.board[i][j] == 0) {
					rowIsEmpty = true;
					break;
				}
			}

			if (!rowIsEmpty) {
				this.board.splice(i, 1);

				let x = new Array(BOARD_WIDTH);
				for (let j = 0; j < BOARD_WIDTH; j++)
					x[j] = 0;

				this.board.splice(0, 0, x);

				this.linesCleared++;
			}
		}
	}


	// Update the environment
	update() {
		if (this.isGameOver)
			return;

		this.currentPieceY++;

		let score=0;
		// check if the current piece can be placed at its new position
		if (!this.canPlacePiece()) {

			this.currentPieceY--;

			this.placePiece();
			// remove completed rows from the board
			score = this.removeCompletedRows();

			this.currentPiece = this.generateRandomPiece();
			this.currentPieceX = Math.floor(BOARD_WIDTH / 2);
			this.currentPieceY = 0;
			this.rotation = 0;

			if (!this.canPlacePiece()) {
				//app.ticker.stop();
				this.isGameOver = true;
				return;
			}
		}
		return score;
	}
}