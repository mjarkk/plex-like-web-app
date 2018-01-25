# A plex like web app
## Goal
A site where you can view you images, movies and music on the 2017 way.  
"2017 way" means it needs to be stabele so if you are offline the data still loads,  
All the animations are somooth,  
Auto changing resolution in movies depending on your network speed,  
All api data is secure from end to end,  
You can share everyting,  
Load a page before you have even clicked it  
And it needs to be mobile friendly of course.  
### Some other Goals  
- Changing theme's light, dark and maybe custom css theme's  
- Images are loading like medium's  
- And ofcourse all basic things that a server/client needs: (login, settings, etc)  

## How to use
### Before you install!
- This project will take up a lot of space currently it doesn't do anything related to disk space optimization.
- This project is not close to a Alpa, Beta, whatever release.
- Make sure you have a backup of you're files because there are bugs OR sandbox the project.

### Install
- Open a terminal and type:
- ```git clone https://github.com/mjarkk/plex-like-web-app```
- ```yarn install```

### Start
- ```yarn start```

### Update
- Get the latest version of this repo  
- Open a terminal in the project folder and type: ```yarn```
- If that doesn't work remove the node_modules folder and try start again

### configure
Open in a text editor **conf/servconfig.json**

## Bugs
**NOTE: this is a list of only the biggest problems**  
- On windows the server will NOT stop running if you press ctrl + c, Solution: on windows open task manager and kill all nodejs services
- If you change dev mode in the settings the server will not stop the live reload or will not start live the live reload, Solution: manually restart the server.
- If you see a lot of: [nodemon] files triggering change check: some/directory/some.file, Solution: npm i -g nodemon@debug
- On linux (probably the same on mac and windows) chrome will eat you're RAM when working with the shaka player
- Sometimes the ```serv/video.js``` file will fail on start because the database is not ready  

## Tested on:
### Linux (ubuntu 17.10)
- serv.manager.js :heavy_check_mark:
- serv.js :heavy_check_mark:
- serv/img.js :heavy_check_mark:
- serv/js.js :heavy_check_mark:
- serv/sass.js :heavy_check_mark:
- serv/database.js :heavy_check_mark:
- serv/errorhandeler.js :question: (make the file but never tested if the file works)
### Windows
- * :question: (Have not tested on windows)
### Mac OS
- * :question: (Have not tested on Mac OS)

## Already started working on:
- :heavy_check_mark: Settings
- :heavy_check_mark: Images list
- :heavy_check_mark: Image Viewer
- :heavy_check_mark: Movies list
- :heavy_check_mark: Movies viewer
- :x: Home
- :x: Music
- :heavy_check_mark: URL handler
- :x: Switch from a white to black color scheme inside settings
- :x: Make tests to check if everyting works fine
- :heavy_check_mark: Setup
- :heavy_check_mark: Add [The Movie DB API](https://www.themoviedb.org/) to the movie section on
