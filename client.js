addEventHandler('OnResourceReady', (event, resource) =>
{
	if(resource == thisResource)
	{
		triggerNetworkEvent('OnResourceReady');
	}
});