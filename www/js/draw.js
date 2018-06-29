
var drawing;
var polyline;
var attempts;
var timer;
var svgs;
const maxAttempts = 6;
			
$().ready(function() 
{
	setupButtonBehavior();
	setupAppFlow();
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
	$('#drawing').html('');
	
	drawing = SVG('drawing');
	
	drawing.on('mousedown', function(e) {
		onMouseDown(e);
	});
	
	drawing.on('touchstart', function(e) {
		onMouseDown(e.originalEvent.touches[0]);
	});
	
	drawing.on('mousemove', function(e) {
		onMouseMove(e);
	});
	
	drawing.on('touchmove', function(e) 
	{
		e.preventDefault();
		onMouseMove(e.originalEvent.touches[0]);
	});
	
	drawing.on('mouseup', function(e) {
		onMouseUp(e);
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
		var w = $(window).width();
		var h = $(window).height() - $('.topbar').height();
		
		drawing.size(w, h);
	})
	.resize();
}

function onMouseDown(e)
{
	polyline = drawing.polyline().attr({stroke: '#000000', 'stroke-width': 6, 'fill-opacity': 0});
	polyline.draw(e);
}

function onMouseMove(e)
{
	if (polyline) {
		polyline.draw('point', e);
	}
}

function onMouseUp(e) 
{
	if (polyline) {
		polyline.draw('stop', e);
	}
}

function setupDrawingControls()
{
	$('#button-clear').on('click', function() {
		initGraphics();
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
	svgs = [];
	
	$('#button-skip').show();
	$('.card-container').hide();
	$('.canvas').hide();
	$('.popup-wrapper').hide();
	$('.home').show();
}

function newChallenge()
{
	if (attempts > 0) 
	{
		var svg = $('#drawing svg');
		var obj = {};
		obj.w = svg.width();
		obj.h = svg.height();
		obj.data = svg.html();
		svgs[attempts - 1] = obj;
	}
	
	++attempts;	
	
	if (attempts > maxAttempts) 
	{
		showResults();
		return;
	}
	
	$('.card-challenge .level').html('Drawing ' + attempts + '/' + maxAttempts);
	
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
		
	initGraphics();
	
	if (attempts >= maxAttempts) {
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
	
	var container = $('.card-results .card-row .container').html('');
	var template = $('.card-results .template');
	
	for (var i = 0; i < maxAttempts; ++i)
	{
		var result = template.clone(true);
		result.removeClass('template');
		result.find('svg').attr('viewBox','0 0 ' + svgs[i].w + ' ' + svgs[i].h).html(svgs[i].data);
		
		container.append(result);
	}
	
	slideDown('.card-results');
}