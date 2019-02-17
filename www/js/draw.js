
var drawing;
var polyline;
var attempts;
var timer;
var svgs;
var categories;
var examples;
const maxAttempts = 6;
const maxTimeSecs = 20;

$().ready(function()
{
	document.addEventListener('deviceready', function()
	{
		loadData('www/categories.txt', function(data) {categories = data;});
		
		loadData('www/examples.txt', function(data)
		{
			examples = {};
			
			for (var i = 0; i < data.length; ++i)
			{
				var obj = $.parseJSON(data[i]);
				examples[obj.word] = parseDatasetElement(obj);
			}
		});
	}, false);

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
	
	$('.card-results .template button').on('click', function() 
	{
		$(this).find('.svg-margin-25').toggle();
		$(this).find('.example').toggle();
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
		onMouseDown(e.touches[0]);
	});

	drawing.on('mousemove', function(e) {
		onMouseMove(e);
	});

	drawing.on('touchmove', function(e)
	{
		e.preventDefault();
		onMouseMove(e.touches[0]);
	});

	drawing.on('mouseup', function(e) {
		onMouseUp(e);
	});

	$(window)
	.on('mouseup', function(e) {
		onMouseUp(e);
	})
	.on('touchend', function(e)	{
		onMouseUp(e.touches[0]);
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
	if (timer) {
		clearInterval(timer);
	}

	if (attempts > 0)
	{
		var svg = $('#drawing svg');
		var obj = svgs[attempts - 1];

		obj.w = svg.width();
		obj.h = svg.height();
		obj.data = svg.html();
		obj.bbox = bbox(svg);
		obj.xml = new XMLSerializer().serializeToString(svg.get(0));

		save('drawing' + attempts + '.txt', obj.xml);
	}

	++attempts;

	if (attempts > maxAttempts)
	{
		showResults();
		return;
	}

	$('.card-challenge .level').html('Drawing ' + attempts + '/' + maxAttempts);

	var challenge = selectCategory();

	var obj = {name:challenge};
	svgs.push(obj);



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

	var counter = maxTimeSecs;
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

function selectCategory()
{
	if (!categories) {
		return 'error';
	}

	var temp = [];

	for (var i = 0; i < categories.length; ++i)
	{
		var contains = false;

		for (var j = 0; j < svgs.lenght; ++j)
		{
			if (svgs[j].name == categories[i])
			{
				contains = true;
				break;
			}
		}

		if (contains) {
			continue;
		}

		temp.push(categories[i]);
	}

	return categories[Math.floor((Math.random() * temp.length))];
}

function loadData(filename, callback)
{
	window.resolveLocalFileSystemURL(cordova.file.applicationDirectory + filename,
		function(fileEntry)
		{
			fileEntry.file(function(file)
			{
				var reader = new FileReader();

				reader.onloadend = function(e) {
					callback(this.result.split(/\r?\n/));
				}

				reader.readAsText(file);
			});
		},
		function(e)
		{
			console.log('FileSystem Error');
			console.dir(e);
		}
	);
}

function save(filename, data)
{
	if (typeof cordova === 'undefined') {
		return;
	}

	var errorCallback = function(error) {
		alert("ERROR: " + error.code);
	};

	var successCallback = function(dir)
	{
		dir.getFile(filename, {create: true}, function(fileEntry)
		{
			fileEntry.createWriter(function(fileWriter)
			{
				fileWriter.onerror = errorCallback;
				fileWriter.write(data);
			},
			errorCallback);
		},
		errorCallback);
	};

	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, successCallback, errorCallback);
}

function showResults()
{
	var container = $('.card-results .card-row .container').html('');
	var template = $('.card-results .template');

	for (var i = 0; i < maxAttempts; ++i)
	{
		var result = template.clone(true);
		result.removeClass('template');
		
		var svg = result.find('svg');		
		svg.attr('viewBox','0 0 ' + svgs[i].w + ' ' + svgs[i].h).html(svgs[i].data);
		
		src = examples[svgs[i].name];
		
		var obj = $(src);
		obj.hide();
		result.find('button').append(obj);
		
		obj.attr('width', svg.attr('width'));
		obj.attr('height', svg.attr('height'));
		
		var status = result.find('.timesup-drawing-status');
		status.html(svgs[i].name);

		compare(svgs[i], src, status);
		container.append(result);
	}

	slideDown('.card-results');
}

function compare(svg1, ref, status)
{
	var fileData1 = new Blob([svg1.xml], {type: 'image/svg+xml;charset=utf-8'});
	var fileData2 = new Blob([ref], {type: 'image/svg+xml;charset=utf-8'});

	resemble(fileData1).compareTo(fileData2)
		.ignoreColors()
		.ignoreAntialiasing()
		.ignoreAlpha()
		.scaleToSameSize()
	.onComplete(function(data) {
		status.html(status.html() + ' ' + data.misMatchPercentage + '%')
	});
}

function bbox(svg)
{
	var bbox = {};

	bbox.x1 = parseInt(svg.attr('width'));
	bbox.y1 = parseInt(svg.attr('height'));
	bbox.x2 = 0;
	bbox.y2 = 0;

	svg.find('polyline').each(function()
	{
		var points = $(this).attr('points').split(' ');

		for (var i = 0; i < points.length; ++i)
		{
			var point = points[i].split(',');
			var x = parseInt(point[0]);
			var y = parseInt(point[1]);

			bbox.x1 = Math.min(bbox.x1, x);
			bbox.x2 = Math.max(bbox.x2, x);
			bbox.y1 = Math.min(bbox.y1, y);
			bbox.y2 = Math.max(bbox.y2, y);
		}
	});

	return bbox;
}

function parseDatasetElement(obj)
{	
	var x1 = -1, y1, x2, y2;
	var polylines = [];
	
	for (var i = 0; i < obj.drawing.length; ++i)
	{
		var stroke = obj.drawing[i];
		var x = stroke[0];
		var y = stroke[1];
		
		var points = [];
		
		for (var j = 0; j < x.length; ++j) 
		{
			points.push(x[j] + ',' + y[j]);
			
			if (x1 != -1) 
			{
				x1 = Math.min(x[j],x1);
				x2 = Math.max(x[j],x2);
				y1 = Math.min(y[j],y1);
				y2 = Math.max(y[j],y2);
			}
			else
			{
				x1 = x[j];
				x2 = x[j];
				y1 = y[j];
				y2 = y[j];
			}
		}

		polylines.push(points.join(' '));
	}
	
	var w = x2 - x1;
	var h = y2 - y1;
	var svg = '<svg class="example" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' '  + h + 
		'" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink">';
			  
	for (var i = 0; i < polylines.length; ++i) {
		svg += '<polyline points="' + polylines[i] + '" stroke="#000000" stroke-width="6" fill-opacity="0"/>';
	}
	
	svg += '</svg>';
	
	return svg;
}	
