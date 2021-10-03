#Get Word Definitions And Convert Them To HTML

I made this project because I had just finished reading the book Dune, and I kept track of all the words I didn't know yet. I wanted to study the words in this flashcard program called Anki. However that's where the headaches began. It required me to manually get all the definitions of the words from somewhere and then format them into HTML myself. On top of that there were quite a few words (see `inputData/sampleWordList.txt`), so I didn't want to bother doing manual labor. Programming to the rescue!

This project parses all the words (separated by a newline) from the `inputData/wordList.txt` file. It then goes through each word and gets its definition from the Oxford dictionary (https://www.oxfordlearnersdictionaries.com/) API. It proceeds to parse the data and format it into HTML (I tried to emulate the iOS/macOS 'look up' style) before finally appending that data to an output file in the `outputData` folder.

## How to start it
* First you need Node, preferably v12.22.5.
* Get access to your API credentials through https://developer.oxforddictionaries.com/
* Create a `.env` file in the root and add the following credentials to it:
```sh
APP_ID=<your app_id>
APP_KEY=<your app_key>
```
* Run `npm install`
* Fill the `inputData/wordList.txt` with the words you seek to learn, separated by a newline (use the 'enter' or 'return' keys)
* Run `npm start`

Finally, you can simply import that file into Anki by going to Decks -> Import File and then navigating to the correct file in `outputData`.

Enoy :)
