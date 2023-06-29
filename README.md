# Bob: An AI GM's assistant
 
This is a little project for helping me (and you) use ChatGPT to assist with GM duties. 

It's a baby project. So, have fun. PR's welcome. 

## Features

* Maintains the conversation ont he client
* Allows the user to set the AI's system role on first post (see the spiffy dropdown), setting the tone for the conversation. 
* Allows the user to export the conversation for continuity
* Allows the user to import an old conversation to pick up where you left off. 
* Exports the conversation to a markdown file. 

## Notes

* You'll need to add a .env file with your OPENAI api KEY. (OPENAI="$foo")
* As of this writing, it nags you if you navigate away without exporting your conversation. This is so that I don't forget to save my work. 