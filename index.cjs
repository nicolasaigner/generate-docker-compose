/*
const { program } = require('commander');

program
    .option('--first')
    .option('-s, --separator <char>');

program.parse();

const options = program.opts();
const limit = options.first ? 1 : undefined;
console.log(program.args[0].split(options.separator, limit));*/
const prompts = require('prompts');
prompts.override(require('yargs').argv);
const httpClient = require('request-promise-native');
const exec = require('child_process').exec;
const fs = require('fs');

let dockerHubAPI = require('docker-hub-api');


(async () => {

    // check if exist .config file in home directory
    if (!fs.existsSync('.config')) {
        //    check if docker-hub.username and docker-hub.password values exists in .config file
        if (!fs.existsSync('.config/docker-hub.username') || !fs.existsSync('.config/docker-hub.password')) {
            // if not exists, ask for username and password
            const response = await prompts([
                {
                    type: 'text',
                    name: 'username',
                    message: 'Enter your Docker Hub username'
                },
                {
                    type: 'password',
                    name: 'password',
                    message: 'Enter your Docker Hub password'
                }
            ]);
            // write username and password to .config file
            fs.writeFileSync('.config/docker-hub.username', response.username);
            fs.writeFileSync('.config/docker-hub.password', response.password);

            // get token and save it to .config file
        } else {
            const username = fs.readFileSync('.config/docker-hub.username').toString();
            const password = fs.readFileSync('.config/docker-hub.password').toString();
            await dockerHubAPI.login(username, password).then(function(info) {
                fs.writeFileSync('.config/docker-hub.token', info.token);
                // console.log(`My Docker Hub login token is '${info.token}'!`);
            });

            await dockerHubAPI.setLoginToken(fs.readFileSync('.config/docker-hub.token').toString());
        }
    }

    /*await dockerHubAPI.repositories('nicolasaigner').then((data) => {
        console.log('REPOSITORIES', data);
    }).catch((err) => {
        console.log('ERROR GET REPOSITORIES', err);
    });*/

    let images = await prompts([
        {
            type: 'select',
            name: 'frontend',
            message: 'What is your preferred frontend framework?',
            choices: [
                { title: 'Angular', value: 'angular' },
                { title: 'React', value: 'react' },
                { title: 'Vue', value: 'vue' },
                { title: 'None', value: 'none' },
            ]
        },
        {
            type: 'select',
            name: 'backend',
            message: 'What is your preferred backend framework?',
            choices: [
                { title: 'Node', value: 'node' },
                { title: 'Express', value: 'express' },
                { title: 'None', value: 'none' },
            ]
        },
        {
            type: 'select',
            name: 'database',
            message: 'What is your preferred database?',
            choices: [
                { title: 'MongoDB', value: 'mongo' },
                { title: 'MySQL', value: 'mysql' },
                { title: 'None', value: 'none' },
            ]
        },
    ]);

    let frontendTags = [{
        title: 'latest',
        value: 'latest'
    }];
    await dockerHubAPI.tags('nicolasaigner', `${images.frontend}-docker`).then((data) => {

        if (!data.errinfo) {
            frontendTags = data.map((item) => {
                return {
                    title: item.name,
                    value: item.name
                };
            });
        }

        // console.log('TAGS', data);
    }).catch((err) => {
        console.log('ERROR GET TAGS FRONTEND', err);
    });

    let backendTags = [{
        title: 'latest',
        value: 'latest'
    }];
    await dockerHubAPI.tags('nicolasaigner', `${images.backend}-docker`).then((data) => {
        if (!data.errinfo) {
            backendTags = data.map((item) => {
                return {
                    title: item.name,
                    value: item.name
                };
            });
        }


        // console.log('TAGS', data);
    }).catch((err) => {
        console.log('ERROR GET TAGS BACKEND', err);
    });

    let databaseTags = [{
        title: 'latest',
        value: 'latest'
    }];
    await dockerHubAPI.tags('nicolasaigner', `${images.database}-docker`).then((data) => {

        if (!data.errinfo) {
            databaseTags = data.map((item) => {
                return {
                    title: item.name,
                    value: item.name
                };
            });
        }


        // console.log('TAGS', data);
    }).catch((err) => {
        console.log('ERROR GET TAGS DATABASE', err);
    });

    let tags = await prompts([
        {
            type: 'select',
            name: 'frontend',
            message: 'What is your preferred frontend tag?',
            choices: frontendTags
        },
        {
            type: 'select',
            name: 'backend',
            message: 'What is your preferred backend tag?',
            choices: backendTags
        },
        {
            type: 'select',
            name: 'database',
            message: 'What is your preferred database tag?',
            choices: databaseTags
        }
    ]);

    console.log('TAGS', tags);

    let result = {
        frontend: {
            image: `nicolasaigner/${images.frontend}-docker`,
            tag: tags.frontend
        },
        backend: {
            image: `nicolasaigner/${images.backend}-docker`,
            tag: tags.backend
        },
        database: {
            image: `nicolasaigner/${images.database}-docker`,
            tag: tags.database
        }
    }

    console.log('RESULT', result);

    /* // get list of repositories to nicolasaigner
     await dockerHubAPI.repositories(dockerHubRegister.user).then((data) => {
         console.log('REPOSITORIES', data);
     });*/

    // dockerHubAPI.repository('nicolasaigner', '_').then((repositories) => {
    //     console.log('Repositories:', repositories);
    // });

    /*const frontend = await prompts([
        {
            type: 'select',
            name: 'frontend',
            message: 'What is your preferred frontend framework?',
            choices: [
                { title: 'Angular', value: 'angular' },
                { title: 'React', value: 'react' },
                { title: 'Vue', value: 'vue' },
                { title: 'None', value: 'none' },
            ]
        }
    ]);*/

    /*const backend = await prompts([
        {
            type: 'select',
            name: 'backend',
            message: 'What is your preferred backend framework?',
            choices: [
                { title: 'Node', value: 'node' },
                { title: 'Express', value: 'express' },
                { title: 'None', value: 'none' },
            ]
        }
    ]);

    const database = await prompts([
        {
            type: 'select',
            name: 'database',
            message: 'What is your preferred database?',
            choices: [
                { title: 'MongoDB', value: 'mongo' },
                { title: 'MySQL', value: 'mysql' },
                { title: 'None', value: 'none' },
            ]
        },
        {
            type: 'text',
            name: 'databaseName',
            message: 'What is your preferred database name?',
            initial: 'my_database',
            validate: value => value.length > 0 ? true : 'Please enter a database name'
        },
        {
            type: 'text',
            name: 'username',
            message: 'What is your preferred database user?',
            initial: 'my_user',
            validate: value => value.length > 0 ? true : 'Please enter a database user'
        },
        {
            type: 'password',
            name: 'password',
            message: 'What is your preferred database password?',
            initial: 'my_password',
            validate: value => value.length > 0 ? true : 'Please enter a database password'
        }
    ]);*/

    // get list of repositories to nicolasaigner and tags images
    // http get list of repositories to nicolasaigner and tags images



    // console.log({ ...frontend, ...backend, ...database });

    // docker search --filter=starts=10 --filter=is-official=true --filter=is-automated=false --filter=stars=>100

    // create docker-compose file
    /*const fs = require('fs');
    const path = require('path');
    const dockerComposeFile = path.join(__dirname, 'docker-compose.yml');
    // write docker-compose file
    fs.writeFileSync(dockerComposeFile, `
version: '3.7'
services:
    frontend:
        image: ${frontend.frontend}
        ports:
            - "4200:4200"
        volumes:
            - ./frontend:/usr/src/app
        environment:
            - NODE_ENV=development
            - NODE_PORT=4200
            - NODE_HOST=${backend.backend}
        depends_on:
            - backend
    backend:
        image: ${backend.backend}
        ports:
            - "3000:3000"
        volumes:
            - ./backend:/usr/src/app
        environment:
            - NODE_ENV=development
            - NODE_PORT=3000
        depends_on:
            - database
    database:
        image: ${database.database}
        ports:
            - "27017:27017"
        environment:
            - MONGO_INITDB_ROOT_USERNAME=${database.username}
            - MONGO_INITDB_ROOT_PASSWORD=${database.password}
            - MONGO_INITDB_DATABASE=${database.databaseName}
    `);

    // save file in project directory
    const projectDir = path.join(__dirname, './');

    fs.copyFileSync(dockerComposeFile, path.join(projectDir, 'docker-compose.yml'));

    // question run docker-compose
    const runDockerCompose = await prompts([
        {
            type: 'confirm',
            name: 'runDockerCompose',
            message: 'Do you want to run docker-compose?',
            initial: true
        }
    ]);

    if (runDockerCompose.runDockerCompose) {
        const exec = require('child_process').exec;
        // run docker-compose and log output
        exec('docker-compose up -d', { cwd: projectDir }, (err, stdout, stderr) => {
            console.log('ERROR', err);
            console.log('STDOUT', stdout);
            console.log('STDERR', stderr);
        });
    }*/
})();