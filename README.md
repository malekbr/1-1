

# 1 + 1

An app developed for IFTTT internship application by Malek Ben Romdhane.
This app runs from the command line.

## Usage

You need node.js installed to run this app.
When running for the first time, please run `npm install`.
To run the app, run the command `node main`.

The commands are as follows (this list is accessible through the command-line using the help function) :

* `help` : Shows this text.
* `list` : Lists all teams and their members.
* `toggleSave` : Enables or disables autosave.
* `generate [file]` : Generates the next pairing. If file is specified, it appends the generated data to the file. There shouldn't be quotes around the file path if it contains spaces.
* `load file` : Loads a file to the database. The file needs to have lines that are either of the form
   - `team team-name` which adds a team to the database called team-name.
   - `add email team-name` which adds the email to the team. 
   Empty lines are tolerated. The file is case insensitive.
* `addTeam team`: Adds team to the database
* `addPerson email team` : Adds person to team (needs to exist).
* `removePerson email` : Removes person from all teams.
* `removeFromTeam email team` : Removes person from team (needs to exist).
* `reset` : Deletes all data stored and computed. IRREVERSABLE.
* `save` : Commits unsaved changes to the database.
* `exit` : Exits the application.

Example of usage :

```
Welcome to 1 + 1 (beta).
Data will be saved automatically at each command. To undo that for
performance reasons, please type in toggleSave.
For help, type help.
> load exampleInput.data
load exampleInput.data
Loading exampleInput.data
Done loading
Saving...
> list
The Beatles
 * paul@mccartney.org
 * john@lennon.com
 * george@harrison.org
 * ringo@starr.org
The Quarrymen
 * john@lennon.org
 * paul@mccartney.org
 * stu@sutcliffe.org
Wings
 * paul@mccartney.org
 * linda@mccartney.org
Plastic Ono Band
 * john@lennon.org
 * yoko@ono.org
Traveling Wilburys
 * george@harrison.org
 * tom@petty.org
 * roy@orbison.org
> generate output.data
Saving...
> generate output.data
Saving...
> generate
Generating new pairing :
Thu Oct 02 2014 04:28:13 GMT-0400 (Eastern Daylight Time)
paul@mccartney.org with ringo@starr.org
john@lennon.com with george@harrison.org
john@lennon.org with stu@sutcliffe.org
tom@petty.org with roy@orbison.org
---
Saving...
> exit
Saving...
Exiting...
```

## Strategy employed for generating 1+1's

The strategy relies on sorting pairings by the number of times they have been used, then going through each pairing and adding it to the list of selected pairings if none of its two members were in a previously selected pairing.
The pairings are remembered in the database and the counters are only reset if the database has been reset.
This strategy does not guarantee equal number of pairings among different combinations, but it does try to keep such equality within team members. It also tries to diversify when possible.

## Testing methodology

There were two steps of testing, one at the development level and one at the finished product level.

Each function developed is tested, using a mixture of black-box and white-box tests, and equipped with multiple exceptions to fail fast when possible.
The functioning of the functions is also tracked through other tools like an sqlite database viewer to make sure that everything is working as expected.

At the finished product level, I tried to run the product against as many different possibilities of input as possible and as many corner cases,
both valid inputs and invalid inputs to make sure that the app fails well.

## Things I found interesting / difficult

I don't think node.js is the most suitable for the development of this app in this form, giving its asynchronous nature, and how important synchronization is at some points.
I managed to avoid complications by separating the saving (which was only asynchronous by limitation of the driver) and all other modifications, which turns out, can be very efficient given the maximum speed of SQLite and the fact that saving is run in the background.

