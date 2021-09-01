# AnthonyCecconato_6_02072021 - So Pekocko

[![DeepScan grade](https://deepscan.io/api/teams/14397/projects/18081/branches/433392/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=14397&pid=18081&bid=433392)
[![Known Vulnerabilities](https://snyk.io/test/github/acecconato/AnthonyCecconato_6_02072021/badge.svg)](https://snyk.io/test/github/{username}/{repo})

# Installation
> `git clone https://github.com/acecconato/AnthonyCecconato_6_02072021.git`

> `cd AnthonyCecconato_6_02072021`

> `npm install`

# Configuration

> Create the .env file from the .env.example
>
> `cp .env.example .env`
>
> Then configure the .env file (at least change the mongodb url)

# Launch the application

> npm run serve

# Documentation

> SwaggerUI documentation is accesible on http://localhost:3000/api-docs by default.
> 
> You need to register, login, copy the returned json web token and paste it to the Authorization. 
> 
> The value should begin by: **Bearer** JWT.

# Good to know

- Uploaded images are going to the UPLOAD_DIR folder ; **/public/uploads** by default
- Log files are located in the **/var/logs** folder
- In development mode, errors are displayed in the console
