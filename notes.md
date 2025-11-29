# CS 260 Notes

[My startup - eztimes](https://startup.eztimes.me)

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)

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

## React Part 2: Reactivity EXAMPLE NOTES

This was a lot of fun to see it all come together. I had to keep remembering to use React state instead of just manipulating the DOM directly.

Handling the toggling of the checkboxes was particularly interesting.

```jsx
<div className="input-group sound-button-container">
  {calmSoundTypes.map((sound, index) => (
    <div key={index} className="form-check form-switch">
      <input
        className="form-check-input"
        type="checkbox"
        value={sound}
        id={sound}
        onChange={() => togglePlay(sound)}
        checked={selectedSounds.includes(sound)}
      ></input>
      <label className="form-check-label" htmlFor={sound}>
        {sound}
      </label>
    </div>
  ))}
</div>
```
