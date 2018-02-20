# [SimpleArmory](http://simplearmory.com) <img src="https://github.com/kevinclement/SimpleArmory/raw/master/app/images/shield.png?raw=true" align="left" height="32" width="32" style="max-width:100%;align-vertical: center;vertical-align: center;line-height: 20px;margin-top: 15px;margin-right: 5px;">
World of Warcraft armory site that presents your armory in a simple manor.

======================

This is the code used to build out [simplearmory.com](http://simplearmory.com) website.  Contributions welcome.

[![Example armory for Marko@Proudmoore][2]][1]

[1]: http://simplearmory.com/#/us/proudmoore/marko/
[2]: screenshot.png (Example armory for Marko@Proudmoore)

## Clone App

```shell
git clone https://github.com/kevinclement/SimpleArmory.git SA
cd SA
npm install
npm install -g grunt-cli bower
bower install
```

## Start Development

- run `grunt serve`
- point your browser to [localhost:9001](http://localhost:9001)

## Dev Tasks

- `grunt` builds the site full
- `grunt serve` runs the app in dev mode

To test changes I usually use a character that has a lot of achievements, mounts and pets from both factions.  I usually check out rankings on guildox.
- [Achievements - Horde](http://localhost:9001/#/us/Thrall/Ranklock)
- [Achievements - Alliance](http://localhost:9001/#/us/Proudmoore/Vanas)
- [Mounts - Horde](http://localhost:9001/#/us/thrall/shaketank/collectable/mounts)
- [Mounts - Alliance](http://localhost:9001/#/us/sargeras/Jramm/collectable/mounts)
- [Pets - Horde](http://localhost:9001/#/us/burning%20blade/mastr/collectable/companions)
- [Pets - Alliance](http://localhost:9001/#/eu/azuregos/%D0%BC%D0%B0%D1%80%D0%B8%D0%BE%D0%B4%D0%B0/collectable/companions)

Authors:
-------

  * Kevin Clement [@kevinclement](https://twitter.com/kevinclement) / [github](https://github.com/kevinclement)
