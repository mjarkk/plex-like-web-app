# A plex like web app
## Goal
A site where you can view you images, movies and music on the 2017 way.
"2017 way" This means it needs to be stabele so if you are offline the data still loads,
all the animations are somooth,
auto changing resolution in movies depending on your network speed,
all api data is secure from end to end,
you can share everyting,
load a page before you have even clicked it
and it's of course mobile friendly
### Some other Goals
- Changing theme's light, dark and maybe custom css theme's
- Images are loading like medium's
- And ofcourse all basic things that a server/client needs: (login, settings, etc)

## How to use
### Install
- open a terminal and type:
- git clone https://github.com/mjarkk/plex-like-web-app
- yarn install

### Start
- yarn start

### Update
- in a terminal type: yarn
- if that doesn't work remove the node_modules folder and try start again

### configure
open in a text editor **conf/servconfig.json**

## Bugs
- On windows the server will not stop running if you press ctrl + c, Solution: on windows open task manager and kill all nodejs services
- If you change dev mode in the settings the server will not stop the live reload or will not start live the live reload, Solution: manually restart the server.

## Working on:
- :heavy_check_mark: Settings
- :heavy_check_mark: Images list
- :heavy_check_mark: Image Viewer
- :x: Movies list
- :x: Movies viewer
- :x: Home
- :x: Music
