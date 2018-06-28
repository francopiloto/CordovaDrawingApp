
var canvas;
var buffer;
var ctx;
var isMouseDown;
var isClick;
var attempts;
var timer;
			
$().ready(function() 
{
	setupButtonBehavior();
	setupAppFlow();
	initGraphics();
	setupDrawingEvents();
	setupDrawingControls();
	startNewGame();
});

// setup UI behavior for all buttons
function setupButtonBehavior()
{
	$('.button').on('mousedown touchstart', function()
	{
		var button = $(this);
		
		button.css('background-position','-' + button.css('width') + ' ' + button.css('background-position-y'));
		button.find('span').css('top', button.hasClass('button-large') ? '17px' : '14px');
		
		if (button.hasClass('button-drawing'))
		{ 
			button.find('div').css('top', '104px');
			button.find('svg').css('marginTop', '32px').css('marginLeft', '20px');
		}
	});
	
	$(window).on('mouseup touchend', function()
	{
		$('.button').each(function()
		{
			var button = $(this);
			
			button.css('background-position','0 ' + button.css('background-position-y'));
			button.find('span').css('top', button.hasClass('button-large') ? '9px' : '6px');
			
			if (button.hasClass('button-drawing'))
			{ 
				button.find('div').css('top', '97px');
				button.find('svg').css('marginTop', '25px').css('marginLeft', '25px');
			}
		});
	});
}

function setupAppFlow()
{
	// slide down the card to show the new challenge
	$('#new-card').click(function() {
		newChallenge();
	});
	
	// slide up the card and show the canvas
	$('#gotit').click(function()
	{
		$('.home').hide();
		startNewDrawing();
		slideUp('.card-challenge');
	});
	
	$('#popup-quit-cancel').on('click', function() {
		$('.popup-wrapper').hide();
	});
	
	$('#popup-quit-quit').on('click', function() {
		startNewGame();
	});
	
	$('#button-timesup-play').on('click', function() {
		startNewGame();
	});
}

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
}

function onMouseDown(e)
{
	var pos = getMousePosition(e);

	ctx.beginPath();
	ctx.moveTo(pos.x, pos.y);
	
	isMouseDown = true;
	isClick = true;
}

function onMouseMove(e)
{
	if (!isMouseDown) {
		return;
	}
	
	var pos = getMousePosition(e);

	ctx.lineTo(pos.x, pos.y);
	ctx.stroke();

	isClick = false;
}

function onMouseUp(e)
{
	isMouseDown = false;
		
	if (isClick)
	{
		isClick = false;
		var pos = getMousePosition(e);

		ctx.arc(pos.x, pos.y, ctx.lineWidth, 0, Math.PI * 2, true);
		ctx.fill();
	}
}

function setupDrawingEvents()
{
	$(canvas)
	.on('mousedown', function(e) {
		onMouseDown(e);
	})
	.on('touchstart', function(e) {
		onMouseDown(e.originalEvent.touches[0]);
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
	.on('mousemove', function(e) {
		onMouseMove(e);
	})
	.on('touchmove', function(e) 
	{
		e.preventDefault();
		onMouseMove(e.originalEvent.touches[0]);
	});
	
	$(window)
	.on('mouseup', function(e) {
		onMouseUp(e);		
	})
	.on('touchend', function(e)	{
		onMouseUp(e.originalEvent.touches[0]);	
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
	})
	.resize();
}

function setupDrawingControls()
{
	$('#button-clear').on('click', function() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	});
	
	$('#button-skip').on('click', function() {
		newChallenge();
	});
	
	$('.button-close').on('click', function() {
		$('.popup-wrapper').show();
	});
}

function startNewGame()
{
	attempts = 0;
	
	$('#button-skip').show();
	$('.card-container').hide();
	$('.canvas').hide();
	$('.popup-wrapper').hide();
	$('.home').show();
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

function newChallenge()
{
	++attempts;
	
	if (attempts > 6) 
	{
		showResults();
		return;
	}
	
	$('.card-challenge .level').html('Drawing ' + attempts + '/6');
	
	// TODO get challenge from the database
	var challenge = 'new challenge from database';
	
	$('.challenge').html(challenge);
	$('.canvas .topbar #topbar-text').html('Draw: ' + challenge);
		
	slideDown('.card-challenge');
}

function startNewDrawing()
{
	if (timer) {
		clearInterval(timer);
	}
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	isMouseDown = false;
	isClick = false;
	
	if (attempts >= 6) {
		$('#button-skip').hide();
	}

	$('.canvas').show();
	
	var counter = 20;
	$('#clock-time').html('00:20');
	
	timer = setInterval(function()
	{
		--counter;
		
		if (counter > 0) {
			$('#clock-time').html('00:' + (counter > 9 ? counter : '0' + counter));
		}
		else 
		{
			clearInterval(timer);
			newChallenge();
		}
		
	}, 1000);
}	

function slideDown(card) {
	$(card).css('top','-100%').show().animate({top: '0'}, 400);
}

function slideUp(card)
{
	$(card).animate({top: '-100%'}, 400, function() {
		$(card).hide();
	});
}

function showResults()
{
	// TODO
	
	slideDown('.card-results');
}