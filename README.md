# generator-impactplusplus

> [Yeoman](http://yeoman.io) generator that scaffolds out an [impact++](http://collinhover.github.io/impactplusplus/) game


## Getting Started

install [Node.js/npm](http://nodejs.org/)

install Yeoman
```bash
$ npm install -g yo
```
install generator-impactplusplus
```bash
$ npm install -g generator-impactplusplus
```
run the generator to build a quick impact++ scaffold
```bash
$ yo impactplusplus
```

## Documentation
**generator-impactplusplus** supports these other commands too!

### update-impactjs
Update to the latest version of ImpactJS, or install ImpactJS if it is not already installed.

```bash
$ yo impactplusplus:update-impactjs "MY-LICENSE-KEY"
```
to download the latest version of ImpactJS

**or**

```bash
$ yo impactplusplus:update-impactjs "../path/to/impactjs"
```
to copy ImpactJS from another local directory 

## Version History

### 0.0.5
 - Fix for [#2 - Entering ImpactJS key not working](https://github.com/racingcow/generator-impactplusplus/issues/2)

### 0.0.4
 - Fix for [#1 - Generator "loops" when calling update-impactjs subgenerator](https://github.com/racingcow/generator-impactplusplus/issues/1)

### 0.0.2
 - Move download/copy of impactjs to subgenerator

### 0.0.1
- Generate empty game
- Generate impact++ sample game (jumpnrun or supercollider)
- Download or copy of impactjs version
- Download latest impact++ version

## License

MIT
