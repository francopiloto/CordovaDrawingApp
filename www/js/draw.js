$().ready(function() 
{
	$('.button').on('mousedown', function()
	{
		var button = $(this);
		
		button.css('background-position','-' + button.css('width') + ' ' + button.css('background-position-y'));
		button.find('span').css('top', button.hasClass('button-large') ? '17px' : '14px');
	});
	
	$(window).on('mouseup', function()
	{
		$('.button').each(function()
		{
			var button = $(this);
			
			button.css('background-position','0 ' + button.css('background-position-y'));
			button.find('span').css('top', button.hasClass('button-large') ? '9px' : '6px');
		});
	});
	
	$('.canvas').hide();
	
	$('#new-card').click(function() {
		$('.card-container').animate({top: '0'}, 400);
	});
	
	$('#gotit').click(function()
	{
		$('.home').hide();
		$('.canvas').show();
		
		$('.card-container').animate({top: '-100%'}, 400);
	});	
});
