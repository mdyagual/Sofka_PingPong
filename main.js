//----------------------------------Tablero------------------------------
(function(){
    self.Board = function (w,h){
        this.width = w;
        this.height = h;

        this.playing = false;
        this.game_over = false;
        this.bars = [];
        this.ball = null;
        this.playing = false;
    }

    self.Board.prototype = {
        get elements(){
            //Hack para que se muevan las barras
            var elements = this.bars.map(function(bar){return bar;});
            elements.push(this.ball);
            return elements;
        }
    }
})();

//----------------------------------Pelotita------------------------------------
(function(){
    //Atributos para la pelota
    self.Ball = function (x,y,radius,board){
        this.x = x;
        this.y = y;
        this.radius = radius;
        
        this.speed_x = 3;
        this.speed_y = 0;

        this.board = board;

        this.direction = 1;

        this.bounce_angle = 0;
        this.max_bounce_angle = Math.PI / 12;
        this.speed = 3;

        board.ball =this;
        this.kind = "circle";        
    }
    //Gestión relacionada a la pelota
    self.Ball.prototype = {
        move: function(){
            this.x += (this.speed_x * this.direction);
            this.y += (this.speed_y);
        },
        get width (){
            return this.radius * 2;
        },

        get height(){
            return this.radius * 2;
        },

        collision: function(bar){
            var relative_intersect_y = ( bar.y + (bar.height / 2) ) - this.y;

            var normalized_intersect_y = relative_intersect_y / (bar.height / 2);

            this.bounce_angle = normalized_intersect_y * this.max_bounce_angle;

            this.speed_y = this.speed * -Math.sin(this.bounce_angle);
            this.speed_x = this.speed * Math.cos(this.bounce_angle);

            if (this.x > (this.board.width / 2)) this.direction = -1;
            else this.direction = 1;


        }
    }
})();

//--------------------------------Barras ping y pong----------------------------------
(function (){
    self.Bar = function(x,y,width,height,board){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.board = board;

        this.board.bars.push(this);

        this.kind = "rectangle";

        this.speed = 5;


    }
    //Gestión relacionada a las barras
    self.Bar.prototype={
        down: function(){
            this.y += this.speed;
        },

        up: function(){
            this.y -= this.speed;
        },
        toString: function(){
            return "x: "+this.x+" y: "+this.y;
        }
    }

})();

//--------------------Escena donde va el tablero con los elementos del juego----------------------
(function(){
    self.BoardView = function (canvas,board){
        this.canvas = canvas;
        this.canvas.width = board.width;
        this.canvas.height = board.height;
        this.board = board;
        this.ctx=canvas.getContext("2d");
    }

    //gestión de la escena
    self.BoardView.prototype ={
        clean: function(){
            this.ctx.clearRect(0,0,this.board.width,this.board.height);
        },

        draw: function(){
            for (var i=this.board.elements.length - 1; i >= 0; i--){
                var elem = this.board.elements[i];
                draw(this.ctx,elem);
            };
        },

        collisions: function(){
            for (var i= this.board.bars.length - 1; i>=0;i--){
                var bar=this.board.bars[i];
                if(hit(bar, this.board.ball)){
                    this.board.ball.collision(bar);
                }
            };

        },
        play: function(){
            if(this.board.playing){
                this.clean();
                this.draw();
                this.collisions();
                this.board.ball.move();
            }
            
        }
    }

    //Configuración de los golpes entre barras
    function hit(a,b){
        var hit = false;
        //horizontal
        if(b.x + b.width >= a.x && b.x < a.x + a.width){
            //vertical
            if(b.y + b.height >= a.y && b.y < a.y + a.height){
                hit = true;
            }
        }

        // a choca con b
        if(b.x  <= a.x && b.x + b.width >= a.x + a.width){
            if(b.y  <= a.y && b.y + b.height >= a.y + a.height){
                hit = true;

            }

        }

        // b choca con a
        if(a.x  <= b.x && a.x + a.width >= b.x + b.width){
            if(a.y  <= b.y && a.y + a.height >= b.y + b.height){
                hit = true;

            }

        }
        return hit;




    }

    //Dibujar los elementos: Las barras y la pelota
    function draw(ctx,element){
        //if(element !== null && element.hasOwnProperty("kind")){
            switch(element.kind){
                case "rectangle":
                    ctx.fillRect(element.x,element.y,element.width,element.height);
                    break;
                case "circle":
                    ctx.beginPath();
                    ctx.arc(element.x,element.y,element.radius,0,7);
                    ctx.fill();
                    ctx.closePath();
                    break;    
            }
        //}
        
    }


})();

var board = new Board(800,400);
var bar_1 = new Bar (20,100,40,100,board);
var bar_2 = new Bar (735,100,40,100,board);
var canvas = document.getElementById('canvas');
var board_view = new BoardView (canvas,board);
var ball = new Ball (350,100,10,board);

//--------------------------------Gestion de movimiento de teclas------------------------------
document.addEventListener("keydown",function(ev){
    
    if(ev.keyCode ==38){
        ev.preventDefault();
        bar_1.up();
    }else if(ev.keyCode==40){
        ev.preventDefault();
        bar_1.down();
    }else if(ev.keyCode==83){
        ev.preventDefault();
        bar_2.down();
    }else if(ev.keyCode==87){
        ev.preventDefault();
        bar_2.up();
    }else if(ev.keyCode == 32){
        ev.preventDefault();
        board.playing =!board.playing;

    }
});

//-------------------------------Movimiento de la pelota----------------------------
window.requestAnimationFrame(controller);
setTimeout(function(){
    ball.direction = -1;
},4000)

//Controlador de la dinámica del juego
function controller(){  
    board_view.play();
    window.requestAnimationFrame(controller);

}