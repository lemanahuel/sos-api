# SOS-API

# Requisitos

- git
- node
- npm
- bower
- grunt

# Instalacion

```sh
$ npm i --save
$ bower i --save
```

# Levantar

```sh
$ grunt

http://localhost:3001
```

# Actualizar

Descargar NCU e instalarlo de forma global

- <https://github.com/tjunnone/npm-check-updates>

```
$ npm install -g npm-check-updates
```

```
$ ncu //checkea el package.json
$ ncu -u -a //actualiza el package.json
$ npm install --save-dev //instala las actualizaciones
```

```
$ ncu -m bower //checkea el bower.json
$ ncu -m bower -u -a //actualiza el bower.json
$ bower install //instala las actualizaciones
```

Enjoy!
