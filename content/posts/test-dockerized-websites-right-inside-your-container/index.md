+++
categories = ['Development', 'Tooling', 'Testing']
date = '2023-08-15'
description = 'selenium/standalone-chrome is such a tool that you can use to automate/debug/run your frontend/backend/whatever integration and e2e tests.'
tags = ['docker', 'selenium', 'chrome', 'standalone-chrome']
title = 'Test Dockerized Websites Right Inside Your Docker Container'
draft = false
+++

## The Case

I recently developed a website that communicated with six different APIs. To manage this, I configured a docker-compose and launched them within a shared bridged network. For the purpose of manual testing, which involved interacting with the website through various actions, I had a couple of options:

1. Expose and map each API to distinct ports, and then configure the website to use the corresponding API URLs on the host machine.
2. Isolate all components within dockerized environments and utilize the shared network for comprehensive testing.

I preferred the second approach because it allowed me to isolate everything, allowing me to conduct thorough testing in a controlled environment. After exploring various methods, I came across a solution: the utilization of the "selenium/standalone-chrome" docker image.

This particular Linux-based image comes equipped with both the chrome-webdriver and a VNC server. As a result, I can access the environment through a VNC or noVNC client directly within a web browser.


## The Code

Here's a simple docker-compose.yml that you can see and explore in a minute!


```yaml {path="docker-compose.yml"}
version: "3.8"

services:
  web:
    image: nginxdemos/hello:latest
    networks:
      - mynet

  browser:
    image: selenium/standalone-chrome:latest
    ports:
      - 7900:7900
    shm_size: 2g # Incrase shared memory from 64M (default) to 2g
    networks:
      - mynet

networks:
  mynet:
    driver: bridge
```

Then, spawn the docker containers:
```bash
$ docker-compose up
```

Then, go to:
[http://localhost:7900/?autoconnect=1&resize=scale&password=secret](http://localhost:7900/?autoconnect=1&resize=scale&password=secret)

The password is `secret` by default.

See it in action, connected via noVNC in host's Chrome.

![Demo](ss-demo.png)


## More

Another tool that I found doing so:
The `selenium/standalone-chrome` is a part of Selenium Grid, which lets me run tests in parallel. Details here: [https://www.selenium.dev/documentation/grid/getting_started/](https://www.selenium.dev/documentation/grid/getting_started/)
