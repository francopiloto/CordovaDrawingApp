
var canvas;
var buffer;
var ctx;
var isMouseDown;
var isClick;
			
$().ready(function() 
{
	// setup buttons behavior
	$('.button').on('mousedown', function()
	{
		var button = $(this);
		
		button.css('background-position','-' + button.css('width') + ' ' + button.css('background-position-y'));
		button.find('span').css('top', button.hasClass('button-large') ? '17px' : '14px');
	});
	
	$(window)
	.on('mouseup', function()
	{
		$('.button').each(function()
		{
			var button = $(this);
			
			button.css('background-position','0 ' + button.css('background-position-y'));
			button.find('span').css('top', button.hasClass('button-large') ? '9px' : '6px');
		});
	})
	.on('resize', function()
	{
		// update canvas size to occupy the whole screen
		var w = $(window).width();
		var h = $(window).height();
		
		// avoid losing the drowing whe the canvas is resized
		buffer.width = w;
		buffer.height = h;
		buffer.getContext('2d').drawImage(canvas, 0, 0);
		
		canvas.width  = w;
		canvas.height = h;
		canvas.getContext('2d').drawImage(buffer, 0, 0);
		
		ctx.lineWidth = 6;
	});
	
	$('.canvas').hide();
	
	// slide down the card to show the new challenge
	$('#new-card').click(function() {
		$('.card-container').animate({top: '0'}, 400);
	});
	
	// slide up the card and show the canvas
	$('#gotit').click(function()
	{
		$('.home').hide();
		$('.canvas').show();
		
		$('.card-container').animate({top: '-100%'}, 400);
	});
	
	$('#button-clear').on('click', function() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	});
	
	initGraphics();
});

// initialize graphics context and events
function initGraphics()
{
	canvas = document.getElementById('canvas');
	buffer = document.getElementById('buffer');
	
	ctx = canvas.getContext('2d');
	isMouseDown = false;
	isClick = false;
	
	ctx.fillStyle = ctx.strokeStyle = '#000000';	
	ctx.lineJoin = 'round';
	
	$(canvas).on('mousedown', function(e)
	{
		var pos = getMousePosition(e);

		ctx.beginPath();
		ctx.moveTo(pos.x, pos.y);
		
		isMouseDown = true;
		isClick = true;
	})
	.on('mouseenter', function(e)
	{
		if (isMouseDown)
		{
			var pos = getMousePosition(e);

			ctx.beginPath();
			ctx.moveTo(pos.x, pos.y);
		}  
	})
	.on('mousemove', function(e) 
	{
		if (isMouseDown)
		{
			var pos = getMousePosition(e);

			ctx.lineTo(pos.x, pos.y);
			ctx.stroke();

			isClick = false;
		}
	});
	
	$(window).on('mouseup', function(e)
	{
		isMouseDown = false;
		
		if (isClick)
		{
			isClick = false;
			var pos = getMousePosition(e);

			ctx.arc(pos.x, pos.y, ctx.lineWidth, 0, Math.PI * 2, true);
			ctx.fill();
		}
	}).resize();
}

// get current mouse position on canvas
function getMousePosition(e)
{
	var rect = canvas.getBoundingClientRect();

	return {
		x: e.clientX - rect.left - canvas.clientLeft,
		y: e.clientY - rect.top - canvas.clientTop
	};
}