# [SimpleArmory](http://simplearmory.com) <img src="https://github.com/kevinclement/SimpleArmory/raw/master/app/images/shield.png?raw=true" align="left" height="32" width="32" style="max-width:100%;align-vertical: center;vertical-align: center;line-height: 20px;margin-top: 15px;margin-right: 5px;">
World of Warcraft armory site that presents your armory in a simple manor.

======================

This is the code used to build out [simplearmory.com](http://simplearmory.com) website.  Contributions welcome.

[![Example armory for Marko@Proudmoore][2]][1]

[1]: http://simplearmory.com/#/us/proudmoore/marko/
[2]: screenshot.png (Example armory for Marko@Proudmoore)

## Clone App

```bash
git clone https://github.com/kevinclement/SimpleArmory.git SA
cd SA
npm install
```

## Start Development

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Dev Tasks

- `npm run build` Creates a production build of the site
- `npm run start` Serves an already-built site
- `npm run adapt` Prepares the production build for deployment to netlify

To test for missing icons you can do a `showall=true` from the url.
- [Achievements - Quests](http://localhost:3000/?showall=true#/us/proudmoore/marko/achievements/quests)

Authors:
-------

  * Kevin Clement [@kevinclement](https://twitter.com/kevinclement) / [github](https://github.com/kevinclement)
