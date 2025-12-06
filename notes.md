# CS 260 Notes

[My startup - eztimes](https://startup.eztimes.me)

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)

## Project Plans
Remove unnecssary function memoization

### Offline Sync
"How should it work for the visitor?"

Guest -> localstorage (permanent, shared for all guests!)
User -> sessionstorage (browser session and user-specific)

Case A: 
I use the site as a guest. I like it, so I create an account. My data in the browser gets migrated into the server, localstorage is flushed, and I seamlessly continue working.
Case B:
I use the site as a user. I lose connection for a few hours, but I don't end my session. I continue to use the site and when I reconnect, my offline changes in sessionstorage are synced to the server.
Case C:
I use the site as a user. I lose connection for a few hours and I end my session. When I come back to the site, I'm logged out. Any changes I made while offline are lost.
Case D:
I use the site as a guest on my personal PC. I never create an account, but my data never goes away.
Case E:
I use the site as a guest on a public PC. I ignore any site warnings about using it on a public PC. Somebody else uses the site as a guest and will see my info.
Case F:
I use the site as a guest on a public PC. Somebody else logs in. My data is visible to them (in localstorage) but does not contaminate their data and vice-versa.
Case G:
I use the site as a user on a public PC. I log out when I'm done, but I don't close the browser. My data is not discoverable for the next guest or user.

RULES:
When a user logs in, we clean sessionstorage. (Closing the tab resets session storage)
When a user logs out, we clean sessionstorage.
Guest data is shared and permanent in localstorage

## AWS

My elastic IP address is: 54.243.35.4

## Caddy

No problems worked just like it said in the [instruction](https://github.com/webprogramming260/.github/blob/main/profile/webServers/https/https.md).

## HTML

Make sure you are using the correct service when running the deployment script! Consider creating a stripped down version just for updating the startup service.


## CSS
flex-direction means "put content in a single row/column," not "put content into separate rows/columns"

Important note about Bootstrap: *"You don't need to worry about this now, but later on, when we introduce the downloading of JavaScript packages, you can use the Node Package Manager (NPM) to download Bootstrap and include it in your source code. That way you don't have to rely on someone else's server to provide you with a vital piece of your application. For future reference, to include Bootstrap in your application using NPM you would run the following from your console."* `npm install bootstrap@5.3.3`

Padding: space between a container's border and its interior elements. INTERIOR SPACE.

Margin: space between a container's border and its parent element or other sibling elements. EXTERIOR SPACE.

## React Part 1: Routing

Porting to React:
Install Vite + React
Set up the entrypoint for html and react
Create your app.jsx
Set up Browser Router
Translate existing html files into jsx files
Migrate and import CSS as needed

I have installed bootstrap and react-bootstrap! If it is not used, considered uninstalling.

`import React from 'react';` is necessary in JSX files even though VS Code says it isn't used. Spooky!

A very important note regarding scoped selectors when using CSS modules: only class selectors (i.e. `.main`) are scoped, even in a modules CSS file! An element selector (i.e. `main`) is still treated as a global selector.

## React Part 2: Reactivity
A bunch of interesting reading about Javscript function logic, including some methods to make thread-safe operations, from [the 260 docs](https://github.com/webprogramming260/.github/blob/main/profile/javascript/arrow/arrow.md)

Reminder that Hooks [must be called at the top scope of the function and cannot be called inside of a loop or conditional.](https://github.com/webprogramming260/.github/blob/main/profile/webFrameworks/react/hooks/hooks.md)

Extremely cool use of spread operator:
```javascript
people = people.map(person =>
  person.name === "Bob"
    ? { ...person, ...update, occupation: "drummer" }
    : person
);
```
This use of spread operators will overwrite shared values from left to right. You can put anything inside of update!

## React Part 2: Reactivity

## Service

I made an important change to the deployment script. `cp -r service/routers build/` will recursively go through the routers folder and copy everything into a routers folder in the build folder. This is important to maintain project structure on the prod server.

## Websocket
Sync rule:
Every user client auto syncs on start
Every action triggers an evaluation: which user and client sent it? For every connected client belonging to that user that does not match the action-provider, force a sync