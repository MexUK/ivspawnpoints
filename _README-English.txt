How to install

1. Place all files from the directory of this readme file, into /your_server_folder/resources/ivspawnpoints/ <here>

2. Then update your server.xml to load the resource:
	<resources>
		<resource src="ivspawnpoints" />
	</resources>

3. Add your player username to the commandpermissions.txt file.
Keep this file blank when your server is live, or disable the add/remove spawn point commands when done.

4. If the server is running, you'll need to restart it for the changes to apply.

------------------------

commandpermissions.txt

This file contains the player usernames allowed to use the /addspawnpoint and /removespawnpoint commands.

PLEASE NOTE:
-Only have usernames in this file when the server is passworded, or ran locally and not listed in the server browser!
-Otherwise you risk username imposters, because this resource doesn't come with login verificiation for players!

This file is not updated automatically.
Open the file with notepad or any text file editor, add one username per line.
You don't need to restart the server if it is already running.
For example:

Mex
Mex2
Username3

------------------------

spawnpoints.txt

This file contains the spawn point data. (E.g. position).

The /addspawnpoint and /removespawnpoint commands will update this file automatically when used sucessfully.
You can also add/remove lines from the this file when the server is running, without needing to restart the server.

Don't format this file manually with custom tabs or spacing, because the file can be updated automatically.

------------------------

Customization

Open server.js with notepad or any text file editor.


To disable chat messages when a player spawns:
Change:
		this.spawnChatMessages = true;
to:
		this.spawnChatMessages = false;


To disable the add/remove spawn point commands:
Change:
		this.addRemoveCommandsEnabled = true;
to:
		this.addRemoveCommandsEnabled = false;


Please note:
For script files (e.g. js, not txt), a server restart is required for the changes to apply.

