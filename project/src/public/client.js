let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    selectedRover: null
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (newState) => {
    const oldState = Immutable.Map(store);
    store = oldState.merge(newState).toJS();
    render(root, store, App)
}

// make render a high order function that takes a component to render
const render = async (root, state, mainComponent) => {
    root.innerHTML = mainComponent(state)
}


// create content
const App = (state) => {
    const { user, selectedRover, apod } = state

    return `
        <header></header>
        <main class="main">
            ${Greeting(user.name)}
            <section>
                <p class="text">
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${ImageOfTheDay(apod)}
            </section>
            <section>
                ${Actions()}
            </section>
            <section>
                ${Rover(selectedRover)}
            </section>
            
        </main>
        <footer class = "footer">Office of the Chief Information Officer<br>
        nasa-data@lists.arc.nasa.gov</footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store, App)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1 class="greeting">Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)

    if (!apod || photodate === today.getDate() ) {
        return getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>`);
    }
}

const Actions = () => {
    
    const buttons = store.rovers.map(roverName => {
        const roverButton = `<button id="${roverName}" class="buttons" onclick="getRoverInfos(this.id)">${roverName}</button>`;
        return roverButton;
    });
    return buttons.join(' ');
    
}

const Rover = (rover) => {
    if(!rover){
        return "";
    }
    const images = rover.recentPhotos.map(RoverImage)

    return  `
    <div><span class="data">Rover name:</span><span class="answer">${rover.name}</span></div>
    <div><span class="data">Landing date:</span><span class="answer">${rover.landing_date}</span></div>
    <div><span><span class="data">Launch date:</span><span class="answer">${rover.launch_date}</span></div>
    <div><span><span class="data">Rover status:</span><span class="answer">${rover.status}</span></div>
    <div>${images.join(" ")}</div>
    `
}

const RoverImage = (photo) => {
    return `<img src="${photo.img_src}"  width="100" height="100">`
}

// ------------------------------------------------------  API CALLS
// Example API call
const getImageOfTheDay = async () => {

    return await fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore({ apod }))
}

const getRoverInfos = (roverName) => {
    return fetch(`http://localhost:3000/rovers?name=${roverName}`)
        .then(res => res.json())
        .then(rover => updateStore({ selectedRover: rover }))
}
