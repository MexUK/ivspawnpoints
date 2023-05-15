class SpawnPoints
{
	constructor()
	{
		this.SPAWN_POINTS_FILE_PATH = 'spawnpoints.txt';
		this.COMMAND_PERMISSIONS_FILE_PATH = 'commandpermissions.txt';
		
		this.spawnChatMessages = true;
		this.addRemoveCommandsEnabled = true;
		
		this.SPAWN_POINT_WHEN_SPAWN_POINTS_FILE_IS_EMPTY = {
			spawnPointId: 0,
			pedModelId: -1188246269,
			x: 420.0,
			y: 120.0,
			z: 10.0,
			heading: 1.5,
			interior: 0,
			name: 'Temporary Spawn Point (This is only used if there aren\'t any spaawn points in the txt file. Use /addspawnpoint name)'
		};
		
		this.registerCommandHandlers();
		this.registerEventHandlers();
		this.registerNetworkEventHandlers();
	}
	
	// registered components
	registerCommandHandlers()
	{
		addCommandHandler('addspawnpoint', (command, text, client) =>
		{
			if(!this.canClientUseCommand(client, command))
				return this.pm(client, 'You cannot currently use this command!');
			
			let player = client.player;
			if(!player)
				return this.pm(client, 'You cannot currently use this command! (Not spawned)');
			
			text = text.trim();
			if(text === '')
				return this.pm(client, 'A name must be specified for the spawn point. e.g. /addspawnpoint Location One');
			
			let spawnPoint = this.addSpawnPointForClient(client, {
				pedModelId: player.modelIndex,
				x: player.position.x,
				y: player.position.y,
				z: player.position.z,
				heading: player.heading,
				interior: player.interior,
				name: text
			});
			this.chat(client.name+' added a spawn point named '+text+'. (ID '+spawnPoint.spawnPointId+')');
		});
		
		addCommandHandler('removespawnpoint', (command, text, client) =>
		{
			if(!this.canClientUseCommand(client, command))
				return this.pm(client, 'You cannot currently use this command!');
			
			let token1 = this.parseTokens(text);
			let spawnPointId = parseInt(token1);
			
			if(isNaN(spawnPointId))
				return this.pm(client, 'The spawn point ID that you specified was not a valid integer.');
			
			if(!this.isSpawnPointId(spawnPointId))
				return this.pm(client, 'The spawn point ID that you specified was invalid! You typed: '+token1);
			
			this.removeSpawnPoint(spawnPointId);
			this.chat(client.name+' removed the spawn point with ID '+spawnPointId+'.');
		});
		
		addCommandHandler('spawnpoints', (command, text, client) =>
		{
			text = text.trim();
			
			if(text === '')
			{
				let spawnPoints = this.getSpawnPoints();
				if(spawnPoints.length == 0)
					this.chat('There are no spawn points. Use "/addspawnpoint name" to add one.');
				else
					this.chat('There '+(spawnPoints.length == 1 ? 'is' : 'are')+' '+spawnPoints.length+' spawn point'+(spawnPoints.length == 1 ? '' : 's')+'. IDs: '+spawnPoints.map(v => v.spawnPointId).join(', '));
			}
			else
			{
				let player = client.player;
				if(!player)
					return this.pm(client, 'You cannot currently use this command with a max distance specified! (Not spawned)');
				
				let token1 = this.parseTokens(text);
				let maxDistance = parseFloat(token1);
				
				if(isNaN(maxDistance) || maxDistance < 0.0)
					return this.pm(client, 'The max distance that you specified was not a valid positive decimal/integer number.');
				
				let spawnPoints = this.getSpawnPointsNearPosition(player.position, maxDistance);
				if(spawnPoints.length == 0)
					this.chat('There are no spawn points near you up to '+maxDistance+' game units. Use "/addspawnpoint name" to add a spawn point.');
				else
					this.chat('There '+(spawnPoints.length == 1 ? 'is' : 'are')+' '+spawnPoints.length+' spawn point'+(spawnPoints.length == 1 ? '' : 's')+' near you up to '+maxDistance+' game units. IDs: '+spawnPoints.map(v => v.spawnPointId).join(', '));
			}
		});
	}
	
	registerEventHandlers()
	{
	}
	
	registerNetworkEventHandlers()
	{
		addNetworkHandler('OnResourceReady', (client) =>
		{
			gta.fadeCamera(client, true, 0.8);
			
			let spawnPoint = this.getRandomSpawnPoint();
			spawnPlayer(client, new Vec3(spawnPoint.x, spawnPoint.y, spawnPoint.z), spawnPoint.heading, spawnPoint.pedModelId, spawnPoint.interior);
			
			if(this.spawnChatMessages)
				this.chat(client.name+' spawned at '+spawnPoint.name+'.');
		});
	}
	
	// util
	rand(min, max)
	{
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	parseTokens(text)
	{
		if(text === undefined
		|| text === null)
			return [];
		
		text = text.trim();
		if(text === '')
			return [];
		
		return text.split(' ');
	}
	
	joinFrom(arr, delimiter, fromIndex)
	{
		let tokens = [];
		for(let i=fromIndex,j=arr.length; i<j; i++)
		{
			tokens.push(arr[i]);
		}
		return tokens.join(delimiter);
	}
	
	getFileLines(filePath)
	{
		let data = loadTextFile(filePath);
		if(data === null)
			return [];
		data = data.replace("\r", '');
		if(data === '')
			return [];
		return data.split("\n");
	}
	
	chat(text)
	{
		message(text, COLOUR_LIME);
	}
	
	pm(client, text)
	{
		messageClient(text, client, COLOUR_AQUA);
	}
	
	// model
	canClientUseCommand(client, command)
	{
		if(!this.addRemoveCommandsEnabled)
			return false;
		let playerNameLower1 = client.name.toLowerCase();
		let playerNames = this.getPermittedPlayerNamesForCommands();
		for(let i in playerNames)
		{
			if(playerNameLower1 === playerNames[i].toLowerCase())
				return true;
		}
		return false;
	}
	
	getPermittedPlayerNamesForCommands()
	{
		return this.getFileLines(this.COMMAND_PERMISSIONS_FILE_PATH);
	}
	
	addSpawnPointForClient(client, spawnPoint)
	{
		return this.addSpawnPoint(spawnPoint);
	}
	
	addSpawnPoint(spawnPoint)
	{
		let spawnPoints = this.getSpawnPoints();
		
		spawnPoint.spawnPointId = this.getNextSpawnPointId(spawnPoints);
		
		spawnPoints.push(spawnPoint);
		this.setSpawnPoints(spawnPoints);
		return spawnPoint;
	}
	
	removeSpawnPoint(spawnPointId)
	{
		let index = this.getSpawnPointArrayIndexById(spawnPointId);
		if(index == -1)
			return;
		
		let spawnPoints = this.getSpawnPoints();
		spawnPoints.splice(index, 1);
		this.setSpawnPoints(spawnPoints);
	}
	
	isSpawnPointId(spawnPointId)
	{
		let spawnPoints = this.getSpawnPoints();
		for(let i in spawnPoints)
		{
			let spawnPoint = spawnPoints[i];
			
			if(spawnPointId === spawnPoint.spawnPointId)
				return true;
		}
		return false;
	}
	
	getNextSpawnPointId(spawnPoints)
	{
		let spawnPointId = 1;
		while(this.isSpawnPointId(spawnPointId))
			spawnPointId++;
		return spawnPointId;
	}
	
	getSpawnPointArrayIndexById(spawnPointId)
	{
		let spawnPoints = this.getSpawnPoints();
		for(let i in spawnPoints)
		{
			let spawnPoint = spawnPoints[i];
			
			if(spawnPointId === spawnPoint.spawnPointId)
				return i;
		}
		return -1;
	}
	
	getSpawnPoints()
	{
		let lines = this.getFileLines(this.SPAWN_POINTS_FILE_PATH);
		let line;
		let spawnPoints = [];
		for(let i=0,j=lines.length; i<j; i++)
		{
			line = lines[i].trim();
			if(line === '')
				continue;
			
			if(line[0] === '#')
				continue;
			
			let csv = line.split(',');
			let floats = csv.map(v => parseFloat(v.trim()));
			
			let spawnPoint = {};
			[spawnPoint.spawnPointId, spawnPoint.pedModelId, spawnPoint.x, spawnPoint.y, spawnPoint.z, spawnPoint.heading, spawnPoint.interior] = floats;
			spawnPoint.name = this.joinFrom(csv, ',', 7).trim();
			
			spawnPoints.push(spawnPoint);
		}
		return spawnPoints;
	}
	
	getSpawnPointsNearPosition(position, maxDistance)
	{
		let spawnPoints = this.getSpawnPoints();
		let spawnPointsNearPosition = [];
		for(let i in spawnPoints)
			if(position.distance(new Vec3(spawnPoints[i].x, spawnPoints[i].y, spawnPoints[i].z)) <= maxDistance)
				spawnPointsNearPosition.push(spawnPoints[i]);
		return spawnPointsNearPosition;
	}
	
	setSpawnPoints(spawnPoints)
	{
		let arr = spawnPoints.map(v => [
			v.spawnPointId,
			v.pedModelId,
			v.x,
			v.y,
			v.z,
			v.heading,
			v.interior,
			v.name
		].join(', '));
		arr.unshift('# spawn point id, ped model hash, x, y, z, heading, interior, name');
		saveTextFile(this.SPAWN_POINTS_FILE_PATH, arr.join("\n"));
	}
	
	getRandomSpawnPoint()
	{
		let spawnPoints = this.getSpawnPoints();
		if(spawnPoints.length == 0)
			return this.SPAWN_POINT_WHEN_SPAWN_POINTS_FILE_IS_EMPTY;
		return spawnPoints[this.rand(0, spawnPoints.length - 1)];
	}
};

new SpawnPoints();