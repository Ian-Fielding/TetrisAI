const BLACK_COLOR=0x404040;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 25;
let MAX_SECONDS=1;

let agent="User";
let totRuns=0;
let isLegal=false;

// create the PixiJS application
const app = new PIXI.Application({
	width: BLOCK_SIZE*(BOARD_WIDTH+4),
	height: BLOCK_SIZE*BOARD_HEIGHT,
	backgroundColor: 0x909090,
	antialias: false,
});








function clearDOM(){
	isLegal=document.getElementById("legal").checked;
	tet.reset();
	totRuns=0;
	
	document.getElementById("tab").innerHTML=
		`<tr>
			<th>Run</th>
			<th>Score</th>
		</tr>`;
	
}


let buttonNames=["User","Random", "Greedy", "Breadth First","Q Learning"];
	
for(let i=0;i<5;i++){
	let button=document.createElement("button");
	button.innerHTML=buttonNames[i];
	button.onclick=function(){
		clearDOM();
		MAX_SECONDS=(i==0?1:0.1);
		agent=buttonNames[i];
	}
	document.getElementById("button-row").appendChild(button);
}

// add the canvas element to the HTML document
document.getElementById("canvas").appendChild(app.view);

//https://stackoverflow.com/a/8916697
window.addEventListener("keydown", function(e) {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);
document.addEventListener('keydown', function(key){
	if(agent=="User" && !tet.isGameOver){
		let state=tet.getState();

		switch(key.keyCode){
		case 37:
			tet.takeActionNoUpdate("left");
			break;
		case 38:
			tet.takeActionNoUpdate("rotate");
			break;
		case 39:
			tet.takeActionNoUpdate("right");
			break;
		case 40:
			tet.takeActionAndUpdate("drop");
			elapsed=MAX_SECONDS+1;
			break;
		}
	}
});




const graphicsBoard=[];
for (let i = 0; i < BOARD_HEIGHT; i++) {
	graphicsBoard[i]=[];
	for (let j = 0; j < BOARD_WIDTH; j++) {
		graphicsBoard[i][j]=new PIXI.Graphics();
		graphicsBoard[i][j].beginFill(0xffffff);
		graphicsBoard[i][j].drawRect(j*BLOCK_SIZE,i*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
		app.stage.addChild(graphicsBoard[i][j]);
	}
}



const text=new PIXI.Text("Score: 0", {
     fontFamily: 'Arial',
     fontSize: 40,
     fill: 0xffffff,
     align: 'center',
 });
text.scale.x=0.5;
text.scale.y=0.5;
text.x=BLOCK_SIZE*BOARD_WIDTH+5;
text.y=BLOCK_SIZE*BOARD_HEIGHT-25;

app.stage.addChild(text);

let futureBoard=[];
for(let i=0;i<8;i++){
	futureBoard[i]=new PIXI.Graphics();
	futureBoard[i].beginFill(BLACK_COLOR)
	futureBoard[i].drawRect(BLOCK_SIZE*(BOARD_WIDTH+0.5),BLOCK_SIZE*(0.5+4*i),3*BLOCK_SIZE,3*BLOCK_SIZE);
	app.stage.addChild(futureBoard[i]);
}


function drawBoard(){
	let board=tet.getBoard();

	text.text=`Score: ${tet.linesCleared}`;

	for(let i=0;i<BOARD_HEIGHT;i++){
		for(let j=0;j<BOARD_WIDTH;j++){


			graphicsBoard[i][j].tint=board[i][j];
			if(board[i][j]==0)
				graphicsBoard[i][j].tint=BLACK_COLOR;
		}
	}

	for(let i=0;i<4;i++){
		let piece=PIECESARR[(tet.numPiecesOnBoard+i+1)%PIECESARR.length];
		futureBoard[i+4].clear();
		let offX=BLOCK_SIZE*(BOARD_WIDTH+0.5);
		let offY=BLOCK_SIZE*(0.5+4*i);

		for(let j=0;j<4;j++){
			let pieceX=(2+piece.blocks[j][0])*BLOCK_SIZE/2;
			let pieceY=(3+piece.blocks[j][1])*BLOCK_SIZE/2;

			futureBoard[i+4].beginFill(0xffffff);
			futureBoard[i+4].tint=piece.color;
			futureBoard[i+4].drawRect(offX+pieceX,offY+pieceY,BLOCK_SIZE/2,BLOCK_SIZE/2);
		}


	}

}


let tet=new Tetris();

let learnAgent=new QLearningAgent(tet);
let bfsAgent=new BFSAgent(tet);
let greedyAgent=new GreedyAgent(tet);
let randomAgent=new RandomAgent(tet);


let elapsed=0;
app.ticker.add(function(delta) {
	elapsed+=delta/60;
	if(MAX_SECONDS<0 || elapsed>MAX_SECONDS){
		elapsed=0;
		
		if(tet.isGameOver){
			totRuns++;
			let r=document.createElement("tr");
			let d1=document.createElement("td");
			let d2=document.createElement("td");
			d1.innerHTML=totRuns;
			d2.innerHTML=tet.linesCleared;
			r.appendChild(d1);
			r.appendChild(d2);
			document.getElementById("tab").appendChild(r);

			tet.reset();
		}

		if(agent=="User"){
			drawBoard();
			tet.update();
			return;
		}

		let action;
		switch(agent){
		case "Random":
			action = randomAgent.getAction();
			break;
		case "Breadth First":
			action = bfsAgent.getAction();
			break;
		case "Greedy":
			action = greedyAgent.getAction();
			break;
		case "Q Learning":
			action=learnAgent.getAction(tet.getState());
			break;
		}


		tet.takeAction(action);

	}

	drawBoard();
	
});
